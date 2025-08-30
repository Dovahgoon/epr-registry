// updater/src/sources/bg.mjs
export async function fetchBG() {
  return {
    regulators: [
      {"name": "Ministry of Environment & Water", "url": "https://www.moew.government.bg/en/"},
    ],
    pros: [
      {"name": "ECOPACK Bulgaria", "url": "https://www.ecopack.bg/en", "scope": "both"},
      {"name": "ECOBULPACK", "url": "https://www.ecobulpack.bg/", "scope": "both"},
      {"name": "Eco Partners Bulgaria", "url": "https://ecopartners.bg/en/", "scope": "both"},
    ]
  };
}
