@echo off
cd /d "%~dp0"
title Smart Translate SPA - Desktop Builder (.exe)

echo ===============================================================================
echo          Smart Translate SPA - Build Windows Desktop Package (.exe)
echo ===============================================================================
echo.

echo [1/4] Checking Node.js runtime...
call node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js is ready:
call node -v
echo.

echo [2/4] Checking dependencies...
if not exist "node_modules\" (
    echo [INFO] Installing project dependencies (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
)
echo [SUCCESS] Dependencies verified.
echo.

echo [3/4] Compiling web application (npm run build)...
call npm run build
if %ERRORLEVEL% NEQ 0 goto BUILD_ERROR
echo.
echo [SUCCESS] Web assets compiled.
echo.

echo [4/4] Generating Windows Installer and Portable .exe...
echo Please wait while electron-builder packages the application...
echo.

call npm run dist:win
if %ERRORLEVEL% NEQ 0 goto PACK_ERROR

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
goto END

:NO_NODE
echo.
echo ===============================================================================
echo [ERROR] Node.js was not found on your system!
echo Please download and install Node.js (LTS version) from: https://nodejs.org/
echo After installation, restart your computer and run this file again.
echo ===============================================================================
goto END

:INSTALL_ERROR
echo.
echo ===============================================================================
echo [ERROR] Failed to install project dependencies.
echo Please check your internet connection and try running 'npm install' manually.
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
echo Please try running 'npm run dist:win' directly in terminal to see detailed logs.
echo ===============================================================================
goto END

:END
echo.
echo Press any key to exit...
pause >nul
