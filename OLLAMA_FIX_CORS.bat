@echo off
setlocal EnableDelayedExpansion
title Smart Translate SPA - Fix Ollama CORS
cls

echo ===============================================================================
echo                Fix Ollama CORS Configuration for Windows
echo ===============================================================================
echo.
echo Setting environment variable OLLAMA_ORIGINS=* for Ollama browser access...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')"

echo [SUCCESS] OLLAMA_ORIGINS variable is now configured with value '*'.
echo.
echo Important Notes:
echo 1. If the Ollama service/app is currently running in your system tray (Taskbar),
echo    right-click its icon, select 'Quit Ollama', and start Ollama again.
echo 2. In Smart Translate SPA Settings, click 'Probe Models' to load your local models.
echo.
echo ===============================================================================
pause
