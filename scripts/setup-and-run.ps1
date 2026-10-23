# Mandi Bhav - one-click setup and run for Windows.
# Started by start.bat. Safe to run again: steps that are already done are skipped.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Step($text) { Write-Host ''; Write-Host "==> $text" -ForegroundColor Cyan }
function Fail($text) { Write-Host ''; Write-Host "ERROR: $text" -ForegroundColor Red; exit 1 }

Write-Host 'Mandi Bhav - setup and run' -ForegroundColor Green

# 1. Tools
Step 'Checking Node.js and pnpm'
foreach ($cmd in @('node', 'pnpm')) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { Fail "$cmd is not installed or not on PATH." }
}
Write-Host ("node " + (node -v) + "   pnpm " + (pnpm -v))

# 2. Database login in backend\.env (asked only once)
$envPath = Join-Path (Get-Location) 'backend\.env'
if (-not (Test-Path $envPath)) { Copy-Item 'backend\.env.example' $envPath }
$envText = [IO.File]::ReadAllText($envPath)
$dockerUrl = 'DATABASE_URL=postgres://mandi:mandi_local_pw@localhost:5432/mandi_bhav'
if ($envText.Contains($dockerUrl)) {
  Step 'PostgreSQL login (saved only in backend\.env on this PC)'
  $user = Read-Host 'PostgreSQL username [postgres]'
  if (-not $user) { $user = 'postgres' }
  $secure = Read-Host 'PostgreSQL password' -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  $newUrl = 'DATABASE_URL=postgres://' + [uri]::EscapeDataString($user) + ':' + [uri]::EscapeDataString($plain) + '@localhost:5432/mandi_bhav'
  $envText = $envText.Replace($dockerUrl, $newUrl)
  [IO.File]::WriteAllText($envPath, $envText)
  $plain = $null
  Write-Host 'Saved.'
}

# 3. Packages
Step 'Installing packages (first time takes a few minutes)'
pnpm install
if ($LASTEXITCODE -ne 0) { Fail 'pnpm install failed. Read the messages above.' }

# 4. Database
Step 'Creating the database if needed'
node backend\scripts\ensure-db.mjs
if ($LASTEXITCODE -ne 0) {
  Fail 'Database step failed. If the password was wrong, open backend\.env, fix DATABASE_URL, and run start.bat again.'
}

# 5. Start
if ($envText -match '(?m)^DATA_GOV_API_KEY=\s*$') {
  Write-Host ''
  Write-Host 'Note: DATA_GOV_API_KEY is empty, so no prices will be downloaded yet.' -ForegroundColor Yellow
}
Step 'Starting API (port 4000) and website (port 3000). Press Ctrl+C to stop.'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-Command', 'Start-Sleep -Seconds 30; Start-Process http://localhost:3000'
pnpm dev
