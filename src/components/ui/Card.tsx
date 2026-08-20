import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'interactive' | 'featured' | 'metric';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'standard',
  children,
  ...props
}, ref) => {
  const variants = {
    standard: "bg-white border border-kth-slate-200/90 rounded-xl shadow-xs p-5 md:p-6 transition-all duration-200",
    interactive: "bg-white border border-kth-slate-200/90 rounded-xl shadow-xs p-5 md:p-6 transition-all duration-200 hover:border-kth-primary-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
    featured: "bg-gradient-to-br from-kth-slate-900 via-kth-slate-900 to-kth-primary-950 border border-kth-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 text-white",
    metric: "bg-white border border-kth-slate-200/90 rounded-xl p-5 flex flex-col gap-2 shadow-xs transition-all duration-200 hover:border-kth-slate-300",
  };

  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex items-center justify-between mb-3.5", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("font-display text-base sm:text-lg font-bold text-kth-slate-900 tracking-tight leading-snug", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-xs text-kth-slate-500 font-normal mt-0.5 leading-relaxed", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("text-sm text-kth-slate-700", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex items-center justify-between mt-4 pt-3.5 border-t border-kth-slate-100/80", className)} {...props} />
);

