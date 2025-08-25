// Next.js route: /api/registry
import { NextResponse } from "next/server";
import fallback from "../../../data/registry.json";

export const runtime = "edge";
export const revalidate = 3600;

const REMOTE = process.env.NEXT_PUBLIC_REGISTRY_URL || process.env.REGISTRY_URL;

async function loadAll() {
  try {
    if (REMOTE) {
      const r = await fetch(REMOTE, { next: { revalidate: 3600 } });
      if (r.ok) return await r.json();
    }
  } catch {}
  return fallback;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const iso = (searchParams.get("country") || "").toUpperCase();
  const data = await loadAll();
  let items = Array.isArray(data) ? data : (data.items || []);
  const out = iso ? items.filter((x: any) => x.country === iso || x.iso === iso) : items;
  return NextResponse.json({ ok: true, count: out.length, items: out }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
  });
}
