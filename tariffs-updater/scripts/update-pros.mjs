// scripts/update-pros.mjs
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const root = process.cwd();
const cfgPath = path.join(root, "scripts", "sources", "top5.config.json");
const prosPath = path.join(root, "src", "data", "manual", "pros.json");
const overridePath = path.join(root, "src", "data", "manual", "countryDetails.override.json");

function readJSON(p, fallback) { try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return fallback; } }
function writeJSON(p, data) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8"); }
const clean = (t) => (t || "").replace(/\s+/g, " ").replace(/[\u00AD\u200B\u200C\u200D]/g, "").trim();
const isHttp = (u) => /^https?:\/\//i.test(u || "");

function absoluteHref(href, base) {
  try { return new URL(href, base).href; } catch { return href; }
}

function looksLikeCandidate(str, hints, block) {
  const n = (str || "").toLowerCase();
  if (!n) return false;
  if (block.some(b => n.includes(b))) return false;
  return hints.some(h => n.includes(h));
}

async function fetchWithRetry(url, opts = {}, attempts = 3, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal, headers: { "User-Agent": "PPWR-Directory-Updater/1.1", ...(opts.headers || {}) } });
    return res;
  } catch (e) {
    if (attempts > 1) {
      const backoff = (4 - attempts) * 1000;
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, opts, attempts - 1, timeoutMs);
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}

async function scrapeOne({ url, selector, attr }) {
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const out = new Set();
  $(selector).each((_, el) => {
    let val = attr === "text" ? $(el).text() : $(el).attr(attr);
    const t = clean(val);
    if (!t) return;
    // For hrefs, keep only http(s) links
    if (attr === "href") {
      const href = absoluteHref(t, url);
      if (isHttp(href)) out.add(href);
      return;
    }
    out.add(t);
  });
  return Array.from(out);
}

async function main() {
  const cfg = readJSON(cfgPath, null);
  if (!cfg) throw new Error("Missing config at " + cfgPath);
  const offline = process.env.SKIP_SCRAPE === "1";
  const pros = readJSON(prosPath, {});
  const block = (cfg.normalization?.blocklist || []).map(s => s.toLowerCase());
  const hints = (cfg.normalization?.whitelistHints || []).map(s => s.toLowerCase());

  for (const iso of cfg.countries) {
    const existing = new Map((pros[iso] || []).map(x => [String(x.name || "").toLowerCase(), x]));
    if (offline) continue;
    for (const s of (cfg.sources[iso] || [])) {
      try {
        const items = await scrapeOne(s);
        for (const item of items) {
          // If we scraped hrefs, infer a name from the hostname/path segments
          let name = item;
          let urlCandidate = null;
          if (isHttp(item)) {
            urlCandidate = item;
            try {
              const u = new URL(item);
              const host = u.hostname.replace(/^www\./, "");
              const seg = (u.pathname.split("/").filter(Boolean)[0] || "").replace(/[-_]/g, " ");
              name = (seg && seg.length > 2 ? seg : host).replace(/\.[a-z]{2,}$/i, "");
            } catch {}
          }
          if (!looksLikeCandidate(name, hints, block)) continue;
          const key = String(name).toLowerCase();
          if (existing.has(key)) continue;
          existing.set(key, { name, url: urlCandidate || undefined });
        }
      } catch (e) {
        console.error("Scrape failed:", iso, s.url, String(e.message || e));
      }
    }
    pros[iso] = Array.from(existing.values());
  }

  writeJSON(prosPath, pros);

  // Merge into countryDetails.override.json
  const override = readJSON(overridePath, {});
  for (const [iso, list] of Object.entries(pros)) {
    override[iso] = override[iso] || { overview: { status: "active", scope: "Packaging" } };
    const out = Array.isArray(override[iso].pros) ? override[iso].pros.slice() : [];
    const seen = new Set(out.map(x => (x.name || "").toLowerCase()));
    for (const p of list) {
      const lower = (p.name || "").toLowerCase();
      if (!lower || seen.has(lower)) continue;
      out.push(p);
      seen.add(lower);
    }
    override[iso].pros = out;
  }
  writeJSON(overridePath, override);
  console.log("Updated pros.json and countryDetails.override.json");
}

main().catch(e => { console.error(e); process.exit(1); });
