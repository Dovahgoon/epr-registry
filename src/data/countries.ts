// src/data/countries.ts
// EU-27 list + helpers

export type Country = { iso: string; name: string; iso2?: string }

export const COUNTRIES: Country[] = [
  { iso: "AT", name: "Austria" },
  { iso: "BE", name: "Belgium" },
  { iso: "BG", name: "Bulgaria" },
  { iso: "HR", name: "Croatia" },
  { iso: "CY", name: "Cyprus" },
  { iso: "CZ", name: "Czechia" },
  { iso: "DK", name: "Denmark" },
  { iso: "EE", name: "Estonia" },
  { iso: "FI", name: "Finland" },
  { iso: "FR", name: "France" },
  { iso: "DE", name: "Germany" },
  { iso: "GR", name: "Greece" },
  { iso: "HU", name: "Hungary" },
  { iso: "IE", name: "Ireland" },
  { iso: "IT", name: "Italy" },
  { iso: "LV", name: "Latvia" },
  { iso: "LT", name: "Lithuania" },
  { iso: "LU", name: "Luxembourg" },
  { iso: "MT", name: "Malta" },
  { iso: "NL", name: "Netherlands" },
  { iso: "PL", name: "Poland" },
  { iso: "PT", name: "Portugal" },
  { iso: "RO", name: "Romania" },
  { iso: "SK", name: "Slovakia" },
  { iso: "SI", name: "Slovenia" },
  { iso: "ES", name: "Spain" },
  { iso: "SE", name: "Sweden" },
]

// Convenience aliases
export const countries = COUNTRIES

// API compatibility helpers expected elsewhere in the app
export async function fetchCountries(): Promise<Country[]> {
  return COUNTRIES
}

export function getCountryByIso(iso: string): Country | undefined {
  const code = (iso || "").toUpperCase()
  return COUNTRIES.find(c => c.iso.toUpperCase() === code || (c.iso2?.toUpperCase?.() === code))
}

export default COUNTRIES
