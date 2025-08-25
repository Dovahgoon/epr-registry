// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { countries, type Country } from "@/data/countries";

function normalize(s: unknown): string {
  return String(s ?? "").toLowerCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = normalize(searchParams.get("q"));

  // Optional datasets from data/index (fall back to [] if not exported)
  let pros: any[] = [];
  let rules: any[] = [];
  let consultants: any[] = [];
  try {
    const mod: any = await import("@/data/index");
    pros = Array.isArray(mod.pros) ? mod.pros : [];
    rules = Array.isArray(mod.rules) ? mod.rules : [];
    consultants = Array.isArray(mod.consultants) ? mod.consultants : [];
  } catch {
    // ignore missing module/exports
  }

  const match = (...fields: unknown[]) =>
    q.length === 0 || fields.some((f) => normalize(f).includes(q));

  const out = {
    countries: countries.filter((c: Country) => match(c.name, (c as any).iso2 ?? c.iso)),
    pros: pros.filter((p: any) => match(p.name, p.type, p.countryIso2)),
    rules: rules.filter((r: any) => match(r.regime, r.law, r.notes, r.countryIso2)),
    consultants: consultants.filter((c: any) => match(c.name, c.email, c.city, c.countryIso2)),
  };

  return NextResponse.json({ ok: true, q, ...out });
}
