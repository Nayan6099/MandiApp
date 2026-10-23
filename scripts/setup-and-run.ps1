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

# Helpers for backend\.env
function Read-Secret($prompt) {
  $secure = Read-Host $prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}
function Get-EnvValue($text, $key) {
  $m = [regex]::Match($text, "(?m)^$key=(.*)$")
  if ($m.Success) { return $m.Groups[1].Value.Trim() } else { return '' }
}
function Set-EnvValue($text, $key, $value) {
  $line = "$key=$value"
  $rx = [regex]"(?m)^$key=.*$"
  if ($rx.IsMatch($text)) { return $rx.Replace($text, { param($m) $line }, 1) }
  return $text.TrimEnd() + "`r`n$line`r`n"
}

# 2. Database (Supabase) and API key in backend\.env
$envPath = Join-Path (Get-Location) 'backend\.env'
if (-not (Test-Path $envPath)) { Copy-Item 'backend\.env.example' $envPath }
$envText = [IO.File]::ReadAllText($envPath)

if ((Get-EnvValue $envText 'DATABASE_URL') -notmatch 'supabase\.com') {
  Step 'Supabase database'
  Write-Host 'In Supabase: Project -> Connect -> "Session pooler" -> copy the URI.'
  Write-Host 'It starts with postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-...pooler.supabase.com:5432/postgres'
  Write-Host '(Typing is hidden. Press Enter on an empty line to keep the current database.)'
  $uri = (Read-Secret 'Paste Supabase connection string').Trim()
  if ($uri) {
    if ($uri -notmatch '^postgres(ql)?://') { Fail 'That does not look like a postgresql:// connection string.' }
    if ($uri.Contains('[YOUR-PASSWORD]')) {
      $pw = Read-Secret 'Supabase database password'
      $uri = $uri.Replace('[YOUR-PASSWORD]', [uri]::EscapeDataString($pw))
      $pw = $null
    }
    $envText = Set-EnvValue $envText 'DATABASE_URL' $uri
    $uri = $null
    [IO.File]::WriteAllText($envPath, $envText)
    Write-Host 'Saved.'
  }
}

if (-not (Get-EnvValue $envText 'DATA_GOV_API_KEY')) {
  Step 'data.gov.in API key'
  Write-Host 'From data.gov.in -> My Account -> API key. (Hidden. Press Enter to skip for now.)'
  $key = (Read-Secret 'Paste API key').Trim()
  if ($key) {
    if ($key -notmatch '^[A-Za-z0-9]+$') { Fail 'API key should contain only letters and numbers.' }
    $envText = Set-EnvValue $envText 'DATA_GOV_API_KEY' $key
    $key = $null
    [IO.File]::WriteAllText($envPath, $envText)
    Write-Host 'Saved.'
  }
}

# 3. Packages
Step 'Installing packages (first time takes a few minutes)'
pnpm install
if ($LASTEXITCODE -ne 0) { Fail 'pnpm install failed. Read the messages above.' }

# 4. Database
Step 'Checking the database connection'
node backend\scripts\ensure-db.mjs
if ($LASTEXITCODE -ne 0) {
  Fail 'Database check failed. Fix DATABASE_URL in backend\.env (or delete that line''s value) and run start.bat again.'
}

# 5. Start
if (-not (Get-EnvValue $envText 'DATA_GOV_API_KEY')) {
  Write-Host ''
  Write-Host 'Note: DATA_GOV_API_KEY is empty, so no prices will be downloaded yet.' -ForegroundColor Yellow
}
Step 'Starting API (port 4000) and website (port 3000). Press Ctrl+C to stop.'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-Command', 'Start-Sleep -Seconds 30; Start-Process http://localhost:3000'
pnpm dev
