import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 
    | 'indigo'   // Primary tag
    | 'emerald'  // Growth & Verified
    | 'cyan'     // Intelligence & AI
    | 'amber'    // Under Review & Warning
    | 'rose'     // Closed & Error
    | 'slate'    // Neutral Remote/Type
    | 'mono';    // INR Currency / Code tag
  hasPulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'indigo',
  hasPulse = false,
  children,
  ...props
}) => {
  const variants = {
    indigo: "bg-kth-primary-50/80 text-kth-primary-700 border-kth-primary-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    cyan: "bg-cyan-50 text-cyan-800 border-cyan-200/90",
    amber: "bg-amber-50 text-amber-800 border-amber-200/90",
    rose: "bg-red-50 text-red-700 border-red-200/90",
    slate: "bg-kth-slate-100 text-kth-slate-700 border-kth-slate-200",
    mono: "font-mono text-[11px] font-semibold bg-kth-slate-100 text-kth-slate-800 border-kth-slate-200 normal-case",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold tracking-normal px-2.5 py-0.5 rounded-full border whitespace-nowrap leading-snug select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {hasPulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot-ring shrink-0" />
      )}
      {children}
    </span>
  );
};

