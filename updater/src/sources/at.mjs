// updater/src/sources/at.mjs
export async function fetchAT() {
  return {
    regulators: [
      { name: "VKS – Verpackungskoordinierungsstelle", url: "https://www.vks-gmbh.at/" }
    ],
    pros: [
      {
        name: "ARA – Altstoff Recycling Austria",
        url: "https://www.ara.at/",
        scope: "both",
        materials: []
      },
      {
        name: "Interzero Austria",
        url: "https://interzero.at/en/our-services/all-licensing-solutions/packaging/",
        scope: "both",
        materials: []
      },
      {
        name: "Reclay Austria",
        url: "https://activate.reclay.at/",
        scope: "both",
        materials: []
      }
    ]
  };
}
