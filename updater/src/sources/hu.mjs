// updater/src/sources/hu.mjs
export async function fetchHU() {
  return {
    regulators: [
      {"name": "MOHU (national concession)", "url": "https://mohu.hu/"},
    ],
    pros: [
      {"name": "MOHU Packaging EPR (operator)", "url": "https://mohu.hu/", "scope": "both"},
    ]
  };
}
