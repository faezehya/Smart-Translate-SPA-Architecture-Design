@echo off
chcp 65001 >nul
title Smart Translate SPA - پیکربندی Ollama CORS برای ویندوز
cls

echo ===============================================================================
echo     رفع خطای اتصال مرورگر به Ollama (CORS Configuration)
echo ===============================================================================
echo.
echo در حال تنظیم متغیر محیطی OLLAMA_ORIGINS برای دسترسی ایمن مرورگر به مدل‌های Ollama...
echo.

powershell -Command "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')"

echo [موفق] متغیر OLLAMA_ORIGINS با مقدار * برای حساب کاربری شما ذخیره شد.
echo.
echo نکات مهم:
echo ۱. اگر سرویس Ollama در تسک‌بار (Taskbar) در حال اجراست، روی آیکون آن راست‌کلیک کرده و Quit را بزنید و سپس مجدداً Ollama را باز کنید.
echo ۲. در پنجره تنظیمات برنامه Smart Translate SPA، دکمه «بررسی و دریافت» مدل‌ها را بزنید تا لیست مدل‌های نصب‌شده مانند llama3، qwen2.5 یا gemma2 بارگذاری شوند.
echo.
echo ===============================================================================
pause
