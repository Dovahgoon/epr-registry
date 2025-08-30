// updater/src/sources/be.mjs
export async function fetchBE() {
  return {
    regulators: [
      { name: "Interregional Packaging Commission (IRPC)", url: "https://www.ivcie.be/en/" }
    ],
    pros: [
      {
        name: "Fost Plus",
        url: "https://www.fostplus.be/en",
        scope: "household",
        materials: ["paper","plastic","metal","glass"]
      },
      {
        name: "Valipac",
        url: "https://www.valipac.be/en/",
        scope: "commercial",
        materials: ["paper","plastic","metal","glass"]
      }
    ]
  };
}
