// src/app/api/alerts/subscribe/route.ts
import { NextResponse } from "next/server";

/** 
 * Accepts a subscription payload and returns { ok: true }.
 * DB persistence is disabled in this file-based build.
 */
export async function POST(req: Request) {
  try {
    // Parse body but ignore persistence for this build
    const data = await req.json().catch(() => ({}));
    const iso2 = String(data?.iso2 || "").toUpperCase().slice(0, 2);
    const topic = String(data?.topic || "").toLowerCase().slice(0, 64);
    const uid = String(data?.uid || "").slice(0, 128);

    // TODO: Wire to a real store later (KV/Edge DB/file append)
    return NextResponse.json({ ok: true, received: { uid, iso2, topic } });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
