import { NextResponse } from "next/server";
import { countries, countryDetails } from "../../../../data";
export const dynamic = "force-static";
type Params = { params: { iso: string } };
export async function GET(_req: Request, { params }: Params) {
  const iso = params.iso?.toUpperCase();
  const country = (countries as any[]).find((c: any) => (c?.iso ?? c?.ISO ?? c?.code)?.toUpperCase() === iso) ?? null;
  const details = (countryDetails as Record<string, any>)?.[iso] ?? null;
  return NextResponse.json({ country, details });
}
