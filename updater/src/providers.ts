import type { CountryRegistry } from "./schemas.js";
import { Sources } from "./sources.js";

export async function loadCountry(iso: string): Promise<CountryRegistry> {
  const src = Sources[iso] || {};
  return {
    country: iso,
    updatedAt: new Date().toISOString(),
    regulators: src.regulators || [],
    pros: src.pros || [],
    notes: src.regulators || src.pros ? undefined : "No specific source mapped yet."
  };
}
