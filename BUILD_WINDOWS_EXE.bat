@echo off
chcp 65001 >nul
title Smart Translate SPA - ساخت فایل نصبی ویندوز (.exe)
cls

echo ===============================================================================
echo     بسته‌بندی و ساخت خروجی اجرایی ویندوز (Smart Translate SPA Desktop .exe)
echo ===============================================================================
echo.

:: 1. Check Node.js
echo [1/4] بررسی وجود Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] Node.js در سیستم یافت نشد. لطفا ابتدا Node.js را نصب فرمایید.
    pause
    exit /b 1
)

:: 2. Check dependencies
echo [2/4] بررسی و نصب وابستگی‌های پکیج و Electron...
if not exist "node_modules\" (
    echo در حال نصب وابستگی‌های پروژه (npm install)...
    call npm install
)

:: 3. Build Web Assets
echo [3/4] کامپایل و ساخت کدهای فرانت‌اند (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [خطا] در فرآیند بیلد کدهای پروژه خطایی رخ داد!
    pause
    exit /b 1
)
echo [موفق] فایل‌های بهینه شده در پوشه dist ایجاد شدند.
echo.

:: 4. Run Electron Builder
echo [4/4] ساخت فایل نصبی و پرتابل ویندوز با electron-builder...
echo این فرآیند ممکن است چند دقیقه طول بکشد، لطفاً شکیبا باشید...
echo.

call npx electron-builder --win --config electron-builder.json

if %errorlevel% neq 0 (
    echo.
    echo [راهنما] در صورت عدم دانلود خودکار پکیج‌های بیلد، دستور زیر را اجرا کنید:
    echo npm install -D electron electron-builder
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo [تبریک] فایل نصبی (.exe) و پرتابل با موفقیت در پوشه «release» ساخته شد!
echo ===============================================================================
echo.
echo پوشه خروجی: %~dp0release
echo.

:: Open the release folder in Windows File Explorer
explorer "%~dp0release"

pause
