import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      type = 'text',
      className = '',
      id,
      wrapperClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`flex flex-col space-y-1.5 w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`text-xs font-semibold text-gray-700 tracking-wide ${
              disabled ? 'opacity-50' : ''
            }`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            type={type}
            id={inputId}
            disabled={disabled}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium text-slate-800 bg-white placeholder-slate-400 shadow-sm transition-all duration-150 border-solid
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-250 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }
              ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'hover:border-slate-350'}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-semibold flex items-center" role="alert">
            <span className="mr-1">⚠️</span> {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500 font-normal">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
