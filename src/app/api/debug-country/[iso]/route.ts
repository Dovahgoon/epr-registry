// src/app/api/debug-country/[iso]/route.ts
import { NextResponse } from "next/server";
import { fetchCountry } from "@/lib/data";

export const dynamic = "force-static";

export async function GET(_req: Request, ctx: { params: { iso: string } }) {
  try {
    const { country, details } = await fetchCountry(ctx.params.iso);
    return NextResponse.json({
      ok: true,
      iso: ctx.params.iso,
      country,
      details,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
