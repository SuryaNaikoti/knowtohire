import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const Select: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  className = '',
  disabled = false,
  required = false,
  error,
  helperText
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 tracking-wide">
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold text-slate-800 bg-slate-50/90 hover:bg-white hover:border-emerald-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all flex items-center justify-between shadow-2xs cursor-pointer ${
          isOpen ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/15' : 'border-slate-200/90'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <span className={selectedOption ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1.5 text-xs font-semibold animate-fade-in-up">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-semibold flex items-center mt-1">
          <span className="mr-1">⚠️</span> {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
