// updater/src/sources/gr.mjs
export async function fetchGR() {
  return {
    regulators: [
      {"name": "Hellenic Recycling Agency (EOAN)", "url": "https://www.eoan.gr/"},
    ],
    pros: [
      {"name": "HERRCO", "url": "https://www.herrco.gr/en/", "scope": "both"},
    ]
  };
}
