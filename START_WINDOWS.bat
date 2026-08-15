@echo off
rem Switch to the directory where this script is located
cd /d "%~dp0"
title Smart Translate SPA - Starter

echo ===============================================================================
echo                Smart Translate SPA - Windows Starter
echo ===============================================================================
echo.

rem Step 1: Check Node.js
echo [1/3] Checking Node.js runtime...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto NO_NODE

echo [SUCCESS] Node.js is installed.
node -v
echo.

rem Step 2: Check dependencies
echo [2/3] Checking dependencies (node_modules)...
if not exist "node_modules\" goto INSTALL_DEPS
echo [SUCCESS] Dependencies already exist.
echo.
goto START_APP

:INSTALL_DEPS
echo [INFO] First run detected. Installing dependencies (npm install)...
echo Please wait a moment...
call npm install
if %ERRORLEVEL% NEQ 0 goto INSTALL_ERROR
echo [SUCCESS] Dependencies installed successfully.
echo.
goto START_APP

:START_APP
rem Step 3: Launch Local Server and Open Browser
echo [3/3] Starting local server at http://localhost:3000 ...
echo.
echo ===============================================================================
echo   App URL: http://localhost:3000
echo   Press Ctrl + C in this window to stop the application.
echo ===============================================================================
echo.

rem Open default browser in 2 seconds
start "" http://localhost:3000

rem Run dev server
call npm run dev
if %ERRORLEVEL% NEQ 0 goto DEV_ERROR

goto END

:NO_NODE
echo.
echo ===============================================================================
echo [ERROR] Node.js is not found on your system!
echo Please download and install Node.js (version 18 or newer) from:
echo https://nodejs.org/
echo.
echo After installing Node.js, restart your computer and run this file again.
echo ===============================================================================
echo.
pause
exit /b 1

:INSTALL_ERROR
echo.
echo ===============================================================================
echo [ERROR] npm install encountered an error.
echo Please check your internet connection and try running 'npm install' manually.
echo ===============================================================================
echo.
pause
exit /b 1

:DEV_ERROR
echo.
echo ===============================================================================
echo [ERROR] The application stopped unexpectedly.
echo ===============================================================================
echo.
pause
exit /b 1

:END
echo.
pause
