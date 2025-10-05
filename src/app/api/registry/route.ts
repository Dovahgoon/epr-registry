import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

/** Load registry from env URL; if it's missing or empty, fall back to /public/data/registry.json. */
export async function GET(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_REGISTRY_URL || process.env.REGISTRY_URL;
  // Helper to unify shape check
  const hasItems = (j: any) => !!j && Array.isArray(j.items) && j.items.length > 0;

  // 1) Try remote (env URL)
  if (envUrl) {
    try {
      const res = await fetch(envUrl, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (hasItems(json)) {
          return NextResponse.json(json, {
            headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
          });
        }
      }
    } catch {}
  }

  // 2) Fallback to local file
  try {
    const origin = new URL(req.url).origin;
    const res2 = await fetch(origin + "/data/registry.json", { cache: "no-store" });
    if (res2.ok) {
      const json2 = await res2.json();
      if (hasItems(json2)) {
        return NextResponse.json(json2, {
          headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
        });
      }
    }
  } catch {}

  // 3) Last resort: empty
  return NextResponse.json({ ok: false, items: [] }, { status: 503 });
}
