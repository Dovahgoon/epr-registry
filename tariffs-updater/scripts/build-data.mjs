// scripts/build-data.mjs
import fs from "fs";
import path from "path";
const root = process.cwd();
const outJson = path.join(root, "src", "data", "countryDetails.json");
const outTs = path.join(root, "src", "data", "countryDetails.ts");
const manual = path.join(root, "src", "data", "manual", "countryDetails.override.json");
const pros = path.join(root, "src", "data", "manual", "pros.json");

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch (e) { console.error("JSON parse error for", p, e); return null; }
}

function write(details) {
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(details, null, 2), "utf-8");
  const ts = "export const countryDetails = " + JSON.stringify(details, null, 2) + " as const;\nexport default countryDetails;\n";
  fs.writeFileSync(outTs, ts, "utf-8");
  console.log("Wrote", path.relative(root, outJson));
  console.log("Wrote", path.relative(root, outTs));
}

function main() {
  let details = readJson(manual) || {};
  const proMap = readJson(pros) || {};
  for (const [iso, list] of Object.entries(proMap)) {
    details[iso] = details[iso] || { overview: { status: "active", scope: "Packaging" } };
    const existing = Array.isArray(details[iso].pros) ? details[iso].pros : [];
    // Merge by name (case-insensitive)
    const out = [...existing];
    for (const p of list) {
      const name = (p?.name || "").toLowerCase();
      if (!name) continue;
      if (!out.some((q) => (q?.name || "").toLowerCase() == name)) out.push(p);
    }
    details[iso].pros = out;
  }
  write(details);
}

main();
