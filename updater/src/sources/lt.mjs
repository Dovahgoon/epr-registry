// updater/src/sources/lt.mjs
export async function fetchLT() {
  return {
    regulators: [
      {"name": "Ministry of Environment", "url": "https://am.lrv.lt/en/"},
    ],
    pros: [
      {"name": "Žaliasis taškas (Green Dot Lithuania)", "url": "https://www.zaliasistaskas.lt/en/", "scope": "both"},
    ]
  };
}
