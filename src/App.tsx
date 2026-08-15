import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppSettings,
  DocumentItem,
  OllamaModel,
  ToastMessage,
  TonePreset,
  TranslationChunk
} from './types';
import { DocumentParsers } from './utils/documentParsers';
import { ChunkEngine } from './utils/chunking';
import { TranslationEngines } from './utils/translationEngines';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { QueueManager } from './components/QueueManager';
import { SplitPaneWorkspace } from './components/SplitPaneWorkspace';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ExportModal } from './components/ExportModal';
import { ToastContainer } from './components/ToastContainer';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  engine: 'ollama',
  ollamaHost: 'http://127.0.0.1:11434',
  ollamaModel: '',
  ollamaTemp: 0.35,
  googleApiKey: '',
  chunkSize: 180,
  concurrency: 2,
  autoHalfSpace: true,
  tone: 'fluent',
  systemPrompt:
    'شما یک مترجم فوق‌العاده حرفه‌ای، شیوا و دقیق به زبان فارسی هستید. مفاهیم و اصطلاحات تخصصی را با ساختار گرامری استاندارد فارسی و استفاده از نیم‌فاصله‌های صحیح ترجمه کن و از اضافه کردن هرگونه توضیح اضافی یا پیشوند خودداری نما.',
  syncScroll: true
};

const SAMPLE_TEXT = `# Artificial Intelligence and Modern Neural Architecture

Artificial Intelligence has transformed the landscape of computational science. Through deep learning neural networks, models can now process complex semantic representations, understand natural human language nuance, and synthesize multifaceted technical documents in real-time.

Local Large Language Models, executed via specialized runtime runtimes such as Ollama, empower individuals to translate confidential research papers with complete privacy. By processing document vectors directly inside the browser memory sandbox, no proprietary data is ever leaked to untrusted remote endpoints.

Furthermore, client-side document processing architectures leverage WebAssembly and modern JavaScript APIs to parse PDF documents, Word files, and digital e-books without any backend computational overhead.`;

