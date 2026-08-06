# KnowToHire — Demo Environment Setup Script
# This script:
#   1. Fetches the Supabase service_role key via Management API (PAT)
#   2. Writes it to .env.local (gitignored — never committed)
#   3. Runs the Node seeder (run-seed.cjs) with all 3 phases
#
# Prerequisites: Node.js must be installed or available in node-bin/
#
# Usage (from the project root):
#   powershell -ExecutionPolicy Bypass -File scripts\setup-demo.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " KnowToHire — Demo Environment Setup" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# ── 1. Configuration ─────────────────────────────────────────────────────────
$PAT         = $env:SUPABASE_PAT
$PROJECT_REF = 'roqbodprqmnwxdjsskgb'
$SCRIPT_DIR  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ROOT_DIR    = Split-Path -Parent $SCRIPT_DIR
$ENV_FILE    = Join-Path $ROOT_DIR '.env.local'
$SEEDER      = Join-Path $SCRIPT_DIR 'run-seed.cjs'

# ── 2. Fetch service_role key from Supabase Management API ────────────────────
Write-Host "Step 1 › Fetching service_role key via Management API..." -ForegroundColor Yellow

$headers = @{
    'Authorization' = "Bearer $PAT"
    'Content-Type'  = 'application/json'
}

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/api-keys" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 30
} catch {
    Write-Host "  ❌ Failed to call Management API: $_" -ForegroundColor Red
    exit 1
}

$serviceRoleEntry = $response | Where-Object { $_.name -eq 'service_role' }
$anonEntry        = $response | Where-Object { $_.name -eq 'anon' }

if (-not $serviceRoleEntry) {
    Write-Host "  ❌ No service_role key found in response." -ForegroundColor Red
    exit 1
}

$SERVICE_ROLE_KEY = $serviceRoleEntry.api_key
$ANON_KEY         = if ($anonEntry) { $anonEntry.api_key } else { '' }

Write-Host "  ✅ service_role key retrieved (${SERVICE_ROLE_KEY.Substring(0,20)}...)" -ForegroundColor Green

# ── 3. Write keys to .env.local ───────────────────────────────────────────────
Write-Host "`nStep 2 › Writing keys to .env.local (gitignored)..." -ForegroundColor Yellow

# Read existing .env.local if it exists
$existingLines = @()
if (Test-Path $ENV_FILE) {
    $existingLines = Get-Content $ENV_FILE
}

# Remove existing SERVICE_ROLE_KEY line if present
$filteredLines = $existingLines | Where-Object { $_ -notmatch '^SUPABASE_SERVICE_ROLE_KEY=' }

# Add updated key
$filteredLines += "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
if ($ANON_KEY -and -not ($filteredLines | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' })) {
    $filteredLines += "VITE_SUPABASE_ANON_KEY=$ANON_KEY"
}

Set-Content -Path $ENV_FILE -Value $filteredLines -Encoding UTF8
Write-Host "  ✅ .env.local updated" -ForegroundColor Green

# ── 4. Locate Node.js binary ──────────────────────────────────────────────────
Write-Host "`nStep 3 › Locating Node.js binary..." -ForegroundColor Yellow

$NODE = $null

# Try system Node first
try {
    $sysNode = (Get-Command node -ErrorAction SilentlyContinue).Source
    if ($sysNode) { $NODE = $sysNode }
} catch {}

# Fall back to bundled node-bin
if (-not $NODE) {
    $nodeBinDir = Join-Path $ROOT_DIR 'node-bin'
    $bundledNode = Get-ChildItem -Path $nodeBinDir -Filter 'node.exe' -Recurse -ErrorAction SilentlyContinue |
                   Sort-Object { $_.FullName } -Descending |
                   Select-Object -First 1
    if ($bundledNode) { $NODE = $bundledNode.FullName }
}

if (-not $NODE) {
    Write-Host "  ❌ No Node.js found. Install Node.js or ensure node-bin/ is present." -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Using Node.js: $NODE" -ForegroundColor Green
$nodeVersion = & $NODE --version 2>&1
Write-Host "      Version: $nodeVersion" -ForegroundColor Gray

# ── 5. Run the seeder ─────────────────────────────────────────────────────────
Write-Host "`nStep 4 › Running demo seeder (all phases)..." -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────────`n"

$env:SUPABASE_SERVICE_ROLE_KEY = $SERVICE_ROLE_KEY
$env:VITE_SUPABASE_URL = "https://$PROJECT_REF.supabase.co"

& $NODE $SEEDER all

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Seeder exited with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " ✅  Demo environment setup complete!" -ForegroundColor Green
Write-Host " Open http://localhost:5173/login to test logins." -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green
