import React from 'react';
import {
  Languages,
  RefreshCw,
  Trash2,
  Sun,
  Moon,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  isProbing: boolean;
  ollamaStatus: 'connected' | 'disconnected' | 'probing';
  onQuickSync: () => void;
  onClearCache: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isProbing,
  ollamaStatus,
  onQuickSync,
  onClearCache,
  onToggleTheme,
  onOpenSettings
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a1120]/90 border-b border-[#1e3152] px-4 md:px-8 py-3.5 shadow-xl shadow-black/30"
    >
      <div className="max-w-[1540px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Group */}
        <div className="flex items-center gap-3.5">
          <div
            id="brand-icon-box"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38bdf8] via-[#2563eb] to-[#1e3a8a] flex items-center justify-center text-white shadow-lg shadow-[#38bdf8]/20"
          >
            <Languages className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-white font-en uppercase">
                Smart Translate SPA
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 rounded">
                Editorial Mode
              </span>
            </div>
            <p className="text-xs text-[#94a9c9] font-medium tracking-wide">
              موتور ترجمه اسناد محلی و امن (Ollama & Cloud Pipeline)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Status Badge */}
          <div
            id="engine-status-badge"
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16243f] border border-[#1e3152] text-xs font-medium text-[#f1f5f9]"
          >
            {settings.engine === 'ollama' ? (
              <>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    ollamaStatus === 'connected'
                      ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.8)] pulse-dot'
                      : ollamaStatus === 'probing'
                      ? 'bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.8)] pulse-dot'
                      : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                  }`}
                />
                <span className="font-en text-xs font-semibold">
                  {ollamaStatus === 'connected'
                    ? `Ollama (${settings.ollamaModel || 'Active'})`
                    : ollamaStatus === 'probing'
                    ? 'Connecting to Ollama...'
                    : 'Ollama Offline'}
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                <span className="font-en text-xs font-semibold">
                  {settings.googleApiKey ? 'Google Cloud API' : 'Google Free Client'}
                </span>
              </>
            )}
          </div>

          {/* Quick Ollama Probe / Refresh */}
          <button
            id="quick-sync-btn"
            onClick={onQuickSync}
            disabled={isProbing}
            title="بررسی مجدد اتصال Ollama و دریافت مدل‌ها"
            aria-label="همگام‌سازی Ollama"
            className="p-2.5 rounded-xl text-[#94a9c9] hover:text-[#38bdf8] bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProbing ? 'animate-spin text-[#38bdf8]' : ''}`} />
          </button>

          {/* Clear Cache & Queue Trash Button */}
          <button
            id="clear-all-cache-btn"
            onClick={onClearCache}
            title="پاکسازی کامل صف، کش اسناد و بازنشانی"
            aria-label="پاکسازی کش"
            className="p-2.5 rounded-xl text-[#94a9c9] hover:text-rose-400 bg-[#16243f] hover:bg-rose-500/10 border border-[#1e3152] hover:border-rose-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={settings.theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
            aria-label="تغییر تم"
            className="p-2.5 rounded-xl text-[#94a9c9] hover:text-white bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/30 transition-all duration-200 focus:outline-none"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#38bdf8]" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            title="تنظیمات موتور و مدل‌ها"
            aria-label="تنظیمات"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/60 transition-all duration-200 shadow-md font-semibold text-xs md:text-sm"
          >
            <Settings className="w-4 h-4 text-[#38bdf8]" />
            <span className="hidden sm:inline">تنظیمات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
