// updater/src/sources/fi.mjs
export async function fetchFI() {
  return {
    regulators: [
      {"name": "Pirkanmaa ELY Centre (supervision)", "url": "https://www.ely-keskus.fi/en/web/ely-en"},
    ],
    pros: [
      {"name": "Finnish Packaging Producers Ltd", "url": "https://pakkaustuottajat.fi/en/", "scope": "both"},
      {"name": "Rinki Ltd (service company)", "url": "https://rinkiin.fi/en/producer-responsibility/packaging-producer-responsibility/", "scope": "both"},
    ]
  };
}
