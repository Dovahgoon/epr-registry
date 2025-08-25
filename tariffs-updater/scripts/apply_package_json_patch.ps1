\
Param(
  [string]$ProjectRoot = "."
)

$pkgPath = Join-Path $ProjectRoot "package.json"
if (!(Test-Path $pkgPath)) {
  Write-Error "package.json not found at $pkgPath. Run this script from your project root or pass -ProjectRoot."
  exit 1
}

Write-Host "Patching $pkgPath..."

# Load package.json
$pkgRaw = Get-Content $pkgPath -Raw
$pkg = $pkgRaw | ConvertFrom-Json

# Ensure engines.node
if (-not $pkg.PSObject.Properties.Name.Contains("engines")) {
  $pkg | Add-Member -NotePropertyName engines -NotePropertyValue (@{})
}
$pkg.engines.node = "20.x"

# Ensure dependencies
if (-not $pkg.PSObject.Properties.Name.Contains("dependencies")) {
  $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue (@{})
}
$pkg.dependencies.next = "14.2.32"
$pkg.dependencies.react = "18.2.0"
$pkg.dependencies.'react-dom' = "18.2.0"

# Ensure devDependencies
if (-not $pkg.PSObject.Properties.Name.Contains("devDependencies")) {
  $pkg | Add-Member -NotePropertyName devDependencies -NotePropertyValue (@{})
}
$pkg.devDependencies.'@babel/core' = "^7.25.2"
$pkg.devDependencies.'babel-loader' = "^9.1.3"

# Ensure scripts
if (-not $pkg.PSObject.Properties.Name.Contains("scripts")) {
  $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue (@{})
}
$pkg.scripts.dev = "next dev"
$pkg.scripts.build = "next build"
$pkg.scripts.start = "next start"

# Backup and write
Copy-Item $pkgPath "$pkgPath.bak" -Force
$pkg | ConvertTo-Json -Depth 100 | Set-Content $pkgPath -Encoding UTF8

Write-Host "Done. Backup saved at package.json.bak"
