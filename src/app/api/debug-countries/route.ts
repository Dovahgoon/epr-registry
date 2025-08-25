// src/app/api/debug-countries/route.ts
import { NextResponse } from "next/server";
import { countries, countryDetails } from "@/lib/data";

export const dynamic = "force-static";

export async function GET() {
  const sample = countries.slice(0, 15).map((c: any) => ({
    iso: c?.iso,
    name: c?.name ?? c?.country ?? c?.label ?? c?.title ?? null,
  }));
  const keys = Object.keys(countryDetails || {});
  return NextResponse.json({
    ok: true,
    countriesCount: countries.length,
    countryIsoList: countries.slice(0, 50).map((c: any) => c.iso),
    detailsCount: keys.length,
    detailsHasGR: keys.includes("GR"),
    detailsHasFI: keys.includes("FI"),
    firstDetailKeys: keys.slice(0, 50),
    sample,
  });
}
