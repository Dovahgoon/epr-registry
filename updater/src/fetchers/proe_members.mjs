// updater/src/fetchers/proe_members.mjs
import 'dotenv/config';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const URL  = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('Missing Supabase env'); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Country name -> ISO2 (extend as needed)
const ISO = {
  Austria: 'AT', Belgium: 'BE', Bulgaria: 'BG', Croatia: 'HR', Cyprus: 'CY',
  'Czech Republic': 'CZ', Estonia: 'EE', France: 'FR', Germany: 'DE',
  Greece: 'GR', Hungary: 'HU', Ireland: 'IE', Latvia: 'LV', Lithuania: 'LT',
  Luxembourg: 'LU', Malta: 'MT', Netherlands: 'NL', Norway: 'NO', Poland: 'PL',
  Portugal: 'PT', Romania: 'RO', Serbia: 'RS', Slovakia: 'SK', Slovenia: 'SI',
  Spain: 'ES', Sweden: 'SE', Turkey: 'TR', UK: 'GB', 'North Macedonia': 'MK',
  Israel: 'IL', Bosnia-Herzegovina: 'BA'
};

async function preloadCountries() {
  const byIso = new Map();
  const { data, error } = await sb.from('Country').select('id, iso2');
  if (error) throw error;
  for (const c of data) byIso.set(c.iso2.toUpperCase(), c.id);
  return byIso;
}

async function upsertPro(byIso, iso2, name, url) {
  const { data: pros } = await sb
    .from('Pro')
    .select('id')
    .eq('countryId', byIso.get(iso2))
    .eq('name', name)
    .limit(1);
  if (pros && pros.length) return pros[0].id;

  const { data, error } = await sb
    .from('Pro')
    .insert([{
      countryId: byIso.get(iso2),
      name,
      url,
      sourceUrl: 'https://www.pro-e.org/PRO-E-members.html',
      lastVerifiedAt: new Date().toISOString(),
      notes: 'Synced from PRO Europe (Green Dot) members.'
    }])
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const byIso = await preloadCountries();
  const res = await fetch('https://www.pro-e.org/PRO-E-members.html'); // member list page
  const html = await res.text();
  const $ = cheerio.load(html);

  // Heuristic: grab anchor tags that look like PRO homepages and the preceding text node for the name
  const items = [];
  $('a[href^="http"]').each((_, a) => {
    const href = $(a).attr('href');
    const text = $(a).text().trim();
    // Try to infer country by nearby text or known domains; fallback by name keywords
    const line = $(a).parent().text().trim();
    items.push({ text, href, line });
  });

  // Simple mapping rules (extend as needed)
  const rules = [
    { key: 'fostplus.be', iso: 'BE', name: 'Fost Plus' },
    { key: 'gruener-punkt.de', iso: 'DE', name: 'Der Grüne Punkt' },
    { key: 'herrco.gr', iso: 'GR', name: 'HERRCO' },
    { key: 'pontoverde.pt', iso: 'PT', name: 'Sociedade Ponto Verde' },
    { key: 'rekopol.pl', iso: 'PL', name: 'Rekopol' },
    { key: 'repa.se', iso: 'SE', name: 'REPA' },
    { key: 'repak.ie', iso: 'IE', name: 'Repak' },
    { key: 'slopak.si', iso: 'SI', name: 'Slopak' },
    { key: 'valorlux.lu', iso: 'LU', name: 'Valorlux' },
    { key: 'zalais.lv', iso: 'LV', name: 'Latvijas Zaļais Punkts' },
    { key: 'zaliasistaskas.lt', iso: 'LT', name: 'Žaliasis taškas' },
    { key: 'eco-ozra.hr', iso: 'HR', name: 'Eko-Ozra' },
  ];

  let inserted = 0;
  for (const it of items) {
    const rule = rules.find(r => it.href.includes(r.key));
    if (!rule) continue;
    await upsertPro(byIso, rule.iso, rule.name, it.href);
    inserted++;
  }
  console.log(`[pro-e members] upserted ~${inserted} PRO entries`);
}

main().catch(e => { console.error(e); process.exit(1); });
