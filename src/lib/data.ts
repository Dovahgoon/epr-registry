// src/lib/data.ts
import type { Country } from '@/data/countries'
import { COUNTRIES, countries, fetchCountries, getCountryByIso } from '@/data/countries'
import type { CountryDetails } from '@/data/countryDetails'
import { COUNTRY_DETAILS, countryDetails, getCountryDetails } from '@/data/countryDetails'

/** Directory entry (used for 'pros' and 'consultants') */
export type CatalogEntry = {
  slug: string
  name: string
  countryIso: string
  countryIso2?: string
  type?: string
  email?: string
  city?: string
  tags?: string[]
  /** Optional contact/links used by /pro/[slug] page */
  url?: string
  phone?: string
  address?: string
}

export type RuleItem = {
  id: string
  title: string
  regime?: string
  law?: string
  notes?: string
  countryIso: string
  countryIso2?: string
  updatedAt?: string
}

export type Catalog = {
  countries: Country[]
  pros: CatalogEntry[]
  rules: RuleItem[]
  consultants: CatalogEntry[]
}

// Demo data shaped to what /api/search and /pro/[slug] expect
const DEMO_PROS: CatalogEntry[] = [
  { slug: 'verpact',   name: 'Verpact', type: 'scheme', countryIso: 'NL', countryIso2: 'NL', url: 'https://www.verpact.nl',   tags: ['EPR','packaging'] },
  { slug: 'fost-plus', name: 'Fost Plus', type: 'scheme', countryIso: 'BE', countryIso2: 'BE', url: 'https://www.fostplus.be', tags: ['EPR','packaging'] },
  { slug: 'conai',     name: 'CONAI', type: 'scheme', countryIso: 'IT', countryIso2: 'IT', url: 'https://www.conai.org',      tags: ['EPR','packaging'] },
]

const DEMO_RULES: RuleItem[] = [
  { id: 'nl-packaging-epr', title: 'NL Packaging EPR', regime: 'EPR', law: 'Packaging Decree', notes: 'Annual fees', countryIso: 'NL', countryIso2: 'NL', updatedAt: '2025-01-01' },
  { id: 'be-packaging-epr', title: 'BE Packaging EPR', regime: 'EPR', law: 'Green Dot tariffs', notes: 'By material', countryIso: 'BE', countryIso2: 'BE', updatedAt: '2025-01-01' },
  { id: 'it-packaging-epr', title: 'IT Packaging EPR', regime: 'EPR', law: 'CONAI CAC', notes: 'Bands', countryIso: 'IT', countryIso2: 'IT', updatedAt: '2025-01-01' },
]

const DEMO_CONSULTANTS: CatalogEntry[] = [
  { slug: 'green-consult-nl', name: 'Green Consult NL', type: 'consultant', email: 'hello@green-nl.test', city: 'Amsterdam', countryIso: 'NL', countryIso2: 'NL', url: 'https://consult-nl.example' },
  { slug: 'be-epr-advice',    name: 'BE EPR Advice',    type: 'consultant', email: 'contact@be-epr.test',  city: 'Brussels',  countryIso: 'BE', countryIso2: 'BE', url: 'https://be-epr.example' },
]

export function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function getCatalog() {
  const list = await fetchCountries()
  return {
    countries: list,
    pros: DEMO_PROS,
    rules: DEMO_RULES,
    consultants: DEMO_CONSULTANTS,
  }
}

// **Make fetchCountry synchronous** so both sync and `await` callers work.
export function fetchCountry(iso: string): { country: Country | null, details: CountryDetails | null } {
  const c = getCountryByIso(iso) ?? null
  const d = getCountryDetails(iso) ?? null
  return { country: c, details: d }
}

export function resetDataCache(): void {
  // Placeholder
}

// Re-export values from other modules
export { COUNTRIES, countries, COUNTRY_DETAILS, countryDetails, fetchCountries }

// Only re-export *external* types; local types are already exported above
export type { Country, CountryDetails }

export default {
  COUNTRIES, countries, COUNTRY_DETAILS, countryDetails,
  fetchCountries, fetchCountry, getCatalog, resetDataCache, slugify,
}
