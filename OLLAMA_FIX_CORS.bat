@echo off
cd /d "%~dp0"
title Smart Translate SPA - Fix Ollama CORS

echo ===============================================================================
echo                Fix Ollama CORS Configuration for Windows
echo ===============================================================================
echo.
echo Setting environment variable OLLAMA_ORIGINS=* for Ollama browser access...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')"

echo.
echo [SUCCESS] OLLAMA_ORIGINS variable is now configured with value '*'.
echo.
echo Important Notes:
echo 1. If Ollama is running in your taskbar system tray, right-click and 'Quit Ollama'.
echo 2. Start Ollama again to apply the new CORS permission.
echo 3. In Smart Translate SPA Settings, click 'Probe Models' to connect.
echo.
echo ===============================================================================
pause
