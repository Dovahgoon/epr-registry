// updater/src/sources/ie.mjs
export async function fetchIE() {
  return {
    regulators: [
      {"name": "Environmental Protection Agency (EPA)", "url": "https://www.epa.ie/"},
    ],
    pros: [
      {"name": "Repak", "url": "https://repak.ie/", "scope": "both"},
    ]
  };
}
