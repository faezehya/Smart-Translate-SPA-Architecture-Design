@echo off
cd /d "%~dp0"
title Smart Translate SPA - Build Portable .exe

echo ===============================================================================
echo            Smart Translate SPA - Build Portable Executable (.exe)
echo ===============================================================================
echo.

echo [1/5] Checking Node.js runtime...
call node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js is ready:
call node -v
echo.

echo [2/5] Cleaning background processes and temporary build directories...
taskkill /F /IM "SmartTranslateSPA.exe" /T >nul 2>&1
taskkill /F /IM "Smart Translate SPA.exe" /T >nul 2>&1
taskkill /F /IM "electron.exe" /T >nul 2>&1
if exist "release\win-unpacked" (
    echo [INFO] Removing old release\win-unpacked directory...
    rmdir /S /Q "release\win-unpacked" >nul 2>&1
)
echo [SUCCESS] Cleanup completed.
echo.

echo [3/5] Checking dependencies...
if not exist "node_modules\" (
    echo [INFO] Installing project dependencies (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
)
echo [SUCCESS] Dependencies verified.
echo.

echo [4/5] Compiling web application (npm run build)...
call npm run build
if %ERRORLEVEL% NEQ 0 goto BUILD_ERROR
echo.
echo [SUCCESS] Web assets compiled.
echo.

echo [5/5] Generating Standalone Portable .exe...
echo Please wait while electron-builder packages the portable application...
echo Note: If Antivirus blocks the file, temporarily disable Real-Time Protection.
echo.

call npm run dist:portable
if %ERRORLEVEL% NEQ 0 goto PACK_ERROR

echo.
echo ===============================================================================
echo [SUCCESS] Portable .exe created successfully in 'release' folder!
echo ===============================================================================
echo.
echo Output Directory: %~dp0release
echo.

if exist "%~dp0release" (
    explorer "%~dp0release"
)
goto END

:NO_NODE
echo.
echo ===============================================================================
echo [ERROR] Node.js was not found on your system!
echo Please download and install Node.js (LTS version) from: https://nodejs.org/
echo ===============================================================================
goto END

:INSTALL_ERROR
echo.
echo ===============================================================================
echo [ERROR] Failed to install project dependencies.
echo ===============================================================================
goto END

:BUILD_ERROR
echo.
echo ===============================================================================
echo [ERROR] Frontend compilation (npm run build) failed.
echo ===============================================================================
goto END

:PACK_ERROR
echo.
echo ===============================================================================
echo [ERROR] electron-builder encountered an issue while packaging.
echo.
echo Common Fixes for "ENOENT / rename electron.exe" Error:
echo 1. Windows Defender / Antivirus: Temporarily disable "Real-Time Protection"
echo    or add this project folder to Antivirus Exclusions.
echo 2. Check if the app or any electron process is running in Windows Task Manager.
echo 3. Delete the "release" folder and run this script again.
echo ===============================================================================
goto END

:END
echo.
echo Press any key to exit...
pause >nul
