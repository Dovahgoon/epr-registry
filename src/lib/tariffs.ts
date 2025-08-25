// Materials we support
export const MATERIALS = ["paper", "plastic", "glass", "steel", "aluminum", "wood"] as const;
export type Material = typeof MATERIALS[number];

export type TariffRow = Record<Material, number | null>;

// NOTE: These are DEMO placeholders unless specified. Real rates vary by scheme/year.
// We'll wire a live JSON source later; for now we keep placeholders so the UI works.
export const TARIFFS: Record<string, TariffRow> = {
  NL: { paper: 0.10, plastic: 0.78, glass: 0.07, steel: 0.10, aluminum: 0.30, wood: 0.05 },
  DE: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  FR: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  ES: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  IT: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  AT: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  BE: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  BG: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  HR: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  CY: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  CZ: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  DK: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  EE: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  FI: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  GR: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  HU: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  IE: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  LV: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  LT: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  LU: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  MT: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  PL: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  PT: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  RO: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  SK: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  SI: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
  SE: { paper: null, plastic: null, glass: null, steel: null, aluminum: null, wood: null },
};
