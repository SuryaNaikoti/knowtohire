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
        className,
        onClick && "cursor-pointer hover:border-kth-primary-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="text-kth-slate-400">{icon}</div>}
      </div>

      <div className={cn(
        "font-display text-2xl font-extrabold text-kth-slate-900 leading-tight",
        isINR && "font-mono text-kth-primary-600"
      )}>
        {value}
      </div>

      {trendText && (
        <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
          {isTrendPositive ? (
            <span className="flex items-center gap-1 text-kth-accent-emerald">
              <TrendingUp className="w-3.5 h-3.5" />
              {trendText}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-kth-semantic-error">
              <TrendingDown className="w-3.5 h-3.5" />
              {trendText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
