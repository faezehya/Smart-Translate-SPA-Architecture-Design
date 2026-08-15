@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Smart Translate SPA - Build Windows Desktop (.exe)

echo ===============================================================================
echo          Smart Translate SPA - Build Windows Desktop Package (.exe)
echo ===============================================================================
echo.

echo [1/4] Checking Node.js runtime...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ===============================================================================
    echo [ERROR] Node.js is required to build the executable!
    echo Please install Node.js from https://nodejs.org/
    echo ===============================================================================
    echo.
    pause
    goto EXIT_SCRIPT
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
echo [SUCCESS] Node.js is ready: !NODE_VERSION!
echo.

echo [2/4] Checking dependencies and Electron tools...
if not exist "%~dp0node_modules\" (
    echo [INFO] Installing project dependencies (npm install)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        goto EXIT_SCRIPT
    )
)

if not exist "%~dp0node_modules\electron-builder\" (
    echo [INFO] Installing Electron and packaging tools...
    call npm install -D electron electron-builder
    if errorlevel 1 (
        echo [ERROR] Failed to install electron-builder.
        pause
        goto EXIT_SCRIPT
    )
)
echo [SUCCESS] Build tools ready.
echo.

echo [3/4] Compiling frontend application (npm run build)...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend compilation (npm run build) failed.
    pause
    goto EXIT_SCRIPT
)
echo.
echo [SUCCESS] Web assets compiled into 'dist' folder.
echo.

echo [4/4] Generating Windows Installer and Portable .exe...
echo Please wait while electron-builder packages the desktop app...
echo.

call npx electron-builder --win --config electron-builder.json
if errorlevel 1 (
    echo.
    echo ===============================================================================
    echo [ERROR] electron-builder encountered an issue while packaging.
    echo ===============================================================================
    echo.
    pause
    goto EXIT_SCRIPT
)

echo.
echo ===============================================================================
echo [SUCCESS] Windows Setup Installer and Portable .exe created in 'release' folder!
echo ===============================================================================
echo.
echo Output Directory: %~dp0release
echo.

if exist "%~dp0release" (
    explorer "%~dp0release"
)

:EXIT_SCRIPT
echo.
echo Press any key to exit...
pause >nul
