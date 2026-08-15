@echo off
setlocal EnableDelayedExpansion
title Smart Translate SPA - 1-Click Installer
cls

echo ===============================================================================
echo            Smart Translate SPA - 1-Click Installer for Windows
echo ===============================================================================
echo.

:: 1. Check Node.js
echo [1/4] Checking system prerequisites (Node.js)...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on your system!
    echo Please download and install Node.js (v18+) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [SUCCESS] Node.js %NODE_VER% and npm %NPM_VER% detected.
echo.

:: 2. Install NPM packages
echo [2/4] Installing project dependencies (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install packages. Please check your internet connection.
    pause
    exit /b 1
)
echo [SUCCESS] All project dependencies have been installed.
echo.

:: 3. Configure Ollama CORS environment variable
echo [3/4] Configuring Ollama CORS environment variable (OLLAMA_ORIGINS=*)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')" >nul 2>nul
echo [SUCCESS] Ollama CORS access variable set to '*' for current user.
echo.

:: 4. Create Desktop Shortcut
echo [4/4] Creating Desktop Shortcut for 1-click launch...
set "CURRENT_DIR=%~dp0"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Smart Translate SPA.lnk"
set "TARGET_BAT=%CURRENT_DIR%START_WINDOWS.bat"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_BAT%'; $s.WorkingDirectory = '%CURRENT_DIR%'; $s.Description = 'Launch Smart Translate SPA'; $s.Save()" >nul 2>nul

if exist "%SHORTCUT_PATH%" (
    echo [SUCCESS] Desktop Shortcut created: 'Smart Translate SPA.lnk'
) else (
    echo [NOTE] You can launch the app anytime by double-clicking START_WINDOWS.bat
)
echo.

echo ===============================================================================
echo  Installation and configuration completed successfully!
echo  Double-click 'Smart Translate SPA' on your Desktop or run START_WINDOWS.bat
echo ===============================================================================
echo.

set /p RUN_NOW="Would you like to start the application now? (Y/N): "
if /i "%RUN_NOW%"=="Y" (
    call "%TARGET_BAT%"
)

pause
