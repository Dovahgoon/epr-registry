export type SubMaterial = { code: string; label: string; rate: number };
export type Scheme = {
  id: string;
  name: string;
  effectiveFrom: string;
  sourceUrl: string;
  notes?: string;
  materials?: Partial<Record<MaterialKey, number>>;
  plastic?: { label: string; subMaterials: SubMaterial[] };
};

export type CountryTariffs = {
  name: string;
  schemes: Scheme[];
};

export type TariffsFile = {
  version: number;
  year: number;
  currency: "EUR/kg";
  countries: Record<string, CountryTariffs>;
};

export type MaterialKey = "paper"|"plastic"|"glass"|"steel"|"aluminum"|"wood";

export async function loadTariffs(): Promise<TariffsFile> {
  const data = await import("@/../data/tariffs-2025.json");
  return data as unknown as TariffsFile;
}

export function listCountries(tf: TariffsFile){
  return Object.entries(tf.countries).map(([iso, c]) => ({ iso, name: c.name }));
}
