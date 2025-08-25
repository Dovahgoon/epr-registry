// Import /data CSVs into Postgres via Prisma
// Usage: node scripts/import-to-db.mjs
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ROOT = process.cwd();

const COUNTRIES_CSV = path.join(ROOT, "data", "countries_enriched.csv");
const PROS_CSV = path.join(ROOT, "data", "pros.csv");

function parseCSV(text) {
  const rows = [];
  let i = 0, field = "", row = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "
" || c === "") {
        if (c === "" && text[i + 1] === "
") i++;
        row.push(field); field = "";
        if (row.some(v => v.length > 0)) rows.push(row);
        row = [];
      } else field += c;
    }
    i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.length && r.some(x => x.trim().length)).map(r => {
    const o = {};
    for (let j = 0; j < header.length; j++) o[header[j]] = (r[j] ?? "").trim();
    return o;
  });
}

async function main() {
  const countriesText = fs.readFileSync(COUNTRIES_CSV, "utf8");
  const prosText = fs.existsSync(PROS_CSV) ? fs.readFileSync(PROS_CSV, "utf8") : "";
  const countries = parseCSV(countriesText);
  const pros = prosText ? parseCSV(prosText) : [];

  for (const c of countries) {
    const iso2 = (c.iso2 || "").toUpperCase();
    if (!iso2) continue;
    const name = c.name || iso2;
    const slug = (c.slug || iso2).toLowerCase();
    const region = c.region || null;
    const currency = c.currency || null;
    const euMember = String(c.euMember).toLowerCase() === "true";
    await prisma.country.upsert({
      where: { iso2 },
      create: { iso2, name, slug, region, currency, euMember },
      update: { name, slug, region, currency, euMember },
    });
    process.stdout.write(`Upserted country ${iso2}
`);
  }

  for (const p of pros) {
    const iso2 = (p.country_iso2 || "").toUpperCase();
    const name = (p.pro_name || "").trim();
    if (!iso2 || !name) continue;
    const country = await prisma.country.findUnique({ where: { iso2 } });
    if (!country) { console.warn("Missing country for PRO", iso2, name); continue; }
    await prisma.pro.upsert({
      where: { countryId_name: { countryId: country.id, name } },
      create: { countryId: country.id, name, url: p.url || null, notes: p.notes || null },
      update: { url: p.url || null, notes: p.notes || null },
    });
    process.stdout.write(`Upserted PRO ${iso2} - ${name}
`);
  }

  console.log("Import complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
