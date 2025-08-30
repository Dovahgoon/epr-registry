import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

type Item = {
  country: string;
  scheme: string;
  stream?: string;
  material: string;
  rate?: number;
  unit?: string;
  currency?: string;
  effective_from?: string;
};

function normalizePayload(input: any) {
  if (input && input.countries) return input;

  const items: Item[] = input?.items || [];
  const byIso: Record<string, any> = {};

  for (const it of items) {
    const iso = (it.country || "").toUpperCase();
    const scheme = it.scheme || "Unknown";
    const mat = (it.material || "").toLowerCase().replace(/\s+/g, "-");
    const rate = typeof it.rate === "number" ? it.rate : Number(it.rate || 0);

    if (!iso || !scheme || !mat) continue;

    byIso[iso] ||= { name: iso, schemes: [] as any[] };

    let s = byIso[iso].schemes.find((x: any) => x.name === scheme);
    if (!s) {
      s = { id: scheme, name: scheme, effectiveFrom: it.effective_from || "2025-01-01", materials: {} as Record<string, number> };
      byIso[iso].schemes.push(s);
    }
    s.materials[mat] = rate;
  }
  return { countries: byIso };
}

export async function GET(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_TARIFFS_SOURCE_URL || process.env.NEXT_PUBLIC_TARIFFS_URL || "/data/tariffs-2025.json";
  try {
    const url = envUrl.startsWith("http") ? envUrl : new URL(envUrl, new URL(req.url).origin).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const normalized = normalizePayload(json);
      return NextResponse.json(normalized, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch {}
  try {
    const origin = new URL(req.url).origin;
    const res2 = await fetch(origin + "/data/tariffs-2025.json", { cache: "no-store" });
    if (res2.ok) {
      const json = await res2.json();
      const normalized = normalizePayload(json);
      return NextResponse.json(normalized, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch {}
  return NextResponse.json({ countries: {} }, { status: 503 });
}
