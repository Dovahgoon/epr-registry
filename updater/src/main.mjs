import 'dotenv/config';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { callRpc } from './lib/supabase.mjs';
import { sleep } from './lib/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const SOURCES_DIR = path.join(__dirname, 'sources');

// --- Constants / defaults ----------------------------------------------------
const UPSERT_PRO_FN = 'upsert_pro_api';          // wrapper RPC you created in SQL
const PREFERRED_SCOPE = 'packaging';             // try this first
const SCOPE_FALLBACKS = [                        // then try these if enum mismatch
  'household', 'commercial', 'both', 'packaging_waste', 'pack', 'general', 'other'
];

const emptyFetcher = async () => ({ regulators: [], pros: [] });

// --- CLI args ----------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { all:false, country:null, dry:false };
  for (let i=0;i<args.length;i++) {
    const a = args[i];
    if (a === '--all') opts.all = true;
    else if (a === '--dry') opts.dry = true;
    else if (a === '--country') opts.country = String(args[++i] || '').toUpperCase();
    else if (a === '--help') {
      console.log(`Usage:
  node src/main.mjs --all [--dry]
  node src/main.mjs --country DE [--dry]`);
      process.exit(0);
    }
  }
  return opts;
}

// --- Dynamic discovery of country fetchers -----------------------------------
function isoFromFilename(f) {
  return f.replace(/\.(mjs|cjs|js)$/i, '').toUpperCase();
}

async function discoverFetchers() {
  let files = [];
  try { files = (await readdir(SOURCES_DIR)).filter(f => /\.(mjs|cjs|js)$/i.test(f)); }
  catch (e) {
    console.warn('[main] No sources directory found:', SOURCES_DIR, e?.message || e);
    return {};
  }

  const map = {};
  for (const f of files) {
    const iso = isoFromFilename(f);
    const url = pathToFileURL(path.join(SOURCES_DIR, f)).href;
    try {
      const mod = await import(url);
      const preferred = mod[`fetch${iso}`];
      const anyFunc = preferred || mod.default || mod.fetch || mod.main ||
        Object.values(mod).find(v => typeof v === 'function');
      if (typeof anyFunc === 'function') {
        map[iso] = anyFunc;
        console.log(`[main] Loaded ${f} as ${iso}`);
      } else {
        console.warn(`[main] ${f}: no callable export found; using empty fetcher`);
        map[iso] = emptyFetcher;
      }
    } catch (err) {
      console.warn(`[main] Failed to import ${f}:`, err?.message || err);
      map[iso] = emptyFetcher;
    }
  }
  return map;
}

// --- Upsert helpers -----------------------------------------------------------
async function upsertRegulator(iso, r, { dry } = {}) {
  if (dry || !process.env.SUPABASE_SERVICE_ROLE) return;
  await callRpc('upsert_regulator', {
    p_iso: iso, p_name: r.name, p_role: r.role || 'authority',
    p_url: r.url || null, p_source_url: r.sourceUrl || null,
  });
}

/** Upsert a PRO with automatic scope fallback (handles enum differences). */
async function upsertProWithFallback(iso, p, { dry } = {}) {
  if (dry || !process.env.SUPABASE_SERVICE_ROLE) return;

  const materials = Array.isArray(p.materials)
    ? p.materials.map(x => (typeof x === 'string' ? x.trim().toLowerCase() : '')).filter(Boolean)
    : [];

  const seen = new Set();
  const toTry = [];
  const initial = (p.scope && String(p.scope).trim()) || PREFERRED_SCOPE;
  for (const s of [initial, ...SCOPE_FALLBACKS]) {
    const key = String(s || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    toTry.push(key);
  }

  let lastErr = null;
  for (const scope of toTry) {
    try {
      await callRpc(UPSERT_PRO_FN, {
        p_iso: iso,
        p_name: p.name,
        p_url: p.url || null,
        p_source_url: p.sourceUrl || null,
        p_scope: scope,
        p_materials: materials,
      });
      if (scope !== initial) {
        console.warn(`  [scope-fallback] Used '${scope}' for PRO "${p.name}" (${iso})`);
      }
      return;
    } catch (e) {
      const msg = String((e && e.message) || '');
      if (msg.includes('22P02') || msg.includes('invalid input value for enum')) {
        lastErr = e; continue;
      }
      throw e;
    }
  }
  const tried = toTry.join(', ');
  throw new Error(
    `All scope candidates failed for PRO "${p.name}" (${iso}). Tried: [${tried}]. Last error: ${lastErr && lastErr.message}`
  );
}

// --- Orchestrate one country --------------------------------------------------
async function runCountry(iso, fetcher, { dry } = {}) {
  if (typeof fetcher !== 'function') {
    console.warn(`[SKIP] No fetcher for ${iso}`);
    return;
  }
  console.log(`\n[${iso}] fetching…`);
  const { regulators = [], pros = [] } = await fetcher();

  for (const r of regulators) {
    if (!r?.name) continue;
    console.log(`  Reg: ${r.name}`);
    await upsertRegulator(iso, r, { dry });
    await sleep(150);
  }

  for (const p of pros) {
    if (!p?.name) continue;
    console.log(`  PRO: ${p.name}`);
    await upsertProWithFallback(iso, p, { dry });
    await sleep(150);
  }
}

// --- Main ---------------------------------------------------------------------
async function main() {
  const { all, country, dry } = parseArgs();
  if (!all && !country) {
    console.log('Use --all or --country <ISO>. Try --help');
    process.exit(1);
  }

  const fetchers = await discoverFetchers();

  if (country) {
    const iso = country.toUpperCase();
    if (!fetchers[iso]) {
      console.warn(`[WARN] Unknown ISO "${iso}". Known: ${Object.keys(fetchers).sort().join(', ')}`);
    }
    await runCountry(iso, fetchers[iso] || emptyFetcher, { dry });
  } else if (all) {
    const isos = Object.keys(fetchers).sort();
    if (!isos.length) console.warn('[main] No source files found; nothing to run.');
    for (const iso of isos) {
      await runCountry(iso, fetchers[iso] || emptyFetcher, { dry });
    }
  }
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
/* END main.mjs */
/'@ | Set-Content -Encoding UTF8 -NoNewline 'updater/src/main.mjs'"