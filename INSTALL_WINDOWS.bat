@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Smart Translate SPA - 1-Click Installer

echo ===============================================================================
echo            Smart Translate SPA - 1-Click Installer for Windows
echo ===============================================================================
echo.

echo [1/4] Checking system prerequisites (Node.js)...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ===============================================================================
    echo [ERROR] Node.js was not found on your system!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing, restart your computer and run this installer again.
    echo ===============================================================================
    echo.
    pause
    goto EXIT_SCRIPT
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
for /f "tokens=*" %%m in ('npm -v 2^>nul') do set NPM_VERSION=%%m
echo [SUCCESS] Node.js (!NODE_VERSION!) and npm (!NPM_VERSION!) detected.
echo.

echo [2/4] Installing project dependencies (npm install)...
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install packages via npm.
    echo Please verify your internet connection.
    echo.
    pause
    goto EXIT_SCRIPT
)
echo [SUCCESS] All project dependencies have been installed.
echo.

echo [3/4] Configuring Ollama CORS variable (OLLAMA_ORIGINS=*)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')" >nul 2>&1
echo [SUCCESS] Ollama CORS permission set.
echo.

echo [4/4] Creating Desktop Shortcut...
set "TARGET_BAT=%~dp0START_WINDOWS.bat"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'Smart Translate SPA.lnk')); $s.TargetPath = '%TARGET_BAT%'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Launch Smart Translate SPA'; $s.Save()" >nul 2>&1
echo [SUCCESS] Desktop Shortcut created.
echo.

echo ===============================================================================
echo  Installation and configuration completed successfully!
echo ===============================================================================
echo.

:EXIT_SCRIPT
echo.
echo Press any key to exit or start the app...
pause >nul
start "" "%~dp0START_WINDOWS.bat"
