import { EU27 } from "./eu.js";
import { loadCountry } from "./providers.js";
import { RegistryBundle } from "./schemas.js";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function run(){
  const items = [];
  for (const iso of EU27) {
    try {
      items.push(await loadCountry(iso));
    } catch (e) {
      items.push({ country: iso, regulators: [], pros: [], notes: String(e) });
    }
  }
  const bundle: RegistryBundle = {
    ok: true,
    year: String(new Date().getFullYear()),
    items,
    generatedAt: new Date().toISOString(),
  };
  const outDir = path.resolve(process.cwd(), "outputs");
  await mkdir(outDir, { recursive: true });
  const out = path.join(outDir, "regulators-pros.json");
  await writeFile(out, JSON.stringify(bundle, null, 2), "utf-8");
  console.log("Wrote", out);
}

run().catch((e)=>{ console.error(e); process.exit(1); });
