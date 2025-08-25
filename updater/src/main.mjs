import 'dotenv/config';
import { callRpc } from './lib/supabase.mjs';
import { sleep } from './lib/utils.mjs';

import { fetchDE } from './sources/de.mjs';
import { fetchDK } from './sources/dk.mjs';
import { fetchHR } from './sources/hr.mjs';
import { fetchSE } from './sources/se.mjs';

const countryFetchers = {
  DE: fetchDE,
  DK: fetchDK,
  HR: fetchHR,
  SE: fetchSE,
  // Add others here as you implement them
};

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
  node src/main.mjs --country DE [--dry]
`);
      process.exit(0);
    }
  }
  return opts;
}

async function upsertCountry(iso) {
  const fetcher = countryFetchers[iso];
  if (!fetcher) {
    console.warn(`[SKIP] No fetcher for ${iso}`);
    return;
  }
  console.log(`\n==> ${iso}`);
  const { regulators, pros } = await fetcher();

  // Upsert regulators
  for (const r of regulators) {
    console.log(`  Reg: ${r.name}`);
    if (!r.name) continue;
    if (!r.role) r.role = 'authority';
    if (!process.env.SUPABASE_SERVICE_ROLE) continue; // dry safety
    await callRpc('upsert_regulator', {
      p_iso: iso,
      p_name: r.name,
      p_role: r.role,
      p_url: r.url || null,
      p_source_url: r.sourceUrl || null,
    });
    await sleep(150); // be gentle
  }

  // Upsert PROs
  for (const p of pros) {
    console.log(`  PRO: ${p.name}`);
    if (!p.name) continue;
    if (!process.env.SUPABASE_SERVICE_ROLE) continue;
    await callRpc('upsert_pro', {
      p_iso: iso,
      p_name: p.name,
      p_url: p.url || null,
      p_source_url: p.sourceUrl || null,
    });
    await sleep(150);
  }
}

async function main() {
  const { all, country } = parseArgs();
  if (!all && !country) {
    console.log('Use --all or --country <ISO>. Try --help');
    process.exit(1);
  }
  if (country) {
    await upsertCountry(country.toUpperCase());
  } else if (all) {
    for (const iso of Object.keys(countryFetchers)) {
      await upsertCountry(iso);
    }
  }
  console.log('\nDone.');
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
