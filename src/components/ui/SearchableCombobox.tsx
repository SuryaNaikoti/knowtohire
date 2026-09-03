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
  allowCustom?: boolean;
  customPlaceholder?: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  className?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  label,
  options = [],
  value = '',
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to filter or enter custom...',
  helperText,
  error,
  disabled = false,
  allowClear = true,
  allowCustom = true,
  customPlaceholder = 'Enter custom value...',
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnteringCustom, setIsEnteringCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    if (!value || !value.trim()) return undefined;
    const vTrim = value.trim();
    const vLower = vTrim.toLowerCase();
    const vClean = vLower.replace(/[^a-z0-9]+/g, ' ').trim();
    const vCompact = vLower.replace(/[^a-z0-9]/g, '');

    // 1. Direct exact match on value or label
    const exact = options.find((opt) => opt.value === vTrim || opt.label === vTrim || opt.value.toLowerCase() === vLower || opt.label.toLowerCase() === vLower);
    if (exact) return exact;

    // 2. Normalized token / alphanumeric match
    const normalized = options.find((opt) => {
      const optValNorm = opt.value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const optValCompact = opt.value.toLowerCase().replace(/[^a-z0-9]/g, '');
      const optLblNorm = opt.label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const optLblCompact = opt.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        optValNorm === vClean ||
        optValCompact === vCompact ||
        optLblNorm === vClean ||
        optLblCompact === vCompact
      );
    });
    if (normalized) return normalized;

    // 3. Location / city prefix or substring token match (e.g. "Bengaluru, Karnataka, India" vs "Bengaluru, India" or "Bengaluru")
    const vFirstToken = vTrim.split(',')[0].trim().toLowerCase();
    const cityOrPrefixMatch = options.find((opt) => {
      const optLbl = opt.label.toLowerCase();
      const optVal = opt.value.toLowerCase();
      const optFirstToken = opt.label.split(',')[0].trim().toLowerCase();
      return (
        optLbl.startsWith(vLower) ||
        vLower.startsWith(optLbl) ||
        optVal.startsWith(vLower) ||
        vLower.startsWith(optVal) ||
        (vFirstToken && (optFirstToken === vFirstToken || optLbl.includes(vFirstToken) || vLower.includes(optFirstToken)))
      );
    });
    if (cityOrPrefixMatch) return cityOrPrefixMatch;

    return undefined;
  }, [options, value]);

  // Display text: resolved option label, or persisted non-empty value, or placeholder
  const displayText = useMemo(() => {
    if (selectedOption) return selectedOption.label;
    if (value && value.trim()) return value.trim();
    return placeholder;
  }, [selectedOption, value, placeholder]);

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
        <span className={cn('truncate font-medium', (selectedOption || (value && value.trim())) ? 'text-kth-slate-900' : 'text-kth-slate-400')}>
          {displayText}
        </span>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {allowClear && (selectedOption || (value && value.trim())) && !disabled && (
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
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-72 overflow-hidden bg-white rounded-xl border border-kth-slate-200 shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {isEnteringCustom ? (
            <div className="p-2 space-y-2">
              <div className="text-[11px] font-semibold text-kth-slate-600">Enter custom value:</div>
              <input
                ref={customInputRef}
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={customPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customValue.trim()) {
                    e.preventDefault();
                    onChange(customValue.trim(), { value: customValue.trim(), label: customValue.trim() });
                    setIsEnteringCustom(false);
                    setIsOpen(false);
                    setCustomValue('');
                  }
                }}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-kth-primary-500 rounded-md outline-none focus:ring-2 focus:ring-kth-primary-500/20"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEnteringCustom(false)}
                  className="px-2 py-1 text-xs text-kth-slate-500 hover:text-kth-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customValue.trim()}
                  onClick={() => {
                    onChange(customValue.trim(), { value: customValue.trim(), label: customValue.trim() });
                    setIsEnteringCustom(false);
                    setIsOpen(false);
                    setCustomValue('');
                  }}
                  className="px-2.5 py-1 bg-kth-primary-600 text-white rounded text-xs font-semibold disabled:opacity-50"
                >
                  Apply Custom
                </button>
              </div>
            </div>
          ) : (
            <>
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

              <div className="overflow-y-auto max-h-48 scrollbar-thin space-y-0.5">
                {/* If user typed a search query that has no exact match and allowCustom is true, show quick add option at top */}
                {allowCustom && searchQuery.trim() && !options.some((o) => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(searchQuery.trim(), { value: searchQuery.trim(), label: searchQuery.trim() });
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-kth-primary-50 text-kth-primary-700 hover:bg-kth-primary-100 font-semibold transition-colors text-left"
                  >
                    <span>Use custom: &quot;{searchQuery.trim()}&quot;</span>
                  </button>
                )}

                {filteredOptions.length === 0 && !searchQuery.trim() ? (
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

                {/* Others Option */}
                {allowCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEnteringCustom(true);
                      setTimeout(() => customInputRef.current?.focus(), 50);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-kth-slate-600 hover:bg-kth-slate-100 border-t border-kth-slate-100 font-semibold transition-colors text-left mt-1"
                  >
                    <span>✨ Other (Type custom value)...</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {error && <span className="text-xs text-kth-semantic-error font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-kth-slate-500">{helperText}</span>}
    </div>
  );
};
