// updater/src/sources/es.mjs
export async function fetchES() {
  return {
    regulators: [
      { name: "MITECO (RAP Envases)", url: "https://www.miteco.gob.es/es/calidad-y-evaluacion-ambiental/temas/prevencion-y-gestion-residuos/flujos/responsabilidad-ampliada.html" }
    ],
    pros: [
      {
        name: "Ecoembes",
        url: "https://ecoembesempresas.com/envases-domesticos",
        scope: "household",
        materials: ["paper","plastic","metal","composite"]
      },
      {
        name: "Ecovidrio",
        url: "https://www.ecovidrio.es/",
        scope: "household",
        materials: ["glass"]
      }
    ]
  };
}
