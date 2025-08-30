// updater/src/fetchers/tariffs/scrape_from_sources.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { fetch } from 'undici';
import * as cheerio from 'cheerio';

const args = process.argv.slice(2);
const isoArg = args.find(a => a.startsWith('--iso='));
if (!isoArg) {
  console.error('Usage: node scrape_from_sources.mjs --iso=LT');
  process.exit(1);
}
const ISO = isoArg.split('=')[1].toUpperCase();

const SRC_CSV = 'data/sources/eu27_tariff_sources.csv';
const OUT = `data/tariffs/imports/${ISO.toLowerCase()}_auto.json`;

function csvParse(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const cols = header.split(',');
  return lines.map(line => {
    // naive CSV split (no quotes inside URLs expected), sufficient for our file
    const vals = line.split(',');
    const obj = {};
    cols.forEach((c, i) => obj[c] = (vals[i] || '').trim());
    return obj;
  });
}

const normNum = (s) => {
  if (!s) return null;
  const n = parseFloat(String(s).replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const perKgFromPerTonne = (v) => (v == null ? null : +(v / 1000).toFixed(6));

async function parseHtmlTable(url, country, scheme, stream='both', currency='EUR') {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const items = [];
  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td,th');
    if (tds.length < 2) return;
    const material = $(tds[0]).text().trim();
    const valTxt = $(tds[1]).text().trim();
    let rate = normNum(valTxt);
    if (/\b\/t|per\s*t(onne)?\b/i.test(valTxt)) rate = perKgFromPerTonne(rate);
    if (!material) return;
    items.push({
      country: country, scheme, stream, material,
      rate, unit: 'per_kg', currency, effective_from: '2025-01-01', source: url
    });
  });
  return items;
}

async function main() {
  const csv = await readFile(SRC_CSV, 'utf8');
  const rows = csvParse(csv).filter(r => r.countryISO === ISO);

  const outItems = [];
  for (const r of rows) {
    const method = (r.parsingMethod || '').toLowerCase();
    const priceType = (r.priceType || '').toLowerCase();
    const scheme = r.proOrScheme || 'Unknown';
    const url = r.proUrl;
    const scope = (r.scope || 'both').toLowerCase();

    if (!url) continue;

    try {
      if (method === 'html') {
        const items = await parseHtmlTable(url, ISO, scheme, scope, ISO==='HU'?'HUF':'EUR');
        if (items.length) outItems.push(...items);
      } else if (method === 'pdf' || method === 'xlsx' || method === 'csv') {
        // TODO: implement specific parser; for now write a placeholder row with source only
        outItems.push({ country: ISO, scheme, stream: scope, material: 'All materials', rate: null, unit: 'per_kg', currency: ISO==='HU'?'HUF':'EUR', effective_from: '', source: url });
      } else {
        // manual/contractual
        outItems.push({ country: ISO, scheme, stream: scope, material: 'All materials', rate: null, unit: 'per_kg', currency: ISO==='HU'?'HUF':'EUR', effective_from: '', source: url });
      }
    } catch (e) {
      console.error(`[${ISO}] Failed on ${url}:`, e.message);
    }
  }

  await writeFile(OUT, JSON.stringify({ items: outItems }, null, 2));
  console.log(`[scrape_from_sources] ${ISO}: wrote ${outItems.length} rows to ${OUT}`);
}
main().catch(err => { console.error(err); process.exit(1); });
