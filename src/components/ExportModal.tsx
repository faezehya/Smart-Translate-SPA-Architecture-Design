import React, { useState } from 'react';
import { X, FileText, Download, Copy, Printer, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { DocumentItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  document,
  onClose,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const combinedTranslatedText = document.chunks
    .map((c) => c.target || c.source)
    .join('\n\n');

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`فایل ${filename} با موفقیت دانلود شد`, 'success');
  };

  const handleExportTxt = () => {
    const filename = `${document.name.replace(/\.[^/.]+$/, '')}_translated.txt`;
    downloadFile(combinedTranslatedText, filename, 'text/plain;charset=utf-8');
  };

  const handleExportMd = () => {
    const filename = `${document.name.replace(/\.[^/.]+$/, '')}_translated.md`;
    downloadFile(combinedTranslatedText, filename, 'text/markdown;charset=utf-8');
  };

  const handleExportDocx = () => {
    const filename = `${document.name.replace(/\.[^/.]+$/, '')}_translated.doc`;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${document.name}</title>
        <style>
          body { font-family: 'Vazirmatn', 'Arial', sans-serif; direction: rtl; text-align: right; line-height: 1.8; font-size: 14pt; }
          p { margin-bottom: 14pt; }
        </style>
      </head>
      <body>
        ${combinedTranslatedText.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
      </body>
      </html>
    `;
    downloadFile(docHtml, filename, 'application/msword;charset=utf-8');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(combinedTranslatedText);
    setCopied(true);
    onShowToast('متن ترجمه شده به حافظه کپی شد', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html lang="fa" dir="rtl">
        <head>
          <title>${document.name} - ترجمه فارسی</title>
          <style>
            body { font-family: 'Vazirmatn', sans-serif; padding: 40px; line-height: 2; font-size: 16px; color: #111; }
            h1 { border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 20px; }
            p { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${document.name}</h1>
          ${combinedTranslatedText.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="export-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div
        id="export-modal-card"
        className="relative z-10 w-full max-w-lg bg-[#0a1120] border border-[#1e3152] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#1e3152] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16243f] border border-[#1e3152] text-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#38bdf8]/10">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8] font-en block">
                Export Manager
              </span>
              <h3 className="font-extrabold text-base text-[#f1f5f9]">
                دریافت خروجی ترجمه سند
              </h3>
              <p className="text-xs text-[#94a9c9] font-en truncate max-w-xs mt-0.5">
                {document.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#94a9c9] hover:text-[#f1f5f9] hover:bg-[#16243f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="export-docx-btn"
            onClick={handleExportDocx}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/50 transition-all text-right group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0a1120] border border-[#1e3152] text-[#38bdf8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#f1f5f9] block">Microsoft Word</span>
              <span className="text-[11px] text-[#94a9c9]">فرمت استاندارد .doc</span>
            </div>
          </button>

          <button
            id="export-md-btn"
            onClick={handleExportMd}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/50 transition-all text-right group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0a1120] border border-[#1e3152] text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#f1f5f9] block">Markdown</span>
              <span className="text-[11px] text-[#94a9c9]">مناسب گیت‌هاب (.md)</span>
            </div>
          </button>

          <button
            id="export-txt-btn"
            onClick={handleExportTxt}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/50 transition-all text-right group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0a1120] border border-[#1e3152] text-[#10b981] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#f1f5f9] block">متن ساده (TXT)</span>
              <span className="text-[11px] text-[#94a9c9]">یونیکد UTF-8 (.txt)</span>
            </div>
          </button>

          <button
            id="export-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/50 transition-all text-right group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0a1120] border border-[#1e3152] text-[#f59e0b] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#f1f5f9] block">چاپ / ذخیره PDF</span>
              <span className="text-[11px] text-[#94a9c9]">از طریق پرینتر مرورگر</span>
            </div>
          </button>
        </div>

        {/* Copy All Button */}
        <div className="pt-2">
          <button
            id="copy-all-translated-btn"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#2563eb] hover:from-[#38bdf8] hover:to-[#1d4ed8] text-white font-bold text-sm shadow-lg shadow-[#38bdf8]/20 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>متن در کلیپ‌بورد کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>کپی کل متن ترجمه در کلیپ‌بورد</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
