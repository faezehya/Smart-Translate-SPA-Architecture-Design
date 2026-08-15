@echo off
rem Switch to the directory where this script is located
cd /d "%~dp0"
title Smart Translate SPA - 1-Click Installer

echo ===============================================================================
echo            Smart Translate SPA - 1-Click Installer for Windows
echo ===============================================================================
echo.

rem Step 1: Check Node.js
echo [1/4] Checking system prerequisites (Node.js)...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js and npm detected:
call node -v
call npm -v
echo.

rem Step 2: Install dependencies
echo [2/4] Installing project dependencies (npm install)...
call npm install
if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
echo.
echo [SUCCESS] All project dependencies have been installed.
echo.

rem Step 3: Configure Ollama CORS
echo [3/4] Configuring Ollama CORS variable (OLLAMA_ORIGINS=*)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')" >nul 2>&1
echo [SUCCESS] Ollama CORS access variable set to '*' for current user.
echo.

rem Step 4: Create Desktop Shortcut
echo [4/4] Creating Desktop Shortcut for 1-click launch...
set "TARGET_BAT=%~dp0START_WINDOWS.bat"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'Smart Translate SPA.lnk')); $s.TargetPath = '%TARGET_BAT%'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Launch Smart Translate SPA'; $s.Save()" >nul 2>&1
echo [SUCCESS] Desktop Shortcut created if permitted by Windows.
echo.

echo ===============================================================================
echo  Installation and configuration completed successfully!
echo  You can now start the app by running START_WINDOWS.bat
echo ===============================================================================
echo.

goto END

:NO_NODE
echo.
echo ===============================================================================
echo [ERROR] Node.js was not found on your system!
echo Please download and install Node.js (version 18 or newer) from:
echo https://nodejs.org/
echo.
echo After installing Node.js, run this installer file again.
echo ===============================================================================
echo.
pause
exit /b 1

:INSTALL_ERROR
echo.
echo ===============================================================================
echo [ERROR] Failed to install packages via npm.
echo Please verify your internet connection and proxy settings.
echo ===============================================================================
echo.
pause
exit /b 1

:END
echo Press any key to start the application now, or close this window.
pause
call "%~dp0START_WINDOWS.bat"
