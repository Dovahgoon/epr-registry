// tools/add-root-scripts.mjs
import fs from 'node:fs'
const pkgPath = './package.json'
if (!fs.existsSync(pkgPath)) {
  console.error('No package.json found. Run this from your app root.')
  process.exit(1)
}
const j = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
j.scripts = j.scripts || {}
if (!j.scripts.dev)   j.scripts.dev   = 'next dev'
if (!j.scripts.build) j.scripts.build = 'next build'
if (!j.scripts.start) j.scripts.start = 'next start'
if (!j.scripts['update:tariffs']) j.scripts['update:tariffs'] = 'npm --prefix tariffs-updater run update:tariffs'
fs.writeFileSync(pkgPath, JSON.stringify(j, null, 2))
console.log('✓ Added/ensured scripts: dev, build, start, update:tariffs')
