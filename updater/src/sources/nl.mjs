// updater/src/sources/nl.mjs
export async function fetchNL() {
  return {
    regulators: [
      { name: "Verpact (Packaging Waste Fund)", url: "https://www.verpact.nl/en/we-are-verpact" }
    ],
    pros: [
      {
        name: "Nedvang",
        url: "https://www.nedvang.nl/",
        scope: "household",
        materials: ["paper","plastic","metal","glass"]
      }
    ]
  };
}
