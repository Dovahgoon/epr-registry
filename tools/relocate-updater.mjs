// tools/relocate-updater.mjs
// Moves updater files into ./tariffs-updater when you accidentally unpacked the updater in the app root.

import fs from 'node:fs'
import path from 'node:path'

const pkgPath = './package.json'
if (!fs.existsSync(pkgPath)) {
  console.error('No package.json found. Run this from the folder that currently shows name "epr-tariffs-updater".')
  process.exit(1)
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
if (!pkg.name || !pkg.name.startsWith('epr-tariffs-updater')) {
  console.error('This does not look like the updater package (name != epr-tariffs-updater*). Aborting.')
  process.exit(1)
}

const destDir = './tariffs-updater'
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir)

const toMove = ['config','src','scripts','.github','README_AUTO_UPDATER.md','package.json','package-lock.json']
for (const entry of toMove) {
  if (fs.existsSync(entry)) {
    const target = path.join(destDir, path.basename(entry))
    console.log(`→ Moving ${entry} → ${target}`)
    try {
      fs.renameSync(entry, target)
    } catch (e) {
      console.error('Failed to move', entry, e.message)
      process.exit(1)
    }
  }
}

// Write a minimal app root package.json if none exists after moving
if (!fs.existsSync('./package.json')) {
  const rootPkg = {
    "name": "epr-ppwr-directory-mvp",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "update:tariffs": "npm --prefix tariffs-updater run update:tariffs"
    }
  }
  fs.writeFileSync('./package.json', JSON.stringify(rootPkg, null, 2))
  console.log('✓ Wrote a minimal root package.json with dev/build/start scripts.')
} else {
  console.log('Root package.json already exists; not overwriting.')
}

console.log('Done. Next steps:')
console.log('  node tools/add-root-scripts.mjs')
console.log('  npm run build')
