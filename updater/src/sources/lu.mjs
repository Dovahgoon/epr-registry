// updater/src/sources/lu.mjs
export async function fetchLU() {
  return {
    regulators: [
      {"name": "Administration de l'environnement", "url": "https://environnement.public.lu/en.html"},
    ],
    pros: [
      {"name": "Valorlux", "url": "https://www.valorlux.lu/en", "scope": "both"},
    ]
  };
}
