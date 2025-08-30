// updater/src/import_tariffs.mjs
// Usage:
//   node src/import_tariffs.mjs ..\data\tariffs\2025
//   node src/import_tariffs.mjs ..\data\tariffs\2025\tariffs_BG.csv

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const URL  = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.');
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const byIso = new Map();   // ISO2 -> Country.id
const byPro = new Map();   // `${countryId}__${pro_name}` -> Pro.id

// ---------- NEW: defaults & helpers ----------
const DEFAULT_EFFECTIVE_FROM = "2025-01-01";

function isFiniteNumber(v) {
  if (v === null || v === undefined || v === "") return false;
  // accept "1,23" by turning into "1.23"
  const s = String(v).trim().replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n);
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).trim().replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function preload() {
  const { data: countries, error: cErr } = await sb.from('Country').select('id, iso2');
  if (cErr) throw cErr;
  countries?.forEach(c => byIso.set((c.iso2 || '').toUpperCase(), c.id));

  const { data: pros, error: pErr } = await sb.from('Pro').select('id, "countryId", name');
  if (pErr) throw pErr;
  pros?.forEach(p => byPro.set(`${p.countryId}__${(p.name || '').trim()}`, p.id));
}

/** ---------- CSV helpers ---------- */

// Basic, robust-ish CSV splitter that handles quotes and auto-detects delimiter (',' or ';')
function splitCsvLine(line, delim) {
  const out = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // toggle quotes OR escape ""
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delim && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function detectDelimiter(text) {
  // crude heuristic: check header line
  const firstLine = (text.split(/\r?\n/)[0] || '');
  const commas = (firstLine.match(/,/g) || []).length;
  const semis  = (firstLine.match(/;/g) || []).length;
  return semis > commas ? ';' : ',';
}

function stripBOM(s) {
  return s && s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

// Normalize a string key: trim, lower, remove spaces/underscores
const normKey = (s) => String(s ?? '').trim().toLowerCase().replace(/[\s_]+/g, '');

// Map known aliases -> canonical keys we use internally
function canonicalizeRow(row) {
  const alias = {
    // country ISO
    countryiso: 'iso',
    iso: 'iso',
    iso2: 'iso',
    country: 'iso',
    // scheme / PRO name
    scheme: 'pro_name',
    schemename: 'pro_name',
    system: 'pro_name',
    pro: 'pro_name',
    producerresponsibilityorg: 'pro_name',
    name: 'pro_name',
    // stream/scope
    stream: 'scope',
    scope: 'scope',
    // packaging type
    packtype: 'packagingType',
    packaging: 'packagingType',
    packagingtype: 'packagingType',
    // source
    source: 'sourceUrl',
    sourceurl: 'sourceUrl',
    url: 'sourceUrl',
    // dates
    validfrom: 'effectiveFrom',
    effectivefrom: 'effectiveFrom',
    from: 'effectiveFrom',
    validto: 'effectiveTo',
    effectiveto: 'effectiveTo',
    to: 'effectiveTo',
    // rate
    fee: 'rate',
    amount: 'rate',
  };

  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const nk = normKey(k);
    const ck = alias[nk] ?? k; // keep original key if we don't know it
    out[ck] = v;
  }
  return out;
}

function normalizeHeadersAndRows(headers, rows) {
  // Build a mapping of original header -> normalized
  const alias = {
    countryiso: 'iso',
    iso: 'iso',
    iso2: 'iso',
    country: 'iso',
    scheme: 'pro_name',
    schemename: 'pro_name',
    system: 'pro_name',
    pro: 'pro_name',
    producerresponsibilityorg: 'pro_name',
    name: 'pro_name',
    stream: 'scope',
    scope: 'scope',
    packtype: 'packagingType',
    packaging: 'packagingType',
    packagingtype: 'packagingType',
    source: 'sourceUrl',
    sourceurl: 'sourceUrl',
    url: 'sourceUrl',
    validfrom: 'effectiveFrom',
    effectivefrom: 'effectiveFrom',
    from: 'effectiveFrom',
    validto: 'effectiveTo',
    effectiveto: 'effectiveTo',
    to: 'effectiveTo',
    fee: 'rate',
    amount: 'rate',
  };

  const mappedHeaders = headers.map(h => alias[normKey(h)] ?? h);
  const out = rows.map(r => {
    const o = {};
    for (let i = 0; i < mappedHeaders.length; i++) {
      o[mappedHeaders[i]] = r[i] ?? '';
    }
    return o;
  });
  return out;
}

function parseCSVSmart(text) {
  const clean = stripBOM(String(text || ''));
  const delim = detectDelimiter(clean);
  const lines = clean.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0], delim);
  const dataRows = lines.slice(1).map(ln => splitCsvLine(ln, delim));

  // normalize headers + rows with aliases
  return normalizeHeadersAndRows(headers, dataRows);
}

/** ---------- Import logic ---------- */

function inferIsoFromFilename(filePath) {
  const m = path.basename(filePath).match(/tariffs[_-]([a-z]{2})/i);
  return m ? m[1].toUpperCase() : '';
}

