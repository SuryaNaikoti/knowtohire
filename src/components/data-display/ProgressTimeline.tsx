import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface TimelineStep {
  id?: string;
  label?: string;
  title?: string;
  sublabel?: string;
  date?: string;
  status: 'completed' | 'active' | 'pending' | 'current' | 'upcoming';
}

export interface ProgressTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ steps, className }) => {
  return (
    <div className={cn("w-full flex items-center justify-between bg-kth-slate-50 p-3 sm:p-5 rounded-lg border border-kth-slate-200 overflow-x-auto scrollbar-none touch-scroll", className)}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isActive = step.status === 'active' || step.status === 'current';
        const isLast = idx === steps.length - 1;
        const stepLabel = step.label || step.title || '';
        const stepSublabel = step.sublabel || step.date;

        return (
          <React.Fragment key={step.id || `${stepLabel}-${idx}`}>
            <div className="flex flex-col items-center text-center shrink-0 min-w-[65px] sm:min-w-[85px]">
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 mb-1 sm:mb-1.5",
                  isCompleted && "bg-kth-accent-emerald text-white shadow-xs",
                  isActive && "bg-kth-primary-600 text-white ring-4 ring-kth-primary-100 shadow-xs",
                  !isCompleted && !isActive && "bg-kth-slate-200 text-kth-slate-500"
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-bold leading-snug truncate max-w-[80px] sm:max-w-none",
                isActive ? "text-kth-primary-700" : isCompleted ? "text-kth-slate-900" : "text-kth-slate-400"
              )}>
                {stepLabel}
              </span>
              {stepSublabel && (
                <span className={cn(
                  "text-[9px] sm:text-[10px] mt-0.5 font-medium truncate max-w-[80px] sm:max-w-none",
                  isActive ? "text-kth-primary-600 font-semibold" : "text-kth-slate-400"
                )}>
                  {stepSublabel}
                </span>
              )}
            </div>

            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-1 sm:mx-2 min-w-[12px] sm:min-w-[24px]",
                  isCompleted ? "bg-kth-accent-emerald" : "bg-kth-slate-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const ApplicationTracker = ProgressTimeline;

