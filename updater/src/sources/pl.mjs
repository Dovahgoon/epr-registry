// updater/src/sources/pl.mjs
export async function fetchPL() {
  return {
    regulators: [
      {"name": "Ministry of Climate and Environment", "url": "https://www.gov.pl/web/climate"},
    ],
    pros: [
      {"name": "Rekopol (historic packaging PRO)", "url": "https://www.rekopol.pl/", "scope": "both"},
    ]
  };
}