// Convert raw row to our canonical shape + defaults
function prepareRow(raw, filePath) {
  // first canonicalize by aliases
  const r1 = canonicalizeRow(raw);

  // derive ISO
  let iso = String(r1.iso || '').trim().toUpperCase();
  if (!iso) iso = inferIsoFromFilename(filePath);

  // normalize scope/stream
  let scope = String(r1.scope || '').trim().toLowerCase();
  if (scope === 'hh') scope = 'household';
  if (['comm', 'c&i', 'ci', 'business'].includes(scope)) scope = 'commercial';

  // normalize numbers (allow "1,23" decimal)
  let rate = r1.rate ?? '';
  if (typeof rate === 'string') {
    rate = rate.trim();
    // leave ranges as-is; they'll be filtered later
    // convert comma decimal to dot for single numbers
    if (/^\d+,\d+$/.test(rate)) rate = rate.replace(',', '.');
  }

  return {
    iso,
    pro_name: (r1.pro_name || '').trim() || null,
    scope,
    material: r1.material ? String(r1.material).trim() : '',
    packagingType: r1.packagingType ? String(r1.packagingType).trim() : null,
    rate,
    currency: r1.currency || 'EUR',
    unit: r1.unit || 'per_kg',
    sourceUrl: r1.sourceUrl || null,
    effectiveFrom: r1.effectiveFrom || null,
    effectiveTo: r1.effectiveTo || null,
  };
}

async function upsertRow(r, filePath, rowIdx) {
  // Skip placeholders (e.g., FR TBD line)
  if ((r.iso || '').toUpperCase() === 'FR' && (r.unit || '').toUpperCase() === 'TBD') return;

  const iso = (r.iso || '').toUpperCase();
  if (!iso) {
    throw new Error(
      `Missing country ISO in ${path.basename(filePath)} at row ${rowIdx + 2} (after header): ${JSON.stringify(r)}`
    );
  }

  const countryId = byIso.get(iso);
  if (!countryId) {
    throw new Error(`Unknown country ISO: ${r.iso} in ${path.basename(filePath)} at row ${rowIdx + 2}`);
  }

  // Attach to a PRO if name matches; else keep national (proId = null)
  const proKey = r.pro_name ? `${countryId}__${r.pro_name.trim()}` : null;
  const proId = proKey ? (byPro.get(proKey) ?? null) : null;

  // Map 'both' → household + commercial
  const scope = String(r.scope || '').toLowerCase();
  const streams = scope === 'both' ? ['household', 'commercial'] : [scope];

  // guard: numeric rate (skip ranges like "0.5-1.5")
  const numericRate = toNumberOrNull(r.rate);
  const hasRate = r.rate !== '' && r.rate !== null && r.rate !== undefined;
  // NEW: skip rows with empty rate entirely (DB has NOT NULL on rate)
  if (!hasRate) {
    console.warn(`Skipping empty rate in ${path.basename(filePath)} row ${rowIdx + 2}`);
    return;
  }
  if (hasRate && numericRate === null) {
    console.warn(
      `Skipping non-numeric rate in ${path.basename(filePath)} row ${rowIdx + 2}: "${r.rate}"`
    );
    return;
  }

  for (const s of streams) {
    if (!['household','commercial'].includes(s)) {
      throw new Error(
        `Invalid scope '${r.scope}' in ${path.basename(filePath)} at row ${rowIdx + 2} (iso=${iso}, pro=${r.pro_name}, material=${r.material})`
      );
    }

    const payload = {
      p_country_id: countryId,
      p_pro_id: proId,
      p_name: r.pro_name,                      // scheme/label (e.g., "CONAI", "Fost Plus")
      p_stream: s,                             // enum: household | commercial
      p_effective_from: r.effectiveFrom || DEFAULT_EFFECTIVE_FROM,
      p_effective_to: r.effectiveTo || null,
      p_material: r.material,
      p_packaging_type: r.packagingType || null,
      p_rate: numericRate,                     // null or number
      p_currency: r.currency || 'EUR',
      p_unit: r.unit || 'per_kg',
      p_source_url: r.sourceUrl || null,
    };

    const { error } = await sb.rpc('upsert_tariff_simple', payload);
    if (error) {
      console.error('RPC failed for row payload:', payload);
      throw new Error(`RPC error in ${path.basename(filePath)} at row ${rowIdx + 2}: ${error.message || error}`);
    }
  }
}

async function importFile(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  const rawRows = parseCSVSmart(text);

  // Convert each row to canonical shape and insert
  let cnt = 0;
  for (let i = 0; i < rawRows.length; i++) {
    const canon = prepareRow(rawRows[i], filePath);
    await upsertRow(canon, filePath, i);
    cnt++;
  }
  console.log(`[import] ${path.basename(filePath)}: ${cnt} rows`);
  return cnt;
}

async function importPath(target) {
  const stat = await fs.stat(target);
  const files = stat.isDirectory()
    ? (await fs.readdir(target))
        .filter(f => f.toLowerCase().endsWith('.csv'))
        .map(f => path.join(target, f))
        // sort for stable order (helps correlate with CLI logs)
        .sort((a, b) => path.basename(a).localeCompare(path.basename(b)))
    : [target];

  let total = 0;
  for (const file of files) {
    total += await importFile(file);
  }
  console.log(`[import] done: ${total} row(s) across ${files.length} file(s).`);
}

(async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node src/import_tariffs.mjs <csv-file-or-folder>');
    process.exit(1);
  }
  await preload();
  await importPath(path.resolve(process.cwd(), target));
})().catch(e => { console.error(e); process.exit(1); });
