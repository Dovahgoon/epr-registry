// tools/repair-layout.mjs
// Detects if your Next.js app folders were accidentally moved into ./tariffs-updater/
// and moves them back to the project root safely.

import fs from 'node:fs'
import path from 'node:path'

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }
function move(src, dest){
  ensureDir(path.dirname(dest))
  if(fs.existsSync(dest)){
    console.warn('! Skipping move because destination already exists:', dest)
    return
  }
  console.log('→ Move', src, '→', dest)
  fs.renameSync(src, dest)
}

const updater = 'tariffs-updater'
if(!fs.existsSync(updater)){
  console.log('No tariffs-updater/ folder found. Nothing to repair.')
  process.exit(0)
}

const candidates = [
  { from: path.join(updater, 'src', 'app'), to: path.join('src', 'app') },
  { from: path.join(updater, 'pages'),      to: 'pages' },
  { from: path.join(updater, 'public'),     to: 'public' },
  { from: path.join(updater, 'next.config.mjs'), to: 'next.config.mjs' },
  { from: path.join(updater, 'next.config.js'),  to: 'next.config.js' },
]

let movedAny = false
for(const c of candidates){
  if(fs.existsSync(c.from)){
    move(c.from, c.to); movedAny = true
  }
}

// If we moved src/app, make sure updater keeps its own src/ for parsers
const updaterParsers = path.join(updater, 'src', 'parsers')
if(fs.existsSync(updaterParsers)){
  console.log('✓ Updater parsers are in', updaterParsers)
}else{
  const maybeParsers = path.join(updater, 'parsers')
  if(fs.existsSync(maybeParsers)){
    move(maybeParsers, updaterParsers)
  }
}

// Ensure root package.json has scripts
const pkgPath = './package.json'
if(fs.existsSync(pkgPath)){
  const j = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  j.scripts = j.scripts || {}
  if(!j.scripts.dev) j.scripts.dev = 'next dev'
  if(!j.scripts.build) j.scripts.build = 'next build'
  if(!j.scripts.start) j.scripts.start = 'next start'
  if(!j.scripts['update:tariffs']) j.scripts['update:tariffs'] = 'npm --prefix tariffs-updater run update:tariffs'
  fs.writeFileSync(pkgPath, JSON.stringify(j, null, 2))
  console.log('✓ Ensured scripts in package.json (dev/build/start/update:tariffs)')
}else{
  // create minimal root package.json
  const minimal = {
    name: "epr-ppwr-directory-mvp",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      "update:tariffs": "npm --prefix tariffs-updater run update:tariffs"
    }
  }
  fs.writeFileSync(pkgPath, JSON.stringify(minimal, null, 2))
  console.log('✓ Wrote minimal package.json at root')
}

console.log('Done. Now run:')
console.log('  node -p "require(\'./package.json\').name"   // should NOT be epr-tariffs-updater')
console.log('  dir src app next.config.mjs                   // they should exist at root')
console.log('  npm run build')
