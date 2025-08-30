// updater/src/sources/ee.mjs
export async function fetchEE() {
  return {
    regulators: [
      {"name": "Ministry of Climate / Environment", "url": "https://www.envir.ee/en"},
    ],
    pros: [
      {"name": "Eesti Pakendiringlus", "url": "https://www.tvo.ee/en/", "scope": "both"},
    ]
  };
}
