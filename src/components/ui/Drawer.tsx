import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-md',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-kth-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          "relative w-full max-w-full h-full bg-white border-l border-kth-slate-200 shadow-lg flex flex-col z-10 animate-in slide-in-from-right duration-250",
          width
        )}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-kth-slate-200 shrink-0">
          {title ? <h3 className="font-display text-base sm:text-lg font-bold text-kth-slate-900 truncate pr-2">{title}</h3> : <div />}
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-kth-slate-400 hover:text-kth-slate-800 hover:bg-kth-slate-100 transition-colors shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">{children}</div>
      </div>
    </div>
  );
};
