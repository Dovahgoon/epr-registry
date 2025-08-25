// src/app/api/auth/plan/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const plan = (url.searchParams.get("plan") || "free").toLowerCase();
  const valid = ["free","growth","pro"];
  const val = valid.includes(plan) ? plan : "free";
  const res = NextResponse.redirect(new URL("/features", url.origin));
  // Type expects lowercase 'lax' | 'strict' | 'none'
  res.cookies.set("plan", val, { httpOnly: false, path: "/", sameSite: "lax", maxAge: 60*60*24*7 });
  return res;
}
