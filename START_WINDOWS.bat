@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Smart Translate SPA - Starter

echo ===============================================================================
echo                Smart Translate SPA - Windows Starter
echo ===============================================================================
echo.

echo [1/3] Checking Node.js runtime...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ===============================================================================
    echo [ERROR] Node.js was not found on your system PATH!
    echo.
    echo Please ensure Node.js is installed from https://nodejs.org/
    echo If you already installed Node.js, please RESTART your computer once.
    echo ===============================================================================
    echo.
    pause
    goto EXIT_SCRIPT
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
echo [SUCCESS] Node.js is detected: !NODE_VERSION!
echo.

echo [2/3] Checking dependencies (node_modules)...
if not exist "%~dp0node_modules\" (
    echo [INFO] First run detected. Installing dependencies via npm install...
    echo Please wait a moment...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install encountered an error.
        echo Please check your internet connection and try running 'npm install' manually.
        echo.
        pause
        goto EXIT_SCRIPT
    )
    echo [SUCCESS] Dependencies installed successfully.
    echo.
) else (
    echo [SUCCESS] Dependencies already exist.
    echo.
)

echo [3/3] Launching local server at http://localhost:3000 ...
echo ===============================================================================
echo   App URL: http://localhost:3000
echo   NOTE: Keep this window open while using the application.
echo ===============================================================================
echo.

start "" http://localhost:3000

call npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Dev server stopped with an error code.
    echo.
)

:EXIT_SCRIPT
echo.
echo Press any key to exit...
pause >nul
