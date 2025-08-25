
// src/app/api/billing/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const plan = url.searchParams.get("plan") || "growth"; // "growth" or "pro"
  const price = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_GROWTH;

  if (!process.env.STRIPE_SECRET_KEY || !price) {
    return new Response(JSON.stringify({ ok:false, error:"Stripe not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_*." }), { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" } as any);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${url.origin}/features?status=success`,
    cancel_url: `${url.origin}/pricing?status=cancelled`,
  });

  return NextResponse.redirect(session.url!, 303);
}