export function App() {
  // App Settings with LocalStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('smart_translate_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // State
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_translate_docs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeDocId, setActiveDocId] = useState<string | null>(() => {
    return documents.length > 0 ? documents[0].id : null;
  });

  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected' | 'probing'>('probing');
  const [isProbing, setIsProbing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_translate_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Sync docs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_translate_docs', JSON.stringify(documents));
    } catch {}
  }, [documents]);

  // Toast helper
  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, title }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  // Probe Ollama
  const probeOllamaServer = useCallback(
    async (hostToProbe: string) => {
      setIsProbing(true);
      setOllamaStatus('probing');

      const result = await TranslationEngines.probeOllama(hostToProbe);
      setIsProbing(false);

      if (result.connectedHost && result.models.length > 0) {
        setOllamaStatus('connected');
        setOllamaModels(result.models);
        setSettings((prev) => ({
          ...prev,
          ollamaHost: result.connectedHost!,
          ollamaModel: prev.ollamaModel && result.models.some((m) => m.name === prev.ollamaModel)
            ? prev.ollamaModel
            : result.models[0].name
        }));
        showToast(
          `ارتباط با Ollama برقرار شد (${result.models.length} مدل شناسایی گردید)`,
          'success'
        );
      } else {
        setOllamaStatus('disconnected');
        setOllamaModels([]);
        if (settings.engine === 'ollama') {
          showToast(
            'سرویس محلی Ollama شناسایی نشد. بررسی کنید Ollama در حال اجرا و OLLAMA_ORIGINS فعال باشد.',
            'warning',
            'عدم اتصال به Ollama'
          );
        }
      }
    },
    [settings.engine, showToast]
  );

  // Initial Probe on Mount
  useEffect(() => {
    probeOllamaServer(settings.ollamaHost);
  }, []);

  // Update Settings Partial
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Handle uploaded files
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    showToast(`درحال خواندن و تقطیع ${fileArray.length} فایل...`, 'info');

    const newDocs: DocumentItem[] = [];

    for (const file of fileArray) {
      try {
        const text = await DocumentParsers.parse(file);
        const chunks = ChunkEngine.split(text, settings.chunkSize);
        const docItem: DocumentItem = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'TXT',
          rawText: text,
          chunks,
          progress: 0,
          status: 'pending'
        };
        newDocs.push(docItem);
      } catch (err: any) {
        showToast(`خطا در خواندن فایل ${file.name}: ${err.message}`, 'error');
      }
    }

    if (newDocs.length > 0) {
      setDocuments((prev) => [...prev, ...newDocs]);
      setActiveDocId(newDocs[0].id);
      showToast(`${newDocs.length} سند با موفقیت به صف افزوده شد`, 'success');
    }
  };

  // Load sample text
  const handleLoadSample = () => {
    const chunks = ChunkEngine.split(SAMPLE_TEXT, settings.chunkSize);
    const sampleDoc: DocumentItem = {
      id: 'sample-' + Date.now(),
      name: 'Sample_AI_Architecture.md',
      size: '1.4 KB',
      type: 'MD',
      rawText: SAMPLE_TEXT,
      chunks,
      progress: 0,
      status: 'pending'
    };
    setDocuments((prev) => [sampleDoc, ...prev]);
    setActiveDocId(sampleDoc.id);
    showToast('متن نمونه با موفقیت در فضای کاری بارگذاری گردید', 'success');
  };

  // Clear cache and reset
  const handleClearCache = () => {
    if (isProcessing) {
      abortControllerRef.current?.abort();
      setIsProcessing(false);
    }
    setDocuments([]);
    setActiveDocId(null);
    try {
      localStorage.removeItem('smart_translate_docs');
    } catch {}
    showToast('صف اسناد و داده‌های کش با موفقیت پاکسازی شدند', 'info');
  };

  // Update target chunk manually
  const handleUpdateChunkTarget = (docId: string, chunkId: number, newTarget: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const updatedChunks = doc.chunks.map((c) =>
          c.id === chunkId ? { ...c, target: newTarget, status: 'done' as const } : c
        );
        const doneCount = updatedChunks.filter((c) => c.status === 'done').length;
        const progress = Math.round((doneCount / (updatedChunks.length || 1)) * 100);
        return { ...doc, chunks: updatedChunks, progress };
      })
    );
  };

  // Retry a single chunk that failed
  const handleRetryChunk = async (docId: string, chunkId: number) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    const chunk = doc.chunks.find((c) => c.id === chunkId);
    if (!chunk) return;

    // Mark as translating
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const updated = d.chunks.map((c) =>
          c.id === chunkId ? { ...c, status: 'translating' as const } : c
        );
        return { ...d, chunks: updated };
      })
    );

    try {
      const translated = await TranslationEngines.translate(chunk.source, settings);
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id !== docId) return d;
          const updated = d.chunks.map((c) =>
            c.id === chunkId ? { ...c, target: translated, status: 'done' as const } : c
          );
          const doneCount = updated.filter((c) => c.status === 'done').length;
          const progress = Math.round((doneCount / (updated.length || 1)) * 100);
          return { ...d, chunks: updated, progress };
        })
      );
      showToast(`قطعه #${chunkId} با موفقیت ترجمه شد`, 'success');
    } catch (err: any) {
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id !== docId) return d;
          const updated = d.chunks.map((c) =>
            c.id === chunkId ? { ...c, status: 'error' as const, errorMsg: err.message } : c
          );
          return { ...d, chunks: updated };
        })
      );
      showToast(`خطا در ترجمه مجدد قطعه #${chunkId}: ${err.message}`, 'error');
    }
  };

  // Start Batch Translation
  const handleStartTranslation = async () => {
    if (documents.length === 0) {
      showToast('هیچ سندی در صف برای ترجمه وجود ندارد', 'warning');
      return;
    }

    if (settings.engine === 'ollama' && (!settings.ollamaModel || ollamaStatus === 'disconnected')) {
      showToast('مدل Ollama در دسترس نیست. تنظیمات را بررسی کنید.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    showToast('فرایند ترجمه هوشمند آغاز گردید...', 'info');

    try {
      for (const doc of documents) {
        if (signal.aborted) break;

        const pendingChunks = doc.chunks.filter((c) => c.status !== 'done');
        if (pendingChunks.length === 0) continue;

        // Process chunks in batches according to concurrency
        const batchSize = Math.max(1, settings.concurrency);
        for (let i = 0; i < pendingChunks.length; i += batchSize) {
          if (signal.aborted) break;

          const currentBatch = pendingChunks.slice(i, i + batchSize);

          // Mark as translating
          setDocuments((prev) =>
            prev.map((d) => {
              if (d.id !== doc.id) return d;
              const updated = d.chunks.map((c) =>
                currentBatch.some((b) => b.id === c.id) ? { ...c, status: 'translating' as const } : c
              );
              return { ...d, chunks: updated };
            })
          );

          // Execute batch translations concurrently
          await Promise.all(
            currentBatch.map(async (chunk) => {
              try {
                const translated = await TranslationEngines.translate(
                  chunk.source,
                  settings,
                  signal
                );

                setDocuments((prev) =>
                  prev.map((d) => {
                    if (d.id !== doc.id) return d;
                    const updated = d.chunks.map((c) =>
                      c.id === chunk.id
                        ? { ...c, target: translated, status: 'done' as const }
                        : c
                    );
                    const doneCount = updated.filter((c) => c.status === 'done').length;
                    const progress = Math.round((doneCount / (updated.length || 1)) * 100);
                    return { ...d, chunks: updated, progress };
                  })
                );
              } catch (err: any) {
                if (signal.aborted) return;
                setDocuments((prev) =>
                  prev.map((d) => {
                    if (d.id !== doc.id) return d;
                    const updated = d.chunks.map((c) =>
                      c.id === chunk.id
                        ? { ...c, status: 'error' as const, errorMsg: err.message }
                        : c
                    );
                    return { ...d, chunks: updated };
                  })
                );
              }
            })
          );
        }
      }

      showToast('عملیات ترجمه اسناد با موفقیت پایان یافت!', 'success');
    } catch (err: any) {
      if (!signal.aborted) {
        showToast(`خطا در فرایند ترجمه: ${err.message}`, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Pause batch
  const handlePauseTranslation = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    showToast('ترجمه موقتا متوقف شد', 'info');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isProcessing) handleStartTranslation();
        else handlePauseTranslation();
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsExportOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, documents, settings, ollamaStatus]);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0] || null;

  return (
    <div className="min-h-screen bg-[#070d18] text-[#f1f5f9] flex flex-col font-fa selection:bg-[#38bdf8]/30 selection:text-white">
      {/* Header */}
      <Header
        settings={settings}
        isProbing={isProbing}
        ollamaStatus={ollamaStatus}
        onQuickSync={() => probeOllamaServer(settings.ollamaHost)}
        onClearCache={handleClearCache}
        onToggleTheme={() =>
          updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1540px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Dropzone & File Uploader */}
        <Dropzone
          onFilesSelected={handleFilesSelected}
          onLoadSample={handleLoadSample}
        />

        {/* Queue of uploaded documents */}
        <QueueManager
          documents={documents}
          activeDocId={activeDocId}
          isProcessing={isProcessing}
          onSelectDoc={(id) => setActiveDocId(id)}
          onRemoveDoc={(id) => {
            setDocuments((prev) => prev.filter((d) => d.id !== id));
            if (activeDocId === id) {
              const remaining = documents.filter((d) => d.id !== id);
              setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
            }
          }}
          onStartTranslation={handleStartTranslation}
          onPauseTranslation={handlePauseTranslation}
        />

        {/* Split Pane Editor (Source vs Target) */}
        {activeDoc && (
          <SplitPaneWorkspace
            document={activeDoc}
            settings={settings}
            onUpdateChunkTarget={handleUpdateChunkTarget}
            onUpdateTone={(tone: TonePreset) => updateSettings({ tone })}
            onToggleSyncScroll={(enabled: boolean) => updateSettings({ syncScroll: enabled })}
            onOpenExportModal={() => setIsExportOpen(true)}
            onRetryChunk={handleRetryChunk}
          />
        )}
      </main>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        settings={settings}
        ollamaModels={ollamaModels}
        isProbing={isProbing}
        ollamaStatus={ollamaStatus}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
        onProbeOllama={probeOllamaServer}
        onShowToast={showToast}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        document={activeDoc}
        onClose={() => setIsExportOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast Notifications Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}

export default App;
