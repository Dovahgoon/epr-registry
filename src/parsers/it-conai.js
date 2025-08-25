// src/parsers/it-conai.js
import pdf from 'pdf-parse'
import { eurPerTonneToKg, safeNumber } from '../helpers.js'

export async function parse(buffer){
  const data = await pdf(buffer)
  const text = data.text.replace(/\s+/g,' ')

  function findEuroPerTonne(regex){
    const m = text.match(regex)
    return m ? eurPerTonneToKg(safeNumber(m[1])) : null
  }

  // Examples (adjust regexes to the official 2025 guide formatting)
  const steel = findEuroPerTonne(/Acciaio[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.005
  const aluminum = findEuroPerTonne(/Alluminio[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.012
  const glass = findEuroPerTonne(/Vetro[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.015
  const wood = findEuroPerTonne(/Legno[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.007
  const paper = findEuroPerTonne(/Carta[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.065

  // Plastic bands
  const A11 = findEuroPerTonne(/A1\.1[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.024
  const A12 = findEuroPerTonne(/A1\.2[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.090
  const A2  = findEuroPerTonne(/A2[^\d]*([0-9]+[\.,]?[0-9]*)\s*€/i) || 0.220

  return {
    countryName: 'Italy',
    scheme: {
      id: 'conai',
      name: 'CONAI – Environmental Contribution (CAC)',
      effectiveFrom: '2025-01-01',
      sourceUrl: 'https://www.cial.it/wp-content/uploads/2025/01/Guida_Conai_Contributo_Ambientale_2025.pdf',
      materials: { steel, aluminum, glass, wood, paper },
      plastic: {
        label: 'Plastic bands (CONAI)',
        subMaterials: [
          { code: 'A1_1', label: 'Band A1.1', rate: A11 },
          { code: 'A1_2', label: 'Band A1.2', rate: A12 },
          { code: 'A2', label: 'Band A2', rate: A2 },
        ]
      }
    }
  }
}
