import * as cheerio from "cheerio";

export async function fetchIT() {
  const res = await fetch("https://www.conai.org/consorzi/");
  const html = await res.text();
  const $ = cheerio.load(html);
  const raw = [];
  $("a").each((_, a) => {
    const txt = $(a).text().trim();
    const href = $(a).attr("href");
    if (txt && href && /conai\.org|ricrea|corepla|comieco|coreve|rilegno|biorepack|cial/i.test((href||"") + (txt||""))) {
      raw.push({ name: txt, url: href });
    }
  });

  const pros = dedupe(raw).map(p => ({
    ...p,
    ...mapItMaterialsAndScope(p.name)
  }));

  return {
    regulators: [{ name: "CONAI", url: "https://www.conai.org/" }],
    pros: [{ name: "Consorzi CONAI", url: "https://www.conai.org/consorzi/", scope: "both", materials: [] }, ...pros]
  };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(x => {
    const k = (x.name || "").toLowerCase() + "|" + (x.url || "");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function mapItMaterialsAndScope(name = "") {
  const n = name.toLowerCase();
  if (n.includes("ricrea")) return { scope: "both", materials: ["steel"] };
  if (n.includes("cial")) return  { scope: "both", materials: ["aluminum"] };
  if (n.includes("corepla")) return { scope: "both", materials: ["plastic"] };
  if (n.includes("comieco")) return { scope: "both", materials: ["paper"] };
  if (n.includes("coreve")) return  { scope: "both", materials: ["glass"] };
  if (n.includes("rilegno")) return { scope: "both", materials: ["wood"] };
  if (n.includes("biorepack")) return { scope: "both", materials: ["bioplastic"] };
  return { scope: "both", materials: [] };
}
