\
// tools/add-paths-alias.mjs
import fs from 'node:fs'

function ensure(file){
  let obj = {}
  if(fs.existsSync(file)){
    obj = JSON.parse(fs.readFileSync(file, 'utf-8'))
  }
  obj.compilerOptions = obj.compilerOptions || {}
  obj.compilerOptions.baseUrl = obj.compilerOptions.baseUrl || "."
  obj.compilerOptions.paths = obj.compilerOptions.paths || {}
  obj.compilerOptions.paths["@/*"] = obj.compilerOptions.paths["@/*"] || ["src/*"]
  fs.writeFileSync(file, JSON.stringify(obj, null, 2))
  console.log(`✓ Updated ${file}`)
}

if(fs.existsSync('tsconfig.json')) ensure('tsconfig.json')
else ensure('jsconfig.json')
