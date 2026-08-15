@echo off
setlocal EnableDelayedExpansion
title Smart Translate SPA - Build Windows Executable (.exe)
cls

echo ===============================================================================
echo          Smart Translate SPA - Build Windows Desktop Package (.exe)
echo ===============================================================================
echo.

:: 1. Check Node.js
echo [1/4] Checking Node.js runtime...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to build the executable.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Check dependencies
echo [2/4] Verifying dependencies (node_modules)...
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies (npm install)...
    call npm install
)

:: 3. Build Web Assets
echo [3/4] Compiling frontend application (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Please review the error log above.
    pause
    exit /b 1
)
echo [SUCCESS] Web assets compiled into 'dist' folder.
echo.

:: 4. Run Electron Builder
echo [4/4] Generating Windows Installer and Portable .exe with electron-builder...
echo This process may take a few minutes on first run. Please wait...
echo.

call npx electron-builder --win --config electron-builder.json

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] electron-builder encountered an issue.
    echo If electron/electron-builder is not installed, you can install it via:
    echo npm install -D electron electron-builder
    echo.
    pause
    exit /b 1
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

pause
