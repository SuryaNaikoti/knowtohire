import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  label,
  helperText,
  error,
  isSuccess,
  disabled,
  id,
  rows = 4,
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
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full font-sans text-sm px-3.5 py-2.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150 resize-y",
          "focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20",
          error && "border-kth-semantic-error focus:border-kth-semantic-error focus:ring-kth-semantic-error/20",
          isSuccess && "border-kth-semantic-success focus:border-kth-semantic-success focus:ring-kth-semantic-success/20",
          disabled && "bg-kth-slate-100 cursor-not-allowed opacity-70",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-kth-semantic-error font-medium">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-xs text-kth-slate-500">{helperText}</span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
