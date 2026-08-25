import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
}

export interface SearchableComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  onChange: (value: string, option?: ComboboxOption) => void;
  className?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  label,
  options = [],
  value = '',
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to filter...',
  helperText,
  error,
  disabled = false,
  allowClear = false,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value || opt.label.toLowerCase() === value.toLowerCase());
  }, [options, value]);

  // Filter options with max 50 items rendered to prevent DOM lag
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options.slice(0, 40);
    }
    const q = searchQuery.trim().toLowerCase();
    return options
      .filter((opt) => opt.label.toLowerCase().includes(q) || (opt.category && opt.category.toLowerCase().includes(q)))
      .slice(0, 40);
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value, opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={cn('flex flex-col gap-1.5 w-full relative', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-kth-slate-800 select-none">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-xs sm:text-sm px-3.5 py-2.5 rounded-lg bg-white border border-kth-slate-200/90 text-kth-slate-900 outline-none transition-all duration-150 cursor-pointer shadow-xs select-none text-left',
          'hover:border-kth-primary-300 hover:bg-kth-slate-50/50',
          'focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20',
          isOpen && 'border-kth-primary-600 ring-2 ring-kth-primary-600/20 bg-white',
          error && 'border-kth-semantic-error',
          disabled && 'bg-kth-slate-100 cursor-not-allowed opacity-60'
        )}
      >
        <span className={cn('truncate font-medium', selectedOption ? 'text-kth-slate-900' : 'text-kth-slate-400')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {allowClear && selectedOption && !disabled && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 text-kth-slate-400 hover:text-kth-slate-700 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-kth-slate-400 transition-transform duration-200 ease-out',
              isOpen && 'transform rotate-180 text-kth-primary-600'
            )}
          />
        </div>
      </button>

      {/* Dropdown with Search & Virtualized slice */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-hidden bg-white rounded-xl border border-kth-slate-200 shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          <div className="p-1 border-b border-kth-slate-100 mb-1 relative shrink-0">
            <Search className="w-3.5 h-3.5 text-kth-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs pl-7 pr-2 py-1.5 bg-kth-slate-50 border border-kth-slate-200 rounded-md outline-none focus:border-kth-primary-500 focus:bg-white transition-all"
            />
          </div>

          <div className="overflow-y-auto max-h-48 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-kth-slate-400 font-medium">
                No matching records found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption?.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-md transition-colors text-left font-medium select-none',
                      isSelected
                        ? 'bg-kth-primary-50 text-kth-primary-700 font-bold'
                        : 'text-kth-slate-700 hover:bg-kth-slate-50 hover:text-kth-slate-900'
                    )}
                  >
                    <div className="truncate">
                      <span className="block truncate">{opt.label}</span>
                      {opt.category && (
                        <span className="text-[10px] text-kth-slate-400 block truncate">{opt.category}</span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-kth-primary-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-kth-semantic-error font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-kth-slate-500">{helperText}</span>}
    </div>
  );
};
