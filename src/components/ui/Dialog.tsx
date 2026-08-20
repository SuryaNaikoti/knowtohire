import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-kth-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full bg-white border border-kth-slate-200 rounded-xl shadow-lg overflow-hidden z-10 animate-in zoom-in-95 duration-200",
          maxWidths[maxWidth]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-kth-slate-200">
            <div>
              {title && <h3 className="font-display text-lg font-bold text-kth-slate-900">{title}</h3>}
              {description && <p className="text-xs text-kth-slate-500 mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-kth-slate-400 hover:text-kth-slate-800 hover:bg-kth-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
