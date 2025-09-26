// updater/src/run_europen_merge.mjs
import 'dotenv/config';
import { fetchEuropenMap } from './fetchers/europen.mjs';
import { callRpc } from './lib/supabase.mjs';

const UPSERT_PRO_FN = 'upsert_pro_api';

function norm(s=''){ return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }

async function upsertRegulator(iso, name) {
  await callRpc('upsert_regulator', {
    p_iso: iso,
    p_name: name,
    p_role: 'authority',
    p_url: null,
    p_source_url: null,
  });
}

async function upsertPro(iso, name, scope) {
  // scope enum differences handled by wrapper
  await callRpc(UPSERT_PRO_FN, {
    p_iso: iso,
    p_name: name,
    p_url: null,
    p_source_url: null,
    p_scope: scope,          // 'household' | 'commercial' | 'packaging' (DB enum)
    p_materials: [],
  });
}

function dedupe(arr){
  const seen = new Set(); const out=[];
  for(const x of arr){
    const k = norm(x);
    if(seen.has(k)) continue;
    seen.add(k); out.push(x);
  }
  return out;
}

async function main(){
  console.log("[europen] Fetching latest EUROPEN mapping…");
  const { xlsxUrl, map } = await fetchEuropenMap();
  console.log("[europen] Source:", xlsxUrl);

  // Iterate ISO -> lists and upsert
  const isos = Object.keys(map).sort();
  for (const iso of isos) {
    const { household = [], commercial = [], regulators = [] } = map[iso] || {};
    console.log(`\n[${iso}] EUROPEN merge…`);

    // Regulators: names only (URLs will be filled by country sources later)
    for (const r of dedupe(regulators)) {
      console.log("  Reg:", r);
      try { await upsertRegulator(iso, r); } catch (e) { console.warn("   ! upsertRegulator:", e.message); }
      await new Promise(r=>setTimeout(r,150));
    }

    // PROs: add missing ones and set scope where available
    for (const name of dedupe(household)) {
      console.log("  PRO (household):", name);
      try { await upsertPro(iso, name, 'household'); } catch (e) { console.warn("   ! upsertPro:", e.message); }
      await new Promise(r=>setTimeout(r,150));
    }
    for (const name of dedupe(commercial)) {
      console.log("  PRO (commercial):", name);
      try { await upsertPro(iso, name, 'commercial'); } catch (e) { console.warn("   ! upsertPro:", e.message); }
      await new Promise(r=>setTimeout(r,150));
    }
  }

  console.log("\n[europen] Done.");
}

main().catch(err => { console.error(err); process.exit(1); });
