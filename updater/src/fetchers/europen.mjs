/**
 * updater/src/fetchers/europen.mjs
 * Fetch EUROPEN EPR mapping Excel and parse PROs/Regulators per country.
 * - Primary: scrape the overview page for the latest .xlsx URL.
 * - Fallback: use EUROPEN_XLSX_URL env
 * - Final fallback: bundled known URL (April 2025).
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const OVERVIEW_URL = process.env.EUROPEN_OVERVIEW_URL
  || 'https://www.europen-packaging.eu/publication/overview-of-member-states-epr-schemes/';
const XLSX_FALLBACK = process.env.EUROPEN_XLSX_URL
  || 'https://www.europen-packaging.eu/wp-content/uploads/2025/03/EUROPEN-Overview-of-Member-States-EPR-schemes-April-2025.xlsx';
const CACHE_FILE = process.env.EUROPEN_CACHE_XLSX || path.join(__dirname, '..', '..', 'data', 'europen-latest.xlsx');

const nameToIso = new Map(Object.entries({
  "Austria":"AT","Belgium":"BE","Bulgaria":"BG","Croatia":"HR","Cyprus":"CY","Czech Republic":"CZ",
  "Denmark":"DK","Estonia":"EE","Finland":"FI","France":"FR","Germany":"DE","Ireland":"IE","Greece":"GR",
  "Hungary":"HU","Italy":"IT","Latvia":"LV","Lithuania":"LT","Luxembourg":"LU","Malta":"MT",
  "Netherlands":"NL","Poland":"PL","Portugal":"PT","Romania":"RO","Slovakia":"SK","Slovenia":"SI",
  "Spain":"ES","Sweden":"SE"
}));

function norm(s='') {
  return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
}

function splitNames(val='') {
  return String(val).split(/;|\n|,\s*(?=[A-ZÅÄÖÉÍÓÚÜÑ])/).map(s=>s.trim()).filter(Boolean);
}

function cleanCandidate(s='') {
  let t = s;
  t = t.replace(/^\d+\s*[-–—:]\s*/,'').trim();
  t = t.split('http')[0];
  t = t.split('NB:')[0];
  t = t.replace(/[•–—-]+\s*/g,'');
  if (!t) return '';
  if (t.split(/\s+/).length > 16) return ''; // too narrative
  if (!/[A-Za-z]/.test(t)) return '';
  // discard obvious narrative headers
  const bad = /(competing pros|single pro|state fund|individual compliance|a producer may split|covers sorted household|non-household packaging|normally managed individually)/i;
  if (bad.test(t)) return '';
  return t;
}

async function fetchLatestXlsx() {
  // Try to fetch the overview page for a .xlsx link, otherwise fallback
  try {
    const res = await fetch(OVERVIEW_URL, { headers: { 'User-Agent': 'epr-updater/1.0' }});
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/https?:[^"']+EUROPEN-[^"']+EPR[^"']+\.xlsx/gi);
      if (m && m.length) {
        return m[0];
      }
    }
    return XLSX_FALLBACK;
  } catch {
    return XLSX_FALLBACK;
  }
}

async function downloadArrayBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'epr-updater/1.0' }});
  if (!res.ok) throw new Error(`EUROPEN xlsx download failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  return ab;
}

function parseWorkbook(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const out = {}; // iso -> { household: [], commercial: [], regulators: [] }
  for (const sheetName of wb.SheetNames) {
    const iso = nameToIso.get(sheetName);
    if (!iso) continue;
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const HH = [];
    const IND = [];
    const REGS = [];
    for (let i=0; i<Math.min(60, rows.length); i++) {
      const head = String(rows[i][0]||'');
      const val  = String(rows[i][1]||'');
      if (/PROs?\s+covering\s+household\s+packaging/i.test(head)) {
        for (const s of splitNames(val)) {
          const c = cleanCandidate(s);
          if (c) HH.push(c);
        }
      }
      if (/PROs?\s+covering\s+industrial\s+packaging/i.test(head)) {
        for (const s of splitNames(val)) {
          const c = cleanCandidate(s);
          if (c) IND.push(c);
        }
      }
      if (/(competent|supervis|regulat|authority|ministry|agency|inspectorate|fund)/i.test(head)) {
        for (const s of splitNames(val)) {
          const c = cleanCandidate(s);
          if (c) REGS.push(c);
        }
      }
    }
    out[iso] = { household: HH, commercial: IND, regulators: REGS };
  }
  return out;
}

export async function fetchEuropenMap() {
  let xlsxUrl = await fetchLatestXlsx();
  try {
    const ab = await downloadArrayBuffer(xlsxUrl);
    const map = parseWorkbook(Buffer.from(ab));
    return { xlsxUrl, map };
  } catch (e) {
    // Try cache file if present
    try {
      const buf = await readFile(CACHE_FILE);
      const map = parseWorkbook(buf);
      return { xlsxUrl: 'cache:'+CACHE_FILE, map };
    } catch (e2) {
      throw e;
    }
  }
}
