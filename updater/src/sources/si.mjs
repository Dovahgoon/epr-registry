// updater/src/sources/si.mjs
export async function fetchSI() {
  return {
    regulators: [
      {"name": "ARSO – Slovenian Environment Agency", "url": "https://www.arso.gov.si/en/"},
    ],
    pros: [
      {"name": "SLOPAK", "url": "https://www.slopak.si/", "scope": "both"},
    ]
  };
}
