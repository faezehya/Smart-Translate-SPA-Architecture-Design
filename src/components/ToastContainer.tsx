import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-sky-400 shrink-0" />
          );

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#0a1120] border border-[#1e3152] text-[#f1f5f9] shadow-2xl shadow-black/70 backdrop-blur-md"
          >
            {icon}
            <div className="flex-1 text-xs leading-relaxed">
              {toast.title && <div className="font-bold mb-0.5 text-white">{toast.title}</div>}
              <div className="text-[#94a9c9]">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#94a9c9] hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
