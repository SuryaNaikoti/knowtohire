@echo off
setlocal EnableDelayedExpansion
title KnowToHire Demo Seeder

echo.
echo ============================================================
echo  KnowToHire -- Demo Environment Setup
echo ============================================================
echo.

:: ── Project root (parent of scripts\) ───────────────────────────────────────
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\"
set "ENV_FILE=%ROOT_DIR%.env.local"
set "SEEDER=%SCRIPT_DIR%run-seed.cjs"
set "PAT=%SUPABASE_PAT%"
set "PROJECT_REF=roqbodprqmnwxdjsskgb"

:: ── Locate Node.js ───────────────────────────────────────────────────────────
set "NODE="
where node >nul 2>&1 && set "NODE=node"

if not defined NODE (
  for /d %%D in ("%ROOT_DIR%node-bin\node-v*-win-x64") do (
    if exist "%%D\node.exe" set "NODE=%%D\node.exe"
  )
)

if not defined NODE (
  echo [ERROR] Node.js not found. Install Node.js or check node-bin\ folder.
  pause
  exit /b 1
)

echo [INFO] Using Node: %NODE%
"%NODE%" --version
echo.

:: ── Fetch service_role key and write to .env.local ──────────────────────────
echo [INFO] Step 1: Fetching service_role key from Supabase Management API...

:: Write a tiny JS fetch script to get the service role key
set "FETCH_SCRIPT=%TEMP%\srk_fetch_%RANDOM%.cjs"
(
echo const https = require('https'^);
echo const fs    = require('fs'^);
echo const PAT   = '%PAT%';
echo const REF   = '%PROJECT_REF%';
echo const url   = `https://api.supabase.com/v1/projects/${REF}/api-keys`;
echo const opts  = { hostname: 'api.supabase.com', port: 443, path: `/v1/projects/${REF}/api-keys`, method: 'GET', headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' } };
echo const req   = https.request(opts, res =^> {
echo   let d = '';
echo   res.on('data', c =^> d += c^);
echo   res.on('end', ^(^) =^> {
echo     const keys = JSON.parse(d^);
echo     const srk  = (keys.find(k =^> k.name === 'service_role'^) ^|^| {}).api_key ^|^| '';
echo     const anon = (keys.find(k =^> k.name === 'anon'^) ^|^| {}).api_key ^|^| '';
echo     if (!srk^) { console.error('ERROR: service_role key not found'^); process.exit(1^); }
echo     const envPath = process.argv[2];
echo     let lines = [];
echo     if (fs.existsSync(envPath^)^) lines = fs.readFileSync(envPath,'utf8'^).split('\n'^).filter(l =^> !l.startsWith('SUPABASE_SERVICE_ROLE_KEY='^)^);
echo     lines.push(`SUPABASE_SERVICE_ROLE_KEY=${srk}`^);
echo     if (anon ^&^& !lines.some(l =^> l.startsWith('VITE_SUPABASE_ANON_KEY='^)^)^) lines.push(`VITE_SUPABASE_ANON_KEY=${anon}`^);
echo     fs.writeFileSync(envPath, lines.join('\n'^), 'utf8'^);
echo     console.log('OK:' + srk.substring(0,24^) + '...'^);
echo   }^);
echo }^);
echo req.on('error', e =^> { console.error(e.message^); process.exit(1^); }^);
echo req.end(^);
) > "%FETCH_SCRIPT%"

"%NODE%" "%FETCH_SCRIPT%" "%ENV_FILE%"
if errorlevel 1 (
  echo [ERROR] Failed to fetch service_role key.
  del "%FETCH_SCRIPT%" 2>nul
  pause
  exit /b 1
)
del "%FETCH_SCRIPT%" 2>nul
echo [INFO] .env.local updated with service_role key.
echo.

:: ── Set env vars for the seeder ──────────────────────────────────────────────
for /f "tokens=1,* delims==" %%A in ('type "%ENV_FILE%"') do (
  if "%%A"=="SUPABASE_SERVICE_ROLE_KEY" set "SUPABASE_SERVICE_ROLE_KEY=%%B"
  if "%%A"=="VITE_SUPABASE_URL" set "VITE_SUPABASE_URL=%%B"
)
if not defined VITE_SUPABASE_URL set "VITE_SUPABASE_URL=https://%PROJECT_REF%.supabase.co"

echo [INFO] Step 2: Running demo seeder (all 3 phases)...
echo ────────────────────────────────────────────────────────────
echo.

"%NODE%" "%SEEDER%" all

if errorlevel 1 (
  echo.
  echo [ERROR] Seeder exited with errors. Check output above.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  SUCCESS -- Demo environment is ready!
echo  Open http://localhost:5173/login to test logins.
echo ============================================================
echo.
pause
