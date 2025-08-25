import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_REVALIDATE_KEY;
  const provided = req.headers.get("x-admin-key") ?? "";
  if (!adminKey || provided !== adminKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const iso = (body.iso || "").toUpperCase();
  const tags: string[] = Array.isArray(body.tags) ? body.tags : [];
  if (iso) tags.push(`country-${iso}`);
  tags.push("countries");
  for (const t of new Set(tags)) {
    revalidateTag(t);
  }
  return NextResponse.json({ ok: true, revalidated: Array.from(new Set(tags)) });
}
