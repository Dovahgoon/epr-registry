// src/app/api/country/[iso]/live/route.ts
import { NextResponse } from "next/server";
import { getCountryDetails } from "@/data/countryDetails";
import { readFile } from "fs/promises";

export const revalidate = 900; // 15 minutes ISR

async function getTariffsFromLocal(): Promise<any | null> {
  try {
    const p = process.cwd() + "/src/data/tariffs-2025.json";
    const txt = await readFile(p, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, ctx: { params: { iso: string } }) {
  const iso = (ctx.params.iso || "").toUpperCase();
  const details = getCountryDetails(iso) ?? null;

  // Try remote first if provided
  let tariffs: any = null;
  const remote = process.env.NEXT_PUBLIC_TARIFFS_URL;
  if (remote) {
    try {
      const res = await fetch(remote, { next: { revalidate: 900 } });
      if (res.ok) {
        tariffs = await res.json();
      }
    } catch {}
  }
  if (!tariffs) {
    tariffs = await getTariffsFromLocal();
  }

  // Narrow to this ISO if structure is { [iso]: {...} } or array with countryIso
  let countryTariffs: any = null;
  if (tariffs) {
    if (Array.isArray(tariffs)) {
      countryTariffs = tariffs.filter((t: any) =>
        (t?.iso || t?.country || t?.countryIso || t?.countryIso2 || "").toUpperCase() === iso
      );
    } else if (typeof tariffs === "object") {
      const fromKey = tariffs[iso] ?? tariffs[iso.toLowerCase()] ?? null;
      countryTariffs = fromKey ?? null;
    }
  }

  return NextResponse.json({
    ok: true,
    iso,
    details,
    tariffs: countryTariffs,
    source: remote ? "remote" : "local",
  });
}
