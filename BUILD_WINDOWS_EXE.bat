@echo off
rem Switch to the directory where this script is located
cd /d "%~dp0"
title Smart Translate SPA - Build Windows Executable (.exe)

echo ===============================================================================
echo          Smart Translate SPA - Build Windows Desktop Package (.exe)
echo ===============================================================================
echo.

rem Step 1: Check Node.js
echo [1/4] Checking Node.js runtime...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js is ready.
echo.

rem Step 2: Verify dependencies
echo [2/4] Verifying dependencies (node_modules)...
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
)
echo [SUCCESS] Dependencies verified.
echo.

rem Step 3: Build frontend assets
echo [3/4] Compiling frontend application (npm run build)...
call npm run build
if %ERRORLEVEL% NEQ 0 goto BUILD_ERROR
echo.
echo [SUCCESS] Web assets compiled into 'dist' directory.
echo.

rem Step 4: Run Electron Builder
echo [4/4] Generating Windows Installer and Portable .exe with electron-builder...
echo This process downloads Windows binaries on the first run. Please wait...
echo.

call npx electron-builder --win --config electron-builder.json
if %ERRORLEVEL% NEQ 0 goto ELECTRON_ERROR

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
echo [ERROR] Node.js is required to build the executable.
echo Please install Node.js from https://nodejs.org/
echo ===============================================================================
echo.
pause
exit /b 1

:INSTALL_ERROR
echo.
echo ===============================================================================
echo [ERROR] Failed to install dependencies via npm.
echo ===============================================================================
echo.
pause
exit /b 1

:BUILD_ERROR
echo.
echo ===============================================================================
echo [ERROR] Frontend build failed. Please check the logs above.
echo ===============================================================================
echo.
pause
exit /b 1

:ELECTRON_ERROR
echo.
echo ===============================================================================
echo [ERROR] electron-builder encountered an issue while packaging.
echo If electron or electron-builder are missing, run:
echo npm install -D electron electron-builder
echo ===============================================================================
echo.
pause
exit /b 1

:END
echo.
pause
