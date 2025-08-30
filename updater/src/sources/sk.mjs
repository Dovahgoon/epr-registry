// updater/src/sources/sk.mjs
export async function fetchSK() {
  return {
    regulators: [
      {"name": "Ministry of Environment of the Slovak Republic", "url": "https://www.minzp.sk/en/"},
    ],
    pros: [
      {"name": "ENVI-PAK", "url": "https://www.envipak.sk/en", "scope": "both"},
      {"name": "NATUR-PACK", "url": "https://www.naturpack.sk/en", "scope": "both"},
    ]
  };
}
