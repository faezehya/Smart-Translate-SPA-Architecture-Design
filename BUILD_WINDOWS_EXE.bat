@echo off
rem Switch to the directory where this script is located
cd /d "%~dp0"
title Smart Translate SPA - Build Windows Desktop (.exe)

echo ===============================================================================
echo          Smart Translate SPA - Build Windows Desktop Package (.exe)
echo ===============================================================================
echo.

rem Step 1: Check Node.js
echo [1/4] Checking Node.js runtime...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js is ready:
node -v
echo.

rem Step 2: Verify Electron and dependencies
echo [2/4] Verifying dependencies and Electron build tools...
if not exist "node_modules\" (
    echo [INFO] Installing project dependencies (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
)

rem Check if electron-builder is installed locally
if not exist "node_modules\electron-builder\" (
    echo [INFO] Installing Electron and Electron-Builder packaging tools...
    call npm install -D electron electron-builder
    if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
)
echo [SUCCESS] Electron build tools verified.
echo.

rem Step 3: Compile Web Assets
echo [3/4] Compiling frontend application (npm run build)...
call npm run build
if %ERRORLEVEL% NEQ 0 goto BUILD_ERROR
echo.
echo [SUCCESS] Web assets compiled into 'dist' directory.
echo.

rem Step 4: Run Electron Builder
echo [4/4] Packaging Windows Setup Installer and Portable .exe...
echo Note: electron-builder will download necessary Windows binaries on first build.
echo.

call .\node_modules\.bin\electron-builder.cmd --win --config electron-builder.json
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Retrying with npx electron-builder...
    call npx --no-install electron-builder --win --config electron-builder.json
)
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
echo [ERROR] Failed to install project dependencies.
echo Please check your internet connection or run 'npm install' manually.
echo ===============================================================================
echo.
pause
exit /b 1

:BUILD_ERROR
echo.
echo ===============================================================================
echo [ERROR] Frontend compilation (npm run build) failed.
echo Please inspect the error logs above.
echo ===============================================================================
echo.
pause
exit /b 1

:ELECTRON_ERROR
echo.
echo ===============================================================================
echo [ERROR] electron-builder encountered an issue while packaging.
echo Please try running:
echo   npm install -D electron electron-builder
echo   npm run dist:win
echo ===============================================================================
echo.
pause
exit /b 1

:END
echo.
pause
