// updater/src/fetchers/tariffs/lt_zaliasis.mjs
import { writeFile } from 'node:fs/promises';
import { fetch } from 'undici';
import * as cheerio from 'cheerio';
const SRC = 'https://www.zaliasistaskas.lt/ikainiai/';

const normNum = (s) => {
  if (!s) return null;
  const n = parseFloat(String(s).replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const perKgFromPerTonne = (v) => (v == null ? null : +(v / 1000).toFixed(6));

async function main() {
  const res = await fetch(SRC);
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows = [];

  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 2) return;
    const material = $(tds[0]).text().trim();
    const perTonne = normNum($(tds[1]).text());
    const ratePerKg = perKgFromPerTonne(perTonne);
    if (!material) return;
    rows.push({
      country: 'LT',
      scheme: 'Žaliasis taškas',
      stream: 'both',
      material,
      rate: ratePerKg,
      unit: 'per_kg',
      currency: 'EUR',
      effective_from: '2025-01-01',
      source: SRC
    });
  });

  await writeFile('data/tariffs/imports/lt_zaliasis_2025.json', JSON.stringify({ items: rows }, null, 2));
  console.log(`[lt_zaliasis] wrote ${rows.length} rows`);
}
main().catch(err => { console.error(err); process.exit(1); });
