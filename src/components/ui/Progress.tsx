import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'emerald' | 'cyan';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  showValue = false,
  color = 'emerald',
  className,
}) => {
  const colors = {
    primary: 'bg-kth-primary-600',
    emerald: 'bg-kth-accent-emerald',
    cyan: 'bg-kth-accent-cyan',
  };

  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-semibold text-kth-slate-700">
          <span>{label}</span>
          {showValue && <span className="font-mono text-kth-slate-900">{clamped}%</span>}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-kth-slate-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
