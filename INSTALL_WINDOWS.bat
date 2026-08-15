@echo off
cd /d "%~dp0"
title Smart Translate SPA - 1-Click Installer

echo ===============================================================================
echo            Smart Translate SPA - 1-Click Installer for Windows
echo ===============================================================================
echo.

echo [1/4] Checking system prerequisites (Node.js)...
call node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js and npm detected:
call node -v
call npm -v
echo.

echo [2/4] Installing project dependencies (npm install)...
call npm install
if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
echo.
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
echo  Installation completed successfully!
echo ===============================================================================
echo.
goto END

:NO_NODE
echo.
echo ===============================================================================
echo [ERROR] Node.js was not found on your system!
echo Please download and install Node.js (LTS version) from: https://nodejs.org/
echo After installing, restart your computer and run this installer again.
echo ===============================================================================
goto END

:INSTALL_ERROR
echo.
echo ===============================================================================
echo [ERROR] Failed to install packages via npm.
echo Please verify your internet connection.
echo ===============================================================================
goto END

:END
echo.
echo Press any key to start the application now...
pause >nul
start "" "%~dp0START_WINDOWS.bat"
