import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  isFilled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  label,
  helperText,
  error,
  isSuccess,
  isFilled,
  leftIcon,
  rightIcon,
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-kth-slate-800">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-kth-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full font-sans text-sm px-3.5 py-2.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150",
            "focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20",
            isFilled && "bg-kth-slate-50 border-kth-slate-300",
            error && "border-kth-semantic-error focus:border-kth-semantic-error focus:ring-kth-semantic-error/20",
            isSuccess && "border-kth-semantic-success focus:border-kth-semantic-success focus:ring-kth-semantic-success/20",
            disabled && "bg-kth-slate-100 cursor-not-allowed opacity-70",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-kth-slate-400 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-kth-semantic-error font-medium">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-kth-slate-500">{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
