// src/parsers/nl-verpact.js
import cheerio from 'cheerio'
import { safeNumber } from '../helpers.js'

export async function parse(html){
  const $ = cheerio.load(html)
  // NOTE: The real selectors may differ; adjust these to the live page structure.
  // We search for rows that contain material keywords and numeric rates.
  const text = $('body').text().replace(/\s+/g,' ')
  function findRate(regex){ const m = text.match(regex); return m ? safeNumber(m[1]) : null }

  const paper = findRate(/papier[^\d]*([0-9]+[\.,][0-9]+)/i)
  const glass = findRate(/glas[^\d]*([0-9]+[\.,][0-9]+)/i)
  const aluminum = findRate(/aluminium|aluminum[^\d]*([0-9]+[\.,][0-9]+)/i)
  const steel = findRate(/(staal|ferro|metalen)[^\d]*([0-9]+[\.,][0-9]+)/i) || null
  const wood = findRate(/hout[^\d]*([0-9]+[\.,][0-9]+)/i)

  // Plastic examples: rigid vs flexible
  const plasticRigid = findRate(/kunststof[^\d]*\(.*rigide.*\)[^\d]*([0-9]+[\.,][0-9]+)/i) || null
  const plasticFlex = findRate(/kunststof[^\d]*\(.*flexibel.*\)[^\d]*([0-9]+[\.,][0-9]+)/i) || null

  return {
    countryName: 'Netherlands',
    scheme: {
      id: 'verpact',
      name: 'Verpact (Afvalfonds Verpakkingen)',
      effectiveFrom: '2025-01-01',
      sourceUrl: 'https://www.verpact.nl/nl/tarieven',
      materials: { paper, glass, aluminum, steel, wood },
      plastic: {
        label: 'Plastic',
        subMaterials: [
          ...(plasticRigid ? [{ code: 'plastic_rigid', label: 'Plastic (rigid)', rate: plasticRigid }] : []),
          ...(plasticFlex ? [{ code: 'plastic_flexible', label: 'Plastic (flexible)', rate: plasticFlex }] : []),
        ]
      }
    }
  }
}
