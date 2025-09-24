import 'dotenv/config';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { callRpc } from './lib/supabase.mjs';
import { sleep } from './lib/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const SOURCES_DIR = path.join(__dirname, 'sources');

const UPSERT_PRO_FN = 'upsert_pro_api';
const PREFERRED_SCOPE = 'packaging';
const SCOPE_FALLBACKS = ['household','commercial','both','packaging_waste','pack','general','other'];

const emptyFetcher = async () => ({ regulators: [], pros: [] });

function parseArgs() {
  const a = process.argv.slice(2);
  return {
    all: a.includes('--all') || !a.includes('--country'),
    country: (a.includes('--country') ? String(a[a.indexOf('--country')+1]||'') : '').toUpperCase(),
    dry: a.includes('--dry')
  };
}

const isoFrom = f => f.replace(/\.(mjs|cjs|js)$/i,'').toUpperCase();

async function discoverFetchers() {
  let files = [];
  try { files = (await readdir(SOURCES_DIR)).filter(f => /\.(mjs|cjs|js)$/i.test(f)); }
  catch { return {}; }
  const map = {};
  for (const f of files) {
    const iso = isoFrom(f);
    try {
      const mod = await import(pathToFileURL(path.join(SOURCES_DIR,f)).href);
      const fn = mod[`fetch${iso}`] || mod.default || mod.fetch || mod.main || Object.values(mod).find(v => typeof v === 'function');
      map[iso] = (typeof fn === 'function') ? fn : emptyFetcher;
    } catch { map[iso] = emptyFetcher; }
  }
  return map;
}

async function upsertRegulator(iso, r, {dry}={}) {
  if (dry || !process.env.SUPABASE_SERVICE_ROLE) return;
  await callRpc('upsert_regulator', {
    p_iso: iso, p_name: r.name, p_role: r.role || 'authority',
    p_url: r.url || null, p_source_url: r.sourceUrl || null,
  });
}

async function upsertProWithFallback(iso, p, {dry}={}) {
  if (dry || !process.env.SUPABASE_SERVICE_ROLE) return;
  const materials = Array.isArray(p.materials) ? p.materials.map(x => String(x||'').trim().toLowerCase()).filter(Boolean) : [];
  const seen = new Set(); const toTry = [];
  const initial = (p.scope && String(p.scope).trim()) || PREFERRED_SCOPE;
  for (const s of [initial, ...SCOPE_FALLBACKS]) { const k=String(s||'').toLowerCase(); if(k && !seen.has(k)){ seen.add(k); toTry.push(k);} }
  let lastErr = null;
  for (const scope of toTry) {
    try {
      await callRpc(UPSERT_PRO_FN, { p_iso: iso, p_name: p.name, p_url: p.url||null, p_source_url: p.sourceUrl||null, p_scope: scope, p_materials: materials });
      return;
    } catch (e) {
      const msg = String(e?.message||'');
      if (msg.includes('invalid input value for enum') || msg.includes('22P02')) { lastErr=e; continue; }
      throw e;
    }
  }
  throw new Error(`All scope candidates failed for "${p.name}" (${iso}). Tried: ${toTry.join(', ')}. Last error: ${lastErr?.message||''}`);
}

async function runCountry(iso, fetcher, {dry}={}) {
  const { regulators=[], pros=[] } = await (fetcher||emptyFetcher)();
  for (const r of regulators) { if(!r?.name) continue; await upsertRegulator(iso, r, {dry}); await sleep(150); }
  for (const p of pros) { if(!p?.name) continue; await upsertProWithFallback(iso, p, {dry}); await sleep(150); }
}

(async () => {
  const { all, country, dry } = parseArgs();
  const fetchers = await discoverFetchers();
  if (country) {
    await runCountry(country, fetchers[country] || emptyFetcher, {dry});
  } else if (all) {
    for (const iso of Object.keys(fetchers).sort()) {
      await runCountry(iso, fetchers[iso] || emptyFetcher, {dry});
    }
  } else {
    console.log('Usage: node src/main.mjs --all | --country DE [--dry]');
    process.exit(1);
