// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { countries, countryDetails } from "@/lib/data";

export const dynamic = "force-static";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      counts: { countries: countries.length, detailKeys: Object.keys(countryDetails || {}).length },
      sample: countries.slice(0, 5).map((c: any) => ({ iso: c.iso, name: c.name ?? c.country ?? null })),
      detailSample: Object.keys(countryDetails || {}).slice(0, 10),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
