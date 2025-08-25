// src/app/api/debug-ui-country/[iso]/route.ts
import { NextResponse } from "next/server";
import { fetchCountryUI } from "@/lib/ui-adapter";

export const dynamic = "force-static";

export async function GET(_req: Request, ctx: { params: { iso: string } }) {
  const ui = fetchCountryUI(ctx.params.iso);
  return NextResponse.json({ ok: true, ui });
}
