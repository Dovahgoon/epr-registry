
// scripts/build-tariffs-json.mjs
// Aggregates CSV files under data/tariffs/2025/*.csv into public/data/tariffs-2025.json
// Schema produced matches the calculator: { version, year, currency, countries: { ISO: { name, schemes: [...] } } }

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const YEAR = process.env.TARIFFS_YEAR || '2025';
const CSV_DIR = process.env.TARIFFS_DIR || path.join(process.cwd(), 'data', 'tariffs', YEAR);
const OUT_FILE = process.env.TARIFFS_OUT || path.join(process.cwd(), 'public', 'data', `tariffs-${YEAR}.json`);
const CURRENCY = process.env.TARIFFS_CURRENCY || 'EUR/kg';

// Map a few EU country codes to names (fallback to ISO)
const COUNTRY_NAMES = {
  AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', CY: 'Cyprus', CZ: 'Czechia', DE: 'Germany',
  DK: 'Denmark', EE: 'Estonia', ES: 'Spain', FI: 'Finland', FR: 'France', GR: 'Greece',
  HR: 'Croatia', HU: 'Hungary', IE: 'Ireland', IT: 'Italy', LT: 'Lithuania', LU: 'Luxembourg',
  LV: 'Latvia', MT: 'Malta', NL: 'Netherlands', PL: 'Poland', PT: 'Portugal', RO: 'Romania',
  SE: 'Sweden', SI: 'Slovenia', SK: 'Slovakia'
};

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'default';
}
function normHeader(h) { return String(h).trim().toLowerCase().replace(/\s+/g, '_'); }
function num(v, d = null) {
  if (v === null || v === undefined) return d;
  const s = String(v).replace(',', '.').replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : d;
}
function pick(row, keys, def=null) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== '') return v;
  }
  return def;
}
function unitToPerKg(unit) {
  const u = String(unit || '').toLowerCase();
  if (!u || u.includes('kg')) return { per: 'kg', factor: 1 };
  if (u.includes('tonne') || u === 't') return { per: 'kg', factor: 1/1000 }; // convert per-tonne to per-kg
  if (u.includes('unit')) return { per: 'unit', factor: 1 };
  return { per: 'kg', factor: 1 }; // default
}

async function readCsvFile(file) {
  const buf = await fs.readFile(file, 'utf8');
  const records = parse(buf, { columns: header => header.map(normHeader), skip_empty_lines: true, trim: true });
  return records;
}

async function main() {
  // ensure output directory
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

  // collect csv files
  const entries = await fs.readdir(CSV_DIR, { withFileTypes: true });
  const csvFiles = entries.filter(e => e.isFile() && /\.csv$/i.test(e.name)).map(e => path.join(CSV_DIR, e.name));
  if (csvFiles.length === 0) {
    console.error(`No CSV files found in ${CSV_DIR}`);
    process.exit(1);
  }

  /** countries: { ISO: { name, schemes: [ { id, name, effectiveFrom, sourceUrl?, materials{}, plastic? } ] } } */
  const countries = {};

  for (const file of csvFiles) {
    const isoGuess = path.basename(file).match(/tariffs[_\-]([A-Za-z]{2})/i)?.[1]?.toUpperCase();
    const iso = isoGuess || 'XX';
    const rows = await readCsvFile(file);

    // group rows by scheme id/name (if present)
    const byScheme = new Map();
    for (const row of rows) {
      const schemeName = pick(row, ['scheme_name', 'scheme', 'pro', 'pro_name'], 'Default');
      const schemeId = slugify(pick(row, ['scheme_id', 'scheme', 'scheme_name', 'pro', 'pro_id'], schemeName));
      const eff = pick(row, ['effective_from', 'effective_date', 'date', 'valid_from'], `${YEAR}-01-01`);
      const url = pick(row, ['source', 'source_url', 'url'], null);

      const key = `${schemeId}::${schemeName}::${eff}::${url || ''}`;
      if (!byScheme.has(key)) byScheme.set(key, { id: schemeId, name: schemeName, effectiveFrom: eff, sourceUrl: url, rows: [] });
      byScheme.get(key).rows.push(row);
    }

    const countryObj = countries[iso] || { name: COUNTRY_NAMES[iso] || iso, schemes: [] };

    for (const sc of byScheme.values()) {
      const materials = {};
      const plasticSubs = [];

      for (const r of sc.rows) {
        // Figure out the material + optional sub label
        const material = (pick(r, ['material_code', 'material', 'category'], '') || '').toString().toLowerCase();
        const sub = pick(r, ['sub_material', 'subcategory', 'sub_category', 'label', 'name'], null);

        // Rate and unit to per-kg
        const rateRaw = num(pick(r, ['rate', 'fee', 'price', 'amount'], null));
        if (rateRaw == null) continue;
        const { per, factor } = unitToPerKg(pick(r, ['unit', 'per', 'per_unit'], 'kg'));
        let ratePerKg = rateRaw;
        if (per === 'kg') ratePerKg = rateRaw * factor;
        // per-unit isn't well supported by calculator yet; keep as-is in materials

        if (material.startsWith('plastic') || material === 'p') {
          plasticSubs.push({ code: slugify(sub || 'plastic'), label: sub || 'Plastic', rate: ratePerKg });
        } else if (per === 'unit') {
          materials[slugify(material) || 'other'] = ratePerKg; // keep but shown as kg; if needed we can extend schema
        } else {
          const key = slugify(material) || 'other';
          materials[key] = ratePerKg;
        }
      }

      const scheme = { id: sc.id, name: sc.name, effectiveFrom: sc.effectiveFrom, sourceUrl: sc.sourceUrl || undefined };
      if (Object.keys(materials).length) scheme.materials = materials;
      if (plasticSubs.length) scheme.plastic = { label: 'Plastic', subMaterials: plasticSubs };
      countryObj.schemes.push(scheme);
    }

    countries[iso] = countryObj;
  }

  const outDoc = { version: 1, year: YEAR, currency: CURRENCY, countries };
  await fs.writeFile(OUT_FILE, JSON.stringify(outDoc, null, 2), 'utf8');
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
