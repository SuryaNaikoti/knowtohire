import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  trendText?: string;
  isTrendPositive?: boolean;
  isINR?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  trendText,
  isTrendPositive = true,
  isINR = false,
  icon,
  className,
  onClick,
}) => {
  return (
    <Card
      variant="metric"
      className={cn(
        "p-3.5 sm:p-5",
        className,
        onClick && "cursor-pointer hover:border-kth-primary-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] sm:text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
        {icon && <div className="text-kth-slate-400 shrink-0">{icon}</div>}
      </div>

      <div className={cn(
        "font-display text-xl sm:text-2xl font-extrabold text-kth-slate-900 leading-tight my-0.5",
        isINR && "font-mono text-kth-primary-600"
      )}>
        {value}
      </div>

      {trendText && (
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold mt-0.5 truncate">
          {isTrendPositive ? (
            <span className="flex items-center gap-1 text-kth-accent-emerald truncate">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span className="truncate">{trendText}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-500 truncate">
              <TrendingDown className="w-3 h-3 shrink-0" />
              <span className="truncate">{trendText}</span>
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
