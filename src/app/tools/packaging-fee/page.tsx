// src/app/tools/packaging-fee/page.tsx
import { getCatalog } from "@/lib/data";
import Calculator from "./ui/Calculator";

export const runtime = "nodejs";

export default async function PackagingFeePage() {
  const { countries } = await getCatalog();
  const options = (countries || []).map((c:any) => ({
    iso2: String(c.iso2 || "").toUpperCase(),
    name: String(c.name || c.title || c.country || "").trim() || String(c.iso2).toUpperCase(),
  }));
  return <Calculator countries={options} />;
}
