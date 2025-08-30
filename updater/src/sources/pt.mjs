// updater/src/sources/pt.mjs
export async function fetchPT() {
  return {
    regulators: [
      {"name": "Agência Portuguesa do Ambiente (APA)", "url": "https://apambiente.pt/"},
    ],
    pros: [
      {"name": "Sociedade Ponto Verde", "url": "https://www.pontoverde.pt/", "scope": "both"},
      {"name": "Novo Verde", "url": "https://www.novoverde.pt/", "scope": "both"},
      {"name": "Electrão", "url": "https://electrao.pt/", "scope": "both"},
    ]
  };
}
