import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  badgeText?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'cyan' | 'amber' | 'slate';
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badgeText,
  badgeVariant = 'indigo',
  title,
  subtitle,
  action,
  align = 'left',
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10",
      align === 'center' && "sm:flex-col sm:items-center text-center",
      className
    )}>
      <div className={align === 'center' ? "max-w-2xl mx-auto" : "max-w-xl"}>
        {badgeText && (
          <Badge variant={badgeVariant} className="mb-2.5">
            {badgeText}
          </Badge>
        )}
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-kth-slate-500 mt-2 leading-relaxed text-pretty font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

