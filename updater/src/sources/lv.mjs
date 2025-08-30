// updater/src/sources/lv.mjs
export async function fetchLV() {
  return {
    regulators: [
      {"name": "Ministry of Environmental Protection and Regional Development", "url": "https://www.varam.gov.lv/en"},
    ],
    pros: [
      {"name": "Zaļā josta", "url": "https://www.zalajosta.lv/en", "scope": "both"},
      {"name": "Latvijas Zaļais punkts", "url": "https://zalais.lv/en", "scope": "both"},
    ]
  };
}
