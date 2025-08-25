// scripts/update-tariffs.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import got from 'got'
import { emptyTariffs, setScheme, hashString } from '../src/helpers.js'

// Resolve repo root (one level up from /scripts)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

// Load sources.json without experimental import warnings
async function loadSources() {
  const sourcesPath = new URL('../config/sources.json', import.meta.url)
  const raw = await fs.readFile(sourcesPath, 'utf-8')
  return JSON.parse(raw)
}

async function loadParserModule(spec) {
  // Allow values like "./src/parsers/nl-verpact.js" regardless of current file location
  const abs = spec.startsWith('.')
    ? path.resolve(repoRoot, spec.replace(/^\.\//, ''))
    : spec
  return import(pathToFileURL(abs).href)
}

async function fetchSource(src){
  const res = await got(src.url, {
    timeout: { request: 30000 },
    http2: true,
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; EPR-Tariffs-Updater/0.1)',
      'accept': 'text/html,application/pdf;q=0.9,*/*;q=0.8',
      'accept-language': 'en;q=0.9'
    }
  })
  return res.rawBody
}

async function main(){
  const sources = await loadSources()
  const year = sources.year
  const outFile = path.resolve(repoRoot, 'data', `tariffs-${year}.json`)
  await fs.mkdir(path.dirname(outFile), { recursive: true })
  const result = emptyTariffs(year)

  for(const src of sources.sources){
    if(!src.enabled) continue
    try{
      const buf = await fetchSource(src)
      const mod = await loadParserModule(src.parser)
      let parsed
      if(src.type === 'pdf'){
        parsed = await mod.parse(buf)
      }else{
        const html = buf.toString('utf-8')
        parsed = await mod.parse(html)
      }
      if(parsed && parsed.scheme){
        setScheme(result, src.countryIso, parsed.countryName || src.countryIso, parsed.scheme)
        console.log(`✓ ${src.id} -> OK`)
      }else{
        console.warn(`! ${src.id} returned no scheme data`)
      }
    }catch(e){
      console.error(`× ${src.id} failed:`, e.message)
    }
  }

  const json = JSON.stringify(result, null, 2)
  let prev = ''
  try{ prev = await fs.readFile(outFile, 'utf-8') }catch{}
  if(hashString(prev) !== hashString(json)){
    await fs.writeFile(outFile, json, 'utf-8')
    console.log('Updated', path.basename(outFile))
  }else{
    console.log('No changes')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
