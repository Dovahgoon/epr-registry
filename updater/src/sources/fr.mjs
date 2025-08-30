// updater/src/sources/fr.mjs
export async function fetchFR() {
  return {
    regulators: [
      { name: "Ministry | ADEME (via eco-organismes)", url: "https://www.citeo.com/" }
    ],
    pros: [
      {
        name: "Citeo",
        url: "https://www.citeo.com/",
        scope: "household",
        materials: ["paper","plastic","metal","glass"]
      },
      {
        name: "Adelphe (brand within Citeo)",
        url: "https://www.adelphe.fr/",
        scope: "household",
        materials: ["paper","plastic","metal","glass"]
      }
    ]
  };
}
