\
Param(
  [string]$ProjectRoot = "."
)

$patterns = @(
  "from\s+'fs'",
  "from\s+`"node:fs`"",
  "from\s+'path'",
  "from\s+`"node:path`"",
  "from\s+'pg'",
  "from\s+'postgres'",
  "from\s+'kysely'",
  "process\.env",
  "from\s+'crypto'",
  "from\s+'zlib'"
)

$clientFiles = Get-ChildItem -Path (Join-Path $ProjectRoot "app") -Include *.tsx,*.ts,*.jsx,*.js -Recurse -ErrorAction SilentlyContinue |
  Where-Object {
    try {
      (Get-Content $_.FullName -Raw) -match "'use client'"
    } catch { $false }
  }

if (!$clientFiles) {
  Write-Host "No client components found under /app."
  exit 0
}

$found = $false
foreach ($file in $clientFiles) {
  $content = Get-Content $file.FullName -Raw
  foreach ($pat in $patterns) {
    if ($content -match $pat) {
      if (-not $found) {
        Write-Host "⚠ Found Node-only usage in client components:" -ForegroundColor Yellow
        $found = $true
      }
      Write-Host " - $($file.FullName)  matches: $pat" -ForegroundColor Yellow
    }
  }
}

if (-not $found) {
  Write-Host "✓ No Node-only APIs detected in 'use client' files."
} else {
  Write-Host "`nFix: Move the matching imports/calls into server-only modules (e.g., /lib/server/*) and call them from Server Components or API routes." -ForegroundColor Yellow
}
