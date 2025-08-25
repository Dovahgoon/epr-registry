// src/app/api/reload/route.ts
import { NextResponse } from "next/server";
import { resetDataCache } from "@/lib/data";

export async function GET() {
  resetDataCache();
  return NextResponse.json({ ok: true, reloaded: true, ts: Date.now() });
}
