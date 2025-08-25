import { request } from "undici";
import { load } from "cheerio";

export async function fetchHTML(url: string) {
  const r = await request(url, {
    method: "GET",
    headers: { "user-agent": "EPR-Updater/0.1 (+compliance-tools)" },
  });
  if (r.statusCode >= 400) throw new Error(`HTTP ${r.statusCode} ${url}`);
  return await r.body.text();
}

export function $$(html: string) {
  return load(html);
}
