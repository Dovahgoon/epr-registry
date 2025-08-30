// updater/src/fetchers/proe_fees_to_csv.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import fetch from 'node-fetch';
import pdf from 'pdf-parse';

const OUT_DIR = path.resolve(process.cwd(), '../data/tariffs/2025/generated/proe');
await fs.mkdir(OUT_DIR, { recursive: true });

// Known source (April/Feb 2025)
const FEES_PAGE = 'https://www.pro-e.org/the-green-dot-trademark/licence-fees';
const FEES_PDF  = 'https://www.pro-e.org/files/PRO-Europe-Participation-Costs-Overview-2025.pdf';

// Utility: write CSV with canonical headers
const headers = [
  'countryIso','schemeName','stream','material',
  'packagingType','rate','currency','unit',
  'sourceUrl','effectiveFrom','effectiveTo'
];
async function writeCsv(iso, rows) {
  if (!rows.length) return;
  const file = path.join(OUT_DIR, `tariffs_${iso}.csv`);
  const lines = [headers.join(',')].concat(
    rows.map(r => headers.map(h => (r[h] ?? '')).join(','))
  );
  await fs.writeFile(file, lines.join('\n'), 'utf8');
  console.log(`[pro-e fees] wrote ${file} (${rows.length} rows)`);
}

// Regex helpers for “Austria – ARA …” style blocks with 2024/2025 columns
function grabCountryBlock(txt, countryName) {
  const re = new RegExp(`${countryName}\\s*[–-].*?(?=\\n\\s*[A-Z][A-Za-z]+\\s*[–-]|\\n\\s*$)`, 's');
  const m = txt.match(re);
  return m ? m[0] : '';
}
function asNum(s) {
  if (!s) return null;
  const t = String(s).trim().replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// Parse a block like Austria (ARA) that lists materials + “household/commercial … 2024 2025”
function parseAustria(block) {
  // scheme & currency assumptions
  const iso = 'AT';
  const schemeName = 'ARA';
  const currency = 'EUR';
  const unit = 'per_kg';
  const effectiveFrom = '2025-01-01';
  const rows = [];

  // Lines like: "Paper, household 0.190 0.190"
  // We'll take the **last** number on the line as 2025 rate.
  const lineRe = /^(Paper|Glass|Ferrous metal|Aluminium|Plastic|Beverage cartons|Other composite materials|Ceramics|Wood|Textile fibres|Biodegradable materials),\s*(household|commercial)\s+([\d.,]+)\s+([\d.,]+)/gmi;
  let m;
  while ((m = lineRe.exec(block)) !== null) {
    const material = m[1];
    const stream   = m[2].toLowerCase(); // household/commercial
    const rate2025 = asNum(m[4]);
    if (rate2025 == null) continue;
    rows.push({
      countryIso: iso,
      schemeName,
      stream,
      material,
      packagingType: '',
      rate: rate2025,
      currency,
      unit,
      sourceUrl: FEES_PDF,
      effectiveFrom,
      effectiveTo: ''
    });
  }
  return rows;
}

async function main() {
  // 1) download PDF
  console.log(`[pro-e fees] downloading PDF…`);
  const res = await fetch(FEES_PDF);
  const buf = await res.arrayBuffer();
  const data = await pdf(Buffer.from(buf));
  const text = data.text;

  // 2) extract a first set (you can add more country-specific parsers the same way)
  const atBlock = grabCountryBlock(text, 'Austria');
  const atRows  = parseAustria(atBlock);

  // (Examples below to extend quickly)
  // const deBlock = grabCountryBlock(text, 'Germany');
  // const deRows  = parseGermany(deBlock);
  // const nlBlock = grabCountryBlock(text, 'Netherlands');
  // const nlRows  = parseNetherlands(nlBlock);
  // ...add more parsers as needed

  // 3) write CSVs
  await writeCsv('AT', atRows);
  // await writeCsv('DE', deRows);
  // await writeCsv('NL', nlRows);
}

main().catch(e => { console.error(e); process.exit(1); });
