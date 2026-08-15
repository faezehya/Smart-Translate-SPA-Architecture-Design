@echo off
chcp 65001 >nul
title Smart Translate SPA - اجرای برنامه
cls

echo ===============================================================================
echo     مترجم هوشمند اسناد سمت کاربر - Smart Translate SPA
echo ===============================================================================
echo.

:: Check Node.js installation
echo [1/3] بررسی وجود Node.js در سیستم...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] نرم‌افزار Node.js در سیستم شما یافت نشد!
    echo لطفا ابتدا Node.js (نسخه 18 یا بالاتر) را از سایت رسمی دانلود و نصب نمایید:
    echo https://nodejs.org/
    echo.
    echo پس از نصب، مجدداً این فایل را اجرا کنید.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [موفق] Node.js شناسایی شد (نسخه: %NODE_VER%)
echo.

:: Check and install dependencies if node_modules is missing
echo [2/3] بررسی کتابخانه‌ها و وابستگی‌های پروژه...
if not exist "node_modules\" (
    echo پوشه node_modules یافت نشد. در حال نصب خودکار وابستگی‌ها (npm install)...
    echo لطفا چند لحظه شکیبا باشید...
    call npm install
    if %errorlevel% neq 0 (
        echo [خطا] مشکلی در نصب پکیج‌ها رخ داد. لطفاً اتصال اینترنت را بررسی کنید.
        pause
        exit /b 1
    )
    echo [موفق] کتابخانه‌ها با موفقیت نصب شدند.
) else (
    echo [موفق] کتابخانه‌ها از قبل نصب هستند.
)
echo.

:: Start Development Server and Open Browser
echo [3/3] در حال راه‌اندازی سرور محلی و باز کردن مرورگر...
echo.
echo ===============================================================================
echo   آدرس برنامه: http://localhost:3000
echo   برای بستن برنامه، کافیست این پنجره را ببندید یا دکمه‌های Ctrl + C را بزنید.
echo ===============================================================================
echo.

:: Delay 2 seconds then open default browser in background
start /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the app
npm run dev

pause
