// Official homepages/lists to fall back to
export const Sources: Record<string, { regulators?: {name:string,url:string}[], pros?: {name:string,url:string}[] }> = {
  NL: { regulators:[{name:"Verpact",url:"https://www.verpact.nl/"}], pros:[{name:"Nedvang",url:"https://www.nedvang.nl/"}] },
  BE: { regulators:[{name:"Fost Plus",url:"https://www.fostplus.be/"}], pros:[{name:"Valipac",url:"https://www.valipac.be/"}] },
  IT: { regulators:[{name:"CONAI",url:"https://www.conai.org/"}], pros:[{name:"Consorzi CONAI",url:"https://www.conai.org/consorzi/"}] },
  ES: { regulators:[{name:"Ecoembes",url:"https://www.ecoembes.com/"}], pros:[{name:"Ecoembes Empresas",url:"https://www.ecoembes.com/es/empresas"}] },
  FR: { regulators:[{name:"Citeo",url:"https://www.citeo.com/"}], pros:[{name:"Citeo Entreprises",url:"https://www.citeo.com/entreprises"}] },
  DE: { regulators:[{name:"LUCID",url:"https://www.verpackungsregister.org/"}], pros:[{name:"Dual systems",url:"https://www.verpackungsregister.org/en/faq/dual-systems"}] },
  FI: { regulators:[{name:"Rinki Oy",url:"https://rinkiin.fi/"}], pros:[{name:"Rinki Producers",url:"https://rinkiin.fi/en/producers/"}] },
};
