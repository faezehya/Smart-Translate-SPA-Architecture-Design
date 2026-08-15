import React from 'react';
import { Play, Pause, Trash2, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { DocumentItem } from '../types';

interface QueueManagerProps {
  documents: DocumentItem[];
  activeDocId: string | null;
  isProcessing: boolean;
  onSelectDoc: (id: string) => void;
  onRemoveDoc: (id: string) => void;
  onStartTranslation: () => void;
  onPauseTranslation: () => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  documents,
  activeDocId,
  isProcessing,
  onSelectDoc,
  onRemoveDoc,
  onStartTranslation,
  onPauseTranslation
}) => {
  if (documents.length === 0) return null;

  return (
    <section
      id="queue-section"
      className="bg-[#0a1120] border border-[#1e3152] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3.5"
    >
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e3152] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#16243f] border border-[#1e3152] flex items-center justify-center text-[#38bdf8]">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8] font-en">
                Queue Manager
              </span>
              <span className="font-en text-[11px] px-2 py-0.2 rounded bg-[#16243f] border border-[#1e3152] text-[#94a9c9] font-bold">
                {documents.length} File{documents.length > 1 ? 's' : ''}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#f1f5f9]">
              اسناد آماده پردازش و تقطیع
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isProcessing ? (
            <button
              id="start-batch-btn"
              onClick={onStartTranslation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#059669] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#10b981]/25 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>شروع ترجمه هوشمند (Ctrl+Enter)</span>
            </button>
          ) : (
            <button
              id="pause-batch-btn"
              onClick={onPauseTranslation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/40 hover:bg-[#f59e0b]/25 text-[#f59e0b] font-bold text-xs sm:text-sm transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>توقف موقت ترجمه</span>
            </button>
          )}
        </div>
      </div>

      {/* Document cards list */}
      <div className="grid gap-2.5 max-h-60 overflow-y-auto pr-1">
        {documents.map((doc) => {
          const isActive = doc.id === activeDocId;
          const completedChunks = doc.chunks.filter((c) => c.status === 'done').length;

          return (
            <div
              key={doc.id}
              id={`doc-card-${doc.id}`}
              onClick={() => onSelectDoc(doc.id)}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#16243f] border-[#38bdf8]/50 shadow-[0_4px_16px_rgba(0,0,0,0.3)] ring-1 ring-[#38bdf8]/30'
                  : 'bg-[#0a1120] hover:bg-[#16243f]/60 border-[#1e3152]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30' : 'bg-[#16243f] text-[#94a9c9]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-[#f1f5f9] truncate block">
                    {doc.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#94a9c9] mt-0.5">
                    <span className="font-en font-bold uppercase text-[#38bdf8]">{doc.type}</span>
                    <span>•</span>
                    <span className="font-en">{doc.size}</span>
                    <span>•</span>
                    <span>{doc.chunks.length} بند تقطیع شده</span>
                  </div>
                </div>
              </div>

              {/* Progress & remove button */}
              <div className="flex items-center gap-3.5 shrink-0">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-en font-bold text-[#f1f5f9]">
                    <span>{doc.progress}%</span>
                    <span className="text-[11px] font-normal text-[#94a9c9]">
                      ({completedChunks}/{doc.chunks.length})
                    </span>
                  </div>
                  <div className="w-24 sm:w-32 h-2 bg-[#070d18] rounded-full overflow-hidden border border-[#1e3152]">
                    <div
                      className="h-full bg-gradient-to-r from-[#38bdf8] to-[#2563eb] transition-all duration-300 rounded-full"
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDoc(doc.id);
                  }}
                  title="حذف سند از صف"
                  className="p-2 rounded-lg text-[#94a9c9] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
