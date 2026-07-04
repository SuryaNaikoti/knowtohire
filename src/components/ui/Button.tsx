import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-98 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

  // Variant styles
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-indigo-500/15 hover:shadow-lg hover:shadow-indigo-500/25',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover shadow-md shadow-teal-500/15 hover:shadow-lg hover:shadow-teal-500/25',
    accent: 'bg-accent text-white hover:bg-accent-hover shadow-md shadow-amber-500/15 hover:shadow-lg hover:shadow-amber-500/25',
    outline: 'border border-slate-250 bg-white text-slate-750 hover:bg-slate-50 hover:text-slate-900 border-solid',
    ghost: 'text-slate-650 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-red-650 text-white hover:bg-red-700 shadow-md shadow-red-500/15 hover:shadow-lg hover:shadow-red-500/25',
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span className="kth-inline-icon">{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
