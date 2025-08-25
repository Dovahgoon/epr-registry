// src/parsers/be-fostplus.js
import cheerio from 'cheerio'
import { safeNumber } from '../helpers.js'

export async function parse(html){
  const $ = cheerio.load(html)
  const text = $('body').text().replace(/\s+/g,' ')

  function find(label, regex){ const m = text.match(regex); return m ? safeNumber(m[1]) : null }

  const glass = find('glass', /glas[^\d]*([0-9]+[\.,][0-9]+)/i)
  const paper = find('paper', /(papier|karton|papier-?karton)[^\d]*([0-9]+[\.,][0-9]+)/i)
  const steel = find('steel', /(staal|ferro)[^\d]*([0-9]+[\.,][0-9]+)/i)
  const aluminum = find('aluminum', /(aluminium|aluminum)[^\d]*([0-9]+[\.,][0-9]+)/i)

  // Plastic examples
  const petClear = find('pet_clear', /(PET)[^\d]*([0-9]+[\.,][0-9]+)/i)
  const peFilms = find('pe_films', /(PE\s*films?)[^\d]*([0-9]+[\.,][0-9]+)/i)
  const otherFilms = find('other_films', /(andere\s*folies|autres\s*films)[^\d]*([0-9]+[\.,][0-9]+)/i)

  const subs = []
  if(petClear) subs.push({ code: 'pet_bottles_clear', label: 'PET bottles – clear', rate: petClear })
  if(peFilms) subs.push({ code: 'pe_films', label: 'PE films', rate: peFilms })
  if(otherFilms) subs.push({ code: 'other_films', label: 'Other plastic films', rate: otherFilms })

  return {
    countryName: 'Belgium',
    scheme: {
      id: 'fostplus',
      name: 'Fost Plus (Green Dot)',
      effectiveFrom: '2025-01-01',
      sourceUrl: 'https://www.fostplus.be/nl/leden/de-groene-punt-tarieven',
      materials: { paper, glass, steel, aluminum },
      plastic: subs.length ? { label: 'Plastic (examples)', subMaterials: subs } : undefined
    }
  }
}
