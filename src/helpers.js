// helpers.js
import crypto from 'node:crypto'

export function hashString(s){
  return crypto.createHash('sha256').update(s).digest('hex')
}

export function eurPerTonneToKg(v){
  if (v == null) return null
  return Number(v) / 1000
}

export function emptyTariffs(year){
  return { version: 1, year, currency: "EUR/kg", countries: {} }
}

export function setScheme(target, countryIso, countryName, scheme){
  if(!target.countries[countryIso]) target.countries[countryIso] = { name: countryName, schemes: [] }
  target.countries[countryIso].schemes.push(scheme)
}

export function safeNumber(x){
  const n = Number(String(x).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
