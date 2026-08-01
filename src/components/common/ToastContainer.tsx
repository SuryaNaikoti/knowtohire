import React from 'react';
import type { ToastMessage } from '../../lib/services/notifications/adapters/ToastAdapter';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  const bgColors = {
    success: 'bg-emerald-800 text-white border-emerald-700',
    info: 'bg-slate-900 text-white border-slate-800',
    warning: 'bg-amber-700 text-white border-amber-600',
    error: 'bg-rose-800 text-white border-rose-700',
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-lg border text-sm transition-all duration-200 animate-fade-in ${
            bgColors[toast.type] || bgColors.info
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{toast.title}</span>
            <span className="text-xs opacity-90">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-3 text-xs opacity-75 hover:opacity-100 p-1 rounded transition-opacity"
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
