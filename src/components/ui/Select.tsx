import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  label,
  options = [],
  helperText,
  error,
  id,
  name,
  value: controlledValue,
  defaultValue,
  placeholder = "Select an option...",
  disabled = false,
  onChange,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue !== undefined ? controlledValue : defaultValue || (options[0]?.value || '')
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeSelectRef = useRef<HTMLSelectElement | null>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = options.find((opt) => opt.value === currentValue) || options[0];
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectOption = (optValue: string) => {
    if (disabled) return;
    setInternalValue(optValue);
    setIsOpen(false);

    if (onChange) {
      onChange({
        target: {
          value: optValue,
          name: name,
        },
      });
    }

    if (nativeSelectRef.current) {
      nativeSelectRef.current.value = optValue;
      const event = new Event('change', { bubbles: true });
      nativeSelectRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-kth-slate-800 select-none">
          {label}
        </label>
      )}

      {/* Hidden Native Select for standard form & ref support */}
      <select
        id={selectId}
        name={name}
        ref={(el) => {
          nativeSelectRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        value={currentValue}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          if (onChange) onChange(e as any);
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom Modern Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center justify-between font-sans text-xs sm:text-sm px-3.5 py-2.5 rounded-lg bg-white border border-kth-slate-200/90 text-kth-slate-900 outline-none transition-all duration-150 cursor-pointer shadow-xs select-none",
          "hover:border-kth-primary-300 hover:bg-kth-slate-50/50",
          "focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20",
          isOpen && "border-kth-primary-600 ring-2 ring-kth-primary-600/20 bg-white",
          error && "border-kth-semantic-error focus:border-kth-semantic-error focus:ring-kth-semantic-error/20",
          disabled && "bg-kth-slate-100 cursor-not-allowed opacity-60 hover:border-kth-slate-200",
          className
        )}
      >
        <span className="flex items-center gap-2 truncate font-medium">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? "text-kth-slate-900" : "text-kth-slate-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-kth-slate-400 shrink-0 transition-transform duration-200 ease-out ml-2",
            isOpen && "transform rotate-180 text-kth-primary-600"
          )}
        />
      </button>

      {/* Modern Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto bg-white rounded-xl border border-kth-slate-200 shadow-lg p-1.5 animate-scale-in focus:outline-none scrollbar-thin"
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-md transition-colors text-left font-medium select-none group",
                  isSelected
                    ? "bg-kth-primary-50 text-kth-primary-700 font-bold"
                    : "text-kth-slate-700 hover:bg-kth-slate-50 hover:text-kth-slate-900"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span>{opt.label}</span>
                </span>

                {isSelected && (
                  <Check className="w-4 h-4 text-kth-primary-600 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <span className="text-xs text-kth-semantic-error font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-kth-slate-500">{helperText}</span>}
    </div>
  );
});

Select.displayName = 'Select';
