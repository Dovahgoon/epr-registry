import { NextResponse } from "next/server";
import { countries } from "../../../data";
export const dynamic = "force-static";
export async function GET() { return NextResponse.json(countries); }
