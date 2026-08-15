@echo off
chcp 65001 >nul
title Smart Translate SPA - نصب و پیکربندی اولیه در ویندوز
cls

echo ===============================================================================
echo     نصب و راه‌اندازی ۱ کلیکی Smart Translate SPA برای ویندوز
echo ===============================================================================
echo.

:: 1. Check Node.js
echo [گام ۱/۴] بررسی پیش‌نیازهای سیستمی...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] Node.js در سیستم شما یافت نشد!
    echo لطفاً Node.js را از لینک زیر دانلود و نصب فرمایید:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [موفق] Node.js نسخه %NODE_VER% و npm نسخه %NPM_VER% تایید شد.
echo.

:: 2. Install NPM packages
echo [گام ۲/۴] دانلود و نصب پکیج‌های مورد نیاز (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [خطا] در هنگام نصب کتابخانه‌ها خطایی رخ داد. اتصال اینترنت خود را چک کنید.
    pause
    exit /b 1
)
echo [موفق] کلیه وابستگی‌های برنامه نصب شدند.
echo.

:: 3. Configure Ollama CORS environment variable
echo [گام ۳/۴] تنظیم دسترسی مرورگر به Ollama (حل خطای CORS)...
echo در حال ثبت متغیر محیطی OLLAMA_ORIGINS=* در ویندوز...
powershell -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')" >nul 2>nul
echo [موفق] تنظیمات اتصال به مدل‌های Ollama لوکال اعمال گردید.
echo.

:: 4. Create Desktop Shortcut for easy 1-click launch
echo [گام ۴/۴] ایجاد میانبر روی دسکتاپ (Desktop Shortcut)...
set "CURRENT_DIR=%~dp0"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Smart Translate.lnk"
set "TARGET_BAT=%CURRENT_DIR%START_WINDOWS.bat"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_BAT%'; $s.WorkingDirectory = '%CURRENT_DIR%'; $s.Description = 'اجرای سریع Smart Translate SPA'; $s.Save()" >nul 2>nul

if exist "%SHORTCUT_PATH%" (
    echo [موفق] میانبر «Smart Translate» روی دسکتاپ شما ایجاد شد!
) else (
    echo [نکته] برای اجرای برنامه در دفعات بعد کافیست روی فایل START_WINDOWS.bat کلیک کنید.
)
echo.

echo ===============================================================================
echo  عملیات نصب و پیکربندی با موفقیت کامل انجام شد!
echo  برای اجرای برنامه، روی آیکون میانبر روی دسکتاپ یا START_WINDOWS.bat کلیک نمایید.
echo ===============================================================================
echo.

set /p RUN_NOW="آیا مایلید برنامه هم‌اکنون اجرا شود؟ (Y/N): "
if /i "%RUN_NOW%"=="Y" (
    call "%TARGET_BAT%"
)

pause
