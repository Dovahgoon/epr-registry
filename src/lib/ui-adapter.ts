// src/lib/ui-adapter.ts
import { fetchCountry } from "@/lib/data";

export type UICountry = {
  iso: string;
  name: string;
  overview: { status: string; scope: string };
  producerRegister: { name: string; url?: string } | null;
  regulators: Array<{ name: string; url?: string }>;
  reportingFrequencies: string[];
  pros: Array<{ name: string; url?: string }>;
  links: Array<{ label: string; url?: string }>;
};

function isString(v: any): v is string {
  return typeof v === "string" && v.trim() !== "";
}
function arr<T = any>(v: any): T[] { return Array.isArray(v) ? v : (v == null ? [] : [v]); }
function str(v: any, fb = ""): string { return isString(v) ? v.trim() : fb; }

export function fetchCountryUI(iso: string): UICountry {
  const { country, details } = fetchCountry(iso);
  const code = (iso || "").toUpperCase();
  const name = (country as any)?.name ?? (country as any)?.country ?? (country as any)?.title ?? code;

  const overview = {
    status: str(details?.overview?.status ?? (country as any)?.status, "active"),
    scope: str(details?.overview?.scope ?? (country as any)?.scope, "Packaging"),
  };

  const prSrc = details?.producerRegister ?? (details as any)?.register ?? null;
  const producerRegister = prSrc
    ? { name: str((prSrc as any).name ?? (prSrc as any).label ?? prSrc), url: str((prSrc as any).url) || undefined }
    : null;

  const regulators = arr(details?.regulators ?? (details as any)?.regulatorsAndRegisters)
    .map((r: any) => ({ name: str(r?.name ?? r?.label ?? r), url: str(r?.url) || undefined }))
    .filter((r) => isString(r.name));

  const pros = arr(details?.pros ?? (details as any)?.organizations ?? (details as any)?.prosPackaging)
    .map((p: any) => ({ name: str(p?.name ?? p?.label ?? p), url: str(p?.url) || undefined }))
    .filter((p) => isString(p.name));

  const frequencies = arr(details?.reporting?.frequencies ?? (details as any)?.reportingFrequencies)
    .map((f: any) => str(f))
    .filter(isString);

  const links = arr(details?.links)
    .map((l: any) => ({ label: str(l?.label ?? l), url: str(l?.url) || undefined }))
    .filter((l) => isString(l.label));

  return { iso: code, name, overview, producerRegister, regulators, reportingFrequencies: frequencies, pros, links };
}
