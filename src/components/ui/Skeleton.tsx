import React from 'react';
import { cn } from '@/lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("rounded-md skeleton-shimmer border border-kth-slate-200/50", className)}
    {...props}
  />
);
