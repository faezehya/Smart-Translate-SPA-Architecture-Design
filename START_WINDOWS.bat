@echo off
setlocal EnableDelayedExpansion
title Smart Translate SPA - Starter
cls

echo ===============================================================================
echo                Smart Translate SPA - Windows Starter
echo ===============================================================================
echo.

:: 1. Check Node.js
echo [1/3] Checking Node.js runtime...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on your system!
    echo Please install Node.js (version 18 or newer) from: https://nodejs.org/
    echo After installing Node.js, run this file again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [SUCCESS] Node.js is ready (version: %NODE_VER%)
echo.

:: 2. Check dependencies
echo [2/3] Checking dependencies (node_modules)...
if not exist "node_modules\" (
    echo [INFO] First run detected. Installing dependencies (npm install)...
    echo Please wait a moment...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install packages. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed successfully.
) else (
    echo [SUCCESS] Dependencies already installed.
)
echo.

:: 3. Launch Development Server & Open Browser
echo [3/3] Starting local server at http://localhost:3000 ...
echo.
echo ===============================================================================
echo   App URL: http://localhost:3000
echo   Press Ctrl + C or close this window to stop the application.
echo ===============================================================================
echo.

:: Open default web browser after 2 seconds
start /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the app
call npm run dev

pause
