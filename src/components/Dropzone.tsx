import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Sparkles, Plus } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSample: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, onLoadSample }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <section
      id="dropzone-area"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center ${
        isDragOver
          ? 'border-[#38bdf8] bg-[#38bdf8]/10 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
          : 'border-[#1e3152] bg-[#0a1120] hover:border-[#38bdf8]/50 hover:bg-[#0e172a] shadow-xl'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,.epub,.html,.rtf"
        onChange={handleFileChange}
        className="hidden"
        id="hidden-file-input"
      />

      <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
        <div
          id="dropzone-icon-bubble"
          className="w-16 h-16 rounded-2xl bg-[#16243f] border border-[#1e3152] flex items-center justify-center text-[#38bdf8] mb-4 shadow-lg shadow-[#38bdf8]/10 transition-transform group-hover:scale-105"
        >
          <UploadCloud className="w-8 h-8" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight">
          فایل‌های سند را بکشید و در این بخش رها کنید
        </h2>
        <p className="text-xs sm:text-sm text-[#94a9c9] mb-6 leading-relaxed max-w-md">
          استخراج و ترجمه ۱۰۰٪ درون حافظه مرورگر انجام گرفته و هیچ سندی به سرور خارجی فرستاده نمی‌شود.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#2563eb] hover:from-[#38bdf8] hover:to-[#1d4ed8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#38bdf8]/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            انتخاب فایل از حافظه سیستم
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16243f] hover:bg-[#1e3152] border border-[#1e3152] hover:border-[#38bdf8]/40 text-[#f1f5f9] font-semibold text-xs sm:text-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            بارگذاری سند نمونه هوش مصنوعی
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['PDF (.pdf)', 'Word (.docx)', 'Markdown (.md)', 'EPUB (.epub)', 'Plain Text (.txt)', 'HTML / RTF'].map(
            (format) => (
              <span
                key={format}
                className="font-en text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#16243f] border border-[#1e3152] text-[#94a9c9]"
              >
                {format}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
};
