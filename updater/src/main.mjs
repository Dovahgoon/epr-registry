import 'dotenv/config';
import { callRpc } from './lib/supabase.mjs';
import { sleep } from './lib/utils.mjs';

// ---- Implemented country fetchers (you already have these files)
import { fetchDE } from './sources/de.mjs';
import { fetchDK } from './sources/dk.mjs';
import { fetchHR } from './sources/hr.mjs';
import { fetchSE } from './sources/se.mjs';
import { fetchES } from './sources/es.mjs';
import { fetchFR } from './sources/fr.mjs';
import { fetchIT } from './sources/it.mjs';
import { fetchBE } from './sources/be.mjs';
import { fetchNL } from './sources/nl.mjs';
import { fetchAT } from './sources/at.mjs';

// ---- Fallback fetcher for countries not implemented yet
const emptyFetcher = async () => ({ regulators: [], pros: [] });

// ---- Target RPC wrapper (DB function you created in SQL)
const UPSERT_PRO_FN = 'upsert_pro_api';

// ---- We prefer this scope but will fallback if enum differs in DB
const PREFERRED_SCOPE = 'packaging';
const SCOPE_FALLBACKS = [
  'household', 'commercial', 'both', 'packaging_waste', 'pack', 'general', 'other'
];

// ---- Country → fetcher map (EU-27)
const countryFetchers = {
  AT: fetchAT, BE: fetchBE, BG: emptyFetcher, CY: emptyFetcher, CZ: emptyFetcher,
  DE: fetchDE, DK: fetchDK, EE: emptyFetcher, ES: fetchES, FI: emptyFetcher,
  FR: fetchFR, GR: emptyFetcher, HR: fetchHR, HU: emptyFetcher, IE: emptyFetcher,
  IT: fetchIT, LT: emptyFetcher, LU: emptyFetcher, LV: emptyFetcher, MT: emptyFetcher,
  NL: fetchNL, PL: emptyFetcher, PT: emptyFetcher, RO: emptyFetcher, SE: fetchSE,
  SI: emptyFetcher, SK: emptyFetcher,
};

// ---- CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { all:false, country:null, dry:false };
  for (let i=0;i<args.length;i++) {
    const a = args[i];
    if (a === '--all') opts.all = true;
    else if (a === '--dry') opts.dry = true;
    else if (a === '--country') opts.country = args[++i];
    else if (a === '--help') {
      console.log(`Usage:
  node src/main.mjs --all [--dry]
  node src/main.mjs --country DE [--dry]`);
      process.exit(0);
    }
  }
  return opts;
}

async function upsertRegulator(iso, r) {
  await callRpc('upsert_regulator', {
    p_iso: iso,
    p_name: r.name,
    p_role: r.role || 'authority',
    p_url: r.url || null,
    p_source_url: r.sourceUrl || null,
  });
}

/**
 * Upsert a PRO with automatic scope fallback (handles enum differences).
 * Always calls the unambiguous wrapper RPC: upsert_pro_api
 */
async function upsertProWithFallback(iso, p) {
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
      // IMPORTANT: explicit wrapper call removes overloading ambiguity
      await callRpc(UPSERT_PRO_FN, {
        p_iso: iso,
        p_name: p.name,
        p_url: p.url || null,
        p_source_url: p.sourceUrl || null,
        p_scope: scope,          // enum in DB; wrapper requires it
        p_materials: materials,  // always an array
      });
      if (scope !== initial) {
        console.warn(`  [scope-fallback] Used '${scope}' for PRO "${p.name}" (${iso})`);
      }
      return; // success
    } catch (e) {
      const msg = String(e && e.message || '');
      if (msg.includes('22P02') || msg.includes('invalid input value for enum')) {
        lastErr = e;            // enum mismatch → try next
        continue;
      }
      throw e;                  // not a scope issue
    }
  }
  const tried = toTry.join(', ');
  throw new Error(`All scope candidates failed for PRO "${p.name}" (${iso}). Tried: [${tried}]. Last error: ${lastErr && lastErr.message}`);
}

// ---- Upsert one country
async function upsertCountry(iso) {
  const fetcher = countryFetchers[iso];
  if (!fetcher) { console.warn(`[SKIP] No fetcher mapping for ${iso}`); return; }
  console.log(`\n==> ${iso}`);

  const { regulators = [], pros = [] } = await fetcher();

  for (const r of regulators) {
    if (!r?.name) continue;
    console.log(`  Reg: ${r.name}`);
    if (process.env.SUPABASE_SERVICE_ROLE) {
      await upsertRegulator(iso, r);
      await sleep(150);
    }
  }

  for (const p of pros) {
    if (!p?.name) continue;
    console.log(`  PRO: ${p.name}`);
    if (process.env.SUPABASE_SERVICE_ROLE) {
      await upsertProWithFallback(iso, p);
      await sleep(150);
    }
  }
}

// ---- Main
async function main() {
  const { all, country } = parseArgs();

  if (!all && !country) {
    console.log('Use --all or --country <ISO>. Try --help');
    process.exit(1);
  }

  if (country) {
    const iso = country.toUpperCase();
    if (!countryFetchers[iso]) {
      console.warn(`[WARN] Unknown ISO "${iso}". Known: ${Object.keys(countryFetchers).join(', ')}`);
    }
    await upsertCountry(iso);
  } else if (all) {
    for (const iso of Object.keys(countryFetchers)) {
      await upsertCountry(iso);
    }
  }

  console.log('\nDone.');
}
main().catch(err => { console.error(err); process.exit(1); });
