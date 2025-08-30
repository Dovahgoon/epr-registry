// updater/src/sources/ro.mjs
export async function fetchRO() {
  return {
    regulators: [
      {"name": "Ministry of Environment, Water and Forests", "url": "https://www.mmediu.ro/"},
    ],
    pros: [
      {"name": "FEPRA", "url": "https://www.fepra.ro/", "scope": "both"},
      {"name": "Clean Recycle", "url": "https://clean-recycle.ro/", "scope": "both"},
      {"name": "Eco Synergy", "url": "https://www.ecosynergy.ro/", "scope": "both"},
    ]
  };
}
