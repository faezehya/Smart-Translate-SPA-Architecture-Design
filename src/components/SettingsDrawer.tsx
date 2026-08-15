import React, { useState } from 'react';
import {
  X,
  Sliders,
  Server,
  Key,
  Layers,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { AppSettings, OllamaModel, TranslationEngine } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  settings: AppSettings;
  ollamaModels: OllamaModel[];
  isProbing: boolean;
  ollamaStatus: 'connected' | 'disconnected' | 'probing';
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onProbeOllama: (host: string) => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  settings,
  ollamaModels,
  isProbing,
  ollamaStatus,
  onClose,
  onUpdateSettings,
  onProbeOllama,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<TranslationEngine>(settings.engine);
  const [hostInput, setHostInput] = useState(settings.ollamaHost);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    onShowToast(`دستور "${label}" کپی شد`, 'success');
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleTabChange = (tab: TranslationEngine) => {
    setActiveTab(tab);
    onUpdateSettings({ engine: tab });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="settings-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <aside
          id="settings-drawer-panel"
          className="w-screen max-w-md bg-[#0a1120] border-l border-[#1e3152] text-[#f1f5f9] shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-[#1e3152] bg-[#0a1120] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#16243f] border border-[#1e3152] text-[#38bdf8] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-[#f1f5f9]">
                تنظیمات موتور و خط لوله ترجمه
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#94a9c9] hover:text-white hover:bg-[#16243f] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Engine Tabs */}
            <div className="flex p-1 bg-[#16243f] border border-[#1e3152] rounded-xl">
              <button
                type="button"
                onClick={() => handleTabChange('ollama')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ollama'
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white shadow-md'
                    : 'text-[#94a9c9] hover:text-[#f1f5f9]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Ollama (محلی و امن)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('google')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'google'
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white shadow-md'
                    : 'text-[#94a9c9] hover:text-[#f1f5f9]'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Google Translate</span>
              </button>
            </div>

            {/* TAB 1: OLLAMA CONFIGURATION */}
            {activeTab === 'ollama' && (
              <div className="space-y-4">
                {/* Host Input & Probe */}
                <div className="space-y-1.5">
                  <label htmlFor="ollama-host-input" className="block text-xs font-bold text-[#f1f5f9]">
                    آدرس سرور لوکال Ollama (Host URL):
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="ollama-host-input"
                      type="text"
                      value={hostInput}
                      onChange={(e) => {
                        setHostInput(e.target.value);
                        onUpdateSettings({ ollamaHost: e.target.value });
                      }}
                      placeholder="http://127.0.0.1:11434"
                      className="flex-1 font-en px-3 py-2 rounded-xl bg-[#16243f] border border-[#1e3152] text-[#f1f5f9] text-sm focus:outline-none focus:border-[#38bdf8]"
                    />
                    <button
                      type="button"
                      onClick={() => onProbeOllama(hostInput)}
                      disabled={isProbing}
                      className="px-3.5 py-2 rounded-xl bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] text-[#38bdf8] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                      <span>بررسی</span>
                    </button>
                  </div>
                </div>

                {/* Model Selection Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="ollama-model-select" className="text-xs font-bold text-[#f1f5f9]">
                      مدل شناسایی‌شده در سیستم:
                    </label>
                    <span className="font-en text-[11px] text-[#38bdf8] font-medium">
                      {ollamaModels.length} Model{ollamaModels.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <select
                    id="ollama-model-select"
                    value={settings.ollamaModel}
                    onChange={(e) => onUpdateSettings({ ollamaModel: e.target.value })}
                    className="w-full font-en px-3 py-2 rounded-xl bg-[#16243f] border border-[#1e3152] text-[#f1f5f9] text-sm focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                  >
                    {ollamaModels.length === 0 ? (
                      <option value="">مدلی یافت نشد (دکمه بررسی را بزنید)</option>
                    ) : (
                      ollamaModels.map((m) => {
                        const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(1);
                        return (
                          <option key={m.name} value={m.name} className="bg-[#0a1120] text-[#f1f5f9]">
                            {m.name} ({sizeGB} GB)
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                {/* Temperature Slider with Live Dynamic Number */}
                <div className="space-y-2 bg-[#16243f] p-3.5 rounded-xl border border-[#1e3152]">
                  <div className="flex items-center justify-between">
                    <label htmlFor="temp-range-input" className="text-xs font-bold text-[#f1f5f9]">
                      میزان خلاقیت (Temperature):
                    </label>
                    <span id="temp-display-val" className="font-en font-bold text-xs text-[#38bdf8] px-2 py-0.5 bg-[#0a1120] border border-[#1e3152] rounded-md">
                      {settings.ollamaTemp.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="temp-range-input"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.ollamaTemp}
                    onChange={(e) => onUpdateSettings({ ollamaTemp: parseFloat(e.target.value) })}
                    className="w-full accent-[#38bdf8] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#94a9c9] font-en">
                    <span>0.0 (دقیق و علمی)</span>
                    <span>0.5 (متعادل)</span>
                    <span>1.0 (خلاقانه)</span>
                  </div>
                </div>

                {/* CORS Help Box */}
                <div className="bg-[#070d18] border border-[#1e3152] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>راهنمای دسترسی مرورگر (حل خطای CORS)</span>
                  </div>
                  <p className="text-[11px] text-[#94a9c9] leading-relaxed">
                    اگر Ollama در پس‌زمینه روشن است اما شناسایی نمی‌شود، دستور زیر را در ترمینال اجرا کنید:
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#f1f5f9]">
                      <span>ویندوز (PowerShell):</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User'); taskkill /F /IM "ollama.exe" /IM "ollama app.exe"; Start-Process "ollama app.exe"`,
                            'PowerShell'
                          )
                        }
                        className="text-[#38bdf8] hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedCmd === 'PowerShell' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        کپی
                      </button>
                    </div>
                    <code className="block font-en text-[10px] bg-[#0a1120] text-[#38bdf8] p-2 rounded border border-[#1e3152] select-all break-all">
                      [System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE TRANSLATE CONFIGURATION */}
            {activeTab === 'google' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="google-api-key-input" className="block text-xs font-bold text-[#f1f5f9]">
                    Google Cloud Translation API Key (اختیاری):
                  </label>
                  <input
                    id="google-api-key-input"
                    type="password"
                    value={settings.googleApiKey}
                    onChange={(e) => onUpdateSettings({ googleApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full font-en px-3 py-2 rounded-xl bg-[#16243f] border border-[#1e3152] text-[#f1f5f9] text-sm focus:outline-none focus:border-[#38bdf8]"
                  />
                  <span className="text-[11px] text-[#94a9c9] block">
                    در صورت خالی بودن کلید، از سرویس کلاینت فال‌بک رایگان و فوری مرورگر استفاده می‌شود.
                  </span>
                </div>
              </div>
            )}

            <hr className="border-[#1e3152]" />

            {/* SHARED PIPELINE OPTIMIZATION */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-[#f1f5f9] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#38bdf8]" />
                <span>تنظیمات تقطیع و خط لوله (Chunking Pipeline)</span>
              </h3>

              {/* Chunk Size Slider with Live Dynamic Number */}
              <div className="space-y-2 bg-[#16243f] p-3.5 rounded-xl border border-[#1e3152]">
                <div className="flex items-center justify-between">
                  <label htmlFor="chunk-size-slider" className="text-xs font-bold text-[#f1f5f9]">
                    حجم هر بخش تقطیع (Words):
                  </label>
                  <span id="chunk-size-display-val" className="font-en font-bold text-xs text-[#38bdf8] px-2 py-0.5 bg-[#0a1120] border border-[#1e3152] rounded-md">
                    {settings.chunkSize} کلمه
                  </span>
                </div>
                <input
                  id="chunk-size-slider"
                  type="range"
                  min="60"
                  max="400"
                  step="20"
                  value={settings.chunkSize}
                  onChange={(e) => onUpdateSettings({ chunkSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#38bdf8] cursor-pointer"
                />
                <span className="text-[11px] text-[#94a9c9] block">
                  تقطیع هوشمند مانع سرریز حافظه LLM و حفظ ساختار نحوی پاراگراف‌ها می‌شود.
                </span>
              </div>

              {/* Concurrency Selector */}
              <div className="space-y-1.5">
                <label htmlFor="concurrency-select" className="text-xs font-bold text-[#f1f5f9]">
                  تعداد درخواست‌های موازی (Concurrency):
                </label>
                <select
                  id="concurrency-select"
                  value={settings.concurrency}
                  onChange={(e) => onUpdateSettings({ concurrency: parseInt(e.target.value, 10) })}
                  className="w-full font-en px-3 py-2 rounded-xl bg-[#16243f] border border-[#1e3152] text-[#f1f5f9] text-sm focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                >
                  <option value={1} className="bg-[#0a1120] text-[#f1f5f9]">1 (بهینه برای سیستم‌های سبک)</option>
                  <option value={2} className="bg-[#0a1120] text-[#f1f5f9]">2 (پیشنهادی - متعادل)</option>
                  <option value={3} className="bg-[#0a1120] text-[#f1f5f9]">3 (حداکثر سرعت پردازش)</option>
                </select>
              </div>

              {/* Persian System Prompt */}
              <div className="space-y-1.5">
                <label htmlFor="system-prompt-input" className="text-xs font-bold text-[#f1f5f9]">
                  پرامپت سیستمی ترجمه فارسی (System Prompt):
                </label>
                <textarea
                  id="system-prompt-input"
                  rows={4}
                  value={settings.systemPrompt}
                  onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
                  className="w-full font-fa p-3 rounded-xl bg-[#16243f] border border-[#1e3152] text-[#f1f5f9] text-xs leading-relaxed focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              {/* Half-Space Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#16243f] border border-[#1e3152] cursor-pointer hover:border-[#38bdf8]/40">
                <input
                  type="checkbox"
                  checked={settings.autoHalfSpace}
                  onChange={(e) => onUpdateSettings({ autoHalfSpace: e.target.checked })}
                  className="w-4 h-4 accent-[#38bdf8] rounded cursor-pointer"
                />
                <span className="text-xs text-[#f1f5f9] font-medium">
                  اصلاح و اعمال خودکار نیم‌فاصله‌ها و یای اضافه در زبان فارسی
                </span>
              </label>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
