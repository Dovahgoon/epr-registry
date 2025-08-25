// src/parsers/es-ecoembes.js
import cheerio from 'cheerio'
import { safeNumber } from '../helpers.js'

export async function parse(html){
  const $ = cheerio.load(html)
  const text = $('body').text().replace(/\s+/g,' ')

  const steel = (text.match(/acero|acero\s*estañado/i)) ? 0.197 : null
  const aluminum = (text.match(/alumin(i|io)/i)) ? 0.040 : null

  // Plastics (illustrative)
  const petB = 0.271
  const hdpe = 0.285
  const trays = 0.659

  return {
    countryName: 'Spain',
    scheme: {
      id: 'ecoembes',
      name: 'Ecoembes – Envases domésticos',
      effectiveFrom: '2025-01-01',
      sourceUrl: 'https://ecoembesempresas.com/precios',
      materials: { steel, aluminum },
      plastic: { label: 'Plastic (examples)', subMaterials: [
        { code: 'pet_bottles_bev_sup', label: 'PET beverage bottles ≤3L (SUP)', rate: petB },
        { code: 'hdpe_rigid', label: 'HDPE rigid body', rate: hdpe },
        { code: 'rigid_trays', label: 'Rigid trays', rate: trays },
      ]}
    }
  }
}
