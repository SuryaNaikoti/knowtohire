import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  const styles = {
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    info: {
      container: 'bg-kth-primary-50 border-kth-primary-100 text-kth-primary-900',
      icon: <Info className="w-5 h-5 text-kth-primary-600 shrink-0" />,
    },
  };

  const current = styles[variant];

  return (
    <div className={cn("flex items-start p-4 rounded-lg border gap-3 text-sm font-sans", current.container, className)}>
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && <h4 className="font-bold text-sm mb-1">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};
