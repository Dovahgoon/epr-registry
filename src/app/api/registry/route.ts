import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

/** Load registry from env URL; fall back to /public/data/registry.json; final minimal JSON. */
export async function GET(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_REGISTRY_URL || process.env.REGISTRY_URL;
  if (envUrl) {
    try {
      const res = await fetch(envUrl, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json, {
          headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
        });
      }
    } catch {}
  }
  try {
    const origin = new URL(req.url).origin;
    const res2 = await fetch(origin + "/data/registry.json", { cache: "no-store" });
    if (res2.ok) {
      const json = await res2.json();
      return NextResponse.json(json, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch {}
  return NextResponse.json({ ok: false, items: [] }, { status: 503 });
}
