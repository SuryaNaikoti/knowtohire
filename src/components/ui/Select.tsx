import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options = [],
      children,
      className = '',
      id,
      wrapperClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`flex flex-col space-y-1.5 w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`text-xs font-semibold text-gray-700 tracking-wide ${
              disabled ? 'opacity-50' : ''
            }`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium text-slate-800 bg-white placeholder-slate-400 shadow-sm transition-all duration-150 border-solid appearance-none pr-10
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-250 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }
              ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'hover:border-slate-350'}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {children ? (
              children
            ) : (
              <>
                <option value="" disabled>
                  Select an option...
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Custom Chevron Arrow */}
          <div className="absolute right-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-600 font-semibold flex items-center" role="alert">
            <span className="mr-1">⚠️</span> {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-gray-500 font-normal">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
