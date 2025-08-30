// updater/src/sources/cz.mjs
export async function fetchCZ() {
  return {
    regulators: [
      {"name": "Ministry of the Environment", "url": "https://www.mzp.cz/en/"},
    ],
    pros: [
      {"name": "EKO-KOM", "url": "https://en.ekokom.cz/", "scope": "both"},
    ]
  };
}
