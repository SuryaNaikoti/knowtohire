import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'primary'      // SaaS Indigo #4F46E5
    | 'secondary'    // Slate White border
    | 'emerald'      // Growth Emerald #10B981
    | 'outline'      // Indigo outline
    | 'ghost'        // Transparent Slate hover
    | 'destructive'  // Red warning
    | 'success'      // Emerald tint
    | 'icon';        // Square icon wrapper
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-semibold transition-all duration-150 ease-out select-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-kth-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-kth-primary-600 hover:bg-kth-primary-700 text-white border border-kth-primary-700/40 shadow-xs hover:shadow-sm",
    secondary: "bg-white text-kth-slate-800 border border-kth-slate-200/90 hover:bg-kth-slate-50 hover:text-kth-slate-900 hover:border-kth-slate-300 shadow-xs",
    emerald: "bg-kth-accent-emerald hover:bg-emerald-600 text-white border border-emerald-700/30 shadow-xs hover:shadow-sm",
    outline: "bg-transparent text-kth-primary-600 border border-kth-primary-600/80 hover:bg-kth-primary-50/70 hover:border-kth-primary-600",
    ghost: "bg-transparent text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900",
    destructive: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    icon: "p-0 rounded-md bg-white border border-kth-slate-200 text-kth-slate-700 hover:bg-kth-slate-50 flex items-center justify-center shadow-xs",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5 h-8",
    md: "px-4 py-2 text-xs sm:text-sm rounded-md gap-2 h-9",
    lg: "px-5 py-2.5 text-sm sm:text-base rounded-lg gap-2.5 h-11",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        variant === 'icon' ? iconSizes[size] : sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 transition-transform">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0 transition-transform">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

