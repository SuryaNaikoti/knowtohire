import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'underline' | 'discovery';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'segmented',
  className,
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn("flex border-b border-kth-slate-200 gap-6", className)}>
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-150 select-none",
                isActive
                  ? "border-kth-primary-600 text-kth-primary-600"
                  : "border-transparent text-kth-slate-500 hover:text-kth-slate-900 hover:border-kth-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full font-mono",
                  isActive ? "bg-kth-primary-50 text-kth-primary-700" : "bg-kth-slate-100 text-kth-slate-600"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'discovery') {
    return (
      <div className={cn("inline-flex bg-white/10 p-1.5 rounded-full border border-white/20 backdrop-blur-md", className)}>
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-200 select-none",
                isActive
                  ? "bg-white text-kth-slate-900 shadow-md scale-[1.02]"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Segmented (Default)
  return (
    <div className={cn("inline-flex bg-kth-slate-100 p-1 rounded-lg border border-kth-slate-200 gap-1", className)}>
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all duration-150 select-none",
              isActive
                ? "bg-white text-kth-slate-900 shadow-xs"
                : "text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-200/60"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-kth-slate-200 text-kth-slate-700 font-mono">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
