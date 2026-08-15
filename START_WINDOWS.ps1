# PowerShell Starter for Smart Translate SPA
Set-Location -Path $PSScriptRoot

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               Smart Translate SPA - PowerShell Starter" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found on your system!" -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit 1
}

$nodeVer = node -v
Write-Host "[SUCCESS] Node.js is ready: $nodeVer" -ForegroundColor Green

# Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies (npm install)..." -ForegroundColor Yellow
    npm install
}

Write-Host "[SUCCESS] Starting development server at http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

npm run dev
