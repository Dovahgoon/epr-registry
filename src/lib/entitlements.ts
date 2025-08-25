
// src/lib/entitlements.ts
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Plan = "free" | "growth" | "pro";

export async function getPlan(): Promise<Plan> {
  const session = await getServerSession(authOptions);
  const sPlan = (session?.user as any)?.plan as string | undefined;
  if (sPlan) {
    const p = sPlan.toLowerCase();
    if (p === "growth" || p === "pro") return p;
    return "free";
  }
  const c = cookies().get("plan")?.value;
  const plan = (c || "free").toLowerCase();
  if (plan === "growth" || plan === "pro") return plan;
  return "free";
}

export function planLabel(p: Plan) {
  if (p === "growth") return "Growth";
  if (p === "pro") return "Pro";
  return "Free";
}

export function hasFeature(p: Plan, feature: string): boolean {
  const matrix: Record<Plan, string[]> = {
    free: ["directory", "basic-ui"],
    growth: ["directory", "basic-ui", "calculators", "alerts", "vault"],
    pro: ["directory", "basic-ui", "calculators", "alerts", "vault", "api"],
  };
  return matrix[p].includes(feature);
}
