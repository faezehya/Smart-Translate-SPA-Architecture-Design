import React, { useRef, useState, useEffect } from 'react';
import { Download, Sparkles, SlidersHorizontal, Check, RefreshCcw, Layers } from 'lucide-react';
import { DocumentItem, TonePreset, AppSettings } from '../types';

interface SplitPaneWorkspaceProps {
  document: DocumentItem;
  settings: AppSettings;
  onUpdateChunkTarget: (docId: string, chunkId: number, newTarget: string) => void;
  onUpdateTone: (tone: TonePreset) => void;
  onToggleSyncScroll: (enabled: boolean) => void;
  onOpenExportModal: () => void;
}

export const SplitPaneWorkspace: React.FC<SplitPaneWorkspaceProps> = ({
  document,
  settings,
  onUpdateChunkTarget,
  onUpdateTone,
  onToggleSyncScroll,
  onOpenExportModal
}) => {
  const [hoveredChunkId, setHoveredChunkId] = useState<number | null>(null);

  const sourcePaneRef = useRef<HTMLDivElement>(null);
  const targetPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Synchronized Scrolling Logic
  const handleScroll = (from: 'source' | 'target') => {
    if (!settings.syncScroll || isSyncingRef.current) return;

    const sourceEl = sourcePaneRef.current;
    const targetEl = targetPaneRef.current;
    if (!sourceEl || !targetEl) return;

    isSyncingRef.current = true;

    if (from === 'source') {
      const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);
      targetEl.scrollTop = percentage * (targetEl.scrollHeight - targetEl.clientHeight);
    } else {
      const percentage = targetEl.scrollTop / (targetEl.scrollHeight - targetEl.clientHeight || 1);
      sourceEl.scrollTop = percentage * (sourceEl.scrollHeight - sourceEl.clientHeight);
    }

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 40);
  };

  // Stats calculation
  const sourceWordCount = document.rawText.split(/\s+/).filter(Boolean).length;
  const targetWordCount = document.chunks
    .map((c) => c.target)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <section
      id="workspace-split-pane-section"
      className="bg-[#0a1120] border border-[#1e3152] rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px]"
    >
      {/* Workspace Toolbar */}
      <div className="bg-[#0a1120] border-b border-[#1e3152] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 rounded px-2 py-0.5 text-[10px] font-black font-en tracking-wider">
              EN → FA
            </span>
            <span className="font-black text-sm sm:text-base text-[#f1f5f9] truncate max-w-[200px] sm:max-w-xs">
              {document.name}
            </span>
          </div>

          <span className="font-en text-xs px-2.5 py-0.5 rounded bg-[#16243f] border border-[#1e3152] text-[#38bdf8] font-bold">
            {settings.engine === 'ollama' ? settings.ollamaModel || 'Ollama LLM' : 'Google API'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 bg-[#16243f] border border-[#1e3152] rounded-xl px-3 py-1">
            <span className="text-[11px] text-[#94a9c9] font-bold">لحن:</span>
            <select
              id="tone-select"
              value={settings.tone}
              onChange={(e) => onUpdateTone(e.target.value as TonePreset)}
              className="bg-transparent text-xs text-[#f1f5f9] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="formal" className="bg-[#0a1120] text-[#f1f5f9]">
                رسمی و دانشگاهی
              </option>
              <option value="fluent" className="bg-[#0a1120] text-[#f1f5f9]">
                روان و ادبی (فارسی شیوا)
              </option>
              <option value="literary" className="bg-[#0a1120] text-[#f1f5f9]">
                فصیح و کلاسیک
              </option>
              <option value="colloquial" className="bg-[#0a1120] text-[#f1f5f9]">
                صمیمانه و محاوره‌ای
              </option>
            </select>
          </div>

          {/* Sync Scroll Toggle */}
          <label className="flex items-center gap-2 text-xs text-[#94a9c9] hover:text-[#f1f5f9] cursor-pointer bg-[#16243f] border border-[#1e3152] rounded-xl px-3 py-1.5 select-none hover:border-[#38bdf8]/40 transition-colors">
            <input
              type="checkbox"
              id="sync-scroll-checkbox"
              checked={settings.syncScroll}
              onChange={(e) => onToggleSyncScroll(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#38bdf8] rounded cursor-pointer"
            />
            <span>اسکرول همگام</span>
          </label>

          {/* Export Menu Trigger */}
          <button
            id="open-export-modal-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#2563eb] hover:from-[#38bdf8] hover:to-[#1d4ed8] text-white font-bold text-xs shadow-md shadow-[#38bdf8]/20 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی سند</span>
          </button>
        </div>
      </div>

      {/* Split Panes Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 h-[calc(100vh-340px)] min-h-[480px]">
        {/* Source Pane (LTR) */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-l border-[#1e3152] bg-[#070d18] overflow-hidden">
          <div className="bg-[#0a1120] border-b border-[#1e3152] px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#94a9c9]">
            <span className="uppercase tracking-wider font-en">SOURCE TEXT (ENGLISH)</span>
            <span className="font-en text-[#94a9c9]">{sourceWordCount} words</span>
          </div>

          <div
            ref={sourcePaneRef}
            onScroll={() => handleScroll('source')}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-en text-sm leading-relaxed text-[#94a9c9]"
          >
            {document.chunks.map((chunk) => (
              <div
                key={`src-${chunk.id}`}
                id={`source-chunk-${chunk.id}`}
                onMouseEnter={() => setHoveredChunkId(chunk.id)}
                onMouseLeave={() => setHoveredChunkId(null)}
                className={`relative p-4 rounded-xl border transition-all duration-200 ${
                  hoveredChunkId === chunk.id
                    ? 'bg-[#16243f] border-[#38bdf8]/60 text-white shadow-lg'
                    : 'bg-[#16243f]/40 border-[#1e3152]'
                }`}
              >
                <span className="absolute top-2.5 left-3 font-en text-[10px] font-bold text-[#5e779d] select-none">
                  CHUNK #{chunk.id}
                </span>
                <p className="whitespace-pre-wrap pt-3 select-text font-normal">{chunk.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Pane (RTL & Inline Editable) */}
        <div className="flex flex-col bg-[#070d18] overflow-hidden">
          <div className="bg-[#0a1120] border-b border-[#1e3152] px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#94a9c9]">
            <span>ترجمه مقصد (فارسی - با امکان ویرایش درجا)</span>
            <span className="text-[#38bdf8] font-semibold">{targetWordCount} کلمه</span>
          </div>

          <div
            ref={targetPaneRef}
            onScroll={() => handleScroll('target')}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-fa text-base leading-[2] text-[#f1f5f9]"
          >
            {document.chunks.map((chunk) => (
              <div
                key={`tgt-${chunk.id}`}
                id={`target-chunk-${chunk.id}`}
                onMouseEnter={() => setHoveredChunkId(chunk.id)}
                onMouseLeave={() => setHoveredChunkId(null)}
                className={`relative p-4 rounded-xl border transition-all duration-200 ${
                  hoveredChunkId === chunk.id
                    ? 'bg-[#16243f] border-[#38bdf8]/60 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-[#38bdf8]/40'
                    : chunk.status === 'done'
                    ? 'bg-[#16243f]/70 border-[#1e3152]'
                    : chunk.status === 'translating'
                    ? 'bg-[#38bdf8]/10 border-[#38bdf8]/40 animate-pulse'
                    : 'bg-[#0a1120] border-[#1e3152]'
                }`}
              >
                <span className="absolute top-2.5 left-3 font-en text-[10px] font-bold text-[#5e779d] select-none">
                  CHUNK #{chunk.id}
                </span>

                {chunk.status === 'translating' ? (
                  <div className="py-3 flex items-center gap-2 text-[#38bdf8] text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                    <span>درحال ترجمه هوشمند با مدل زبانی...</span>
                  </div>
                ) : chunk.status === 'error' ? (
                  <div className="text-rose-400 text-xs py-1">
                    خطا در ترجمه: {chunk.errorMsg || 'پاسخ ناموفق'}
                  </div>
                ) : (
                  <textarea
                    value={chunk.target}
                    onChange={(e) => onUpdateChunkTarget(document.id, chunk.id, e.target.value)}
                    placeholder="در انتظار آغاز ترجمه..."
                    rows={Math.max(2, chunk.source.split('\n').length)}
                    className="w-full bg-transparent border-0 resize-none text-[#f1f5f9] placeholder:text-[#5e779d] focus:outline-none focus:ring-0 leading-[2] font-fa text-base"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
