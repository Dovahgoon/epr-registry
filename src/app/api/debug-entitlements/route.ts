// src/app/api/debug-entitlements/route.ts
import { getPlan } from "@/lib/entitlements";

export async function GET() {
  const plan = getPlan();
  return Response.json({ ok: true, plan });
}
