import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { COUNTRY_PHONE_CODES, parsePhoneWithCountryCode, formatInternationalPhone } from '@/data/countryCodes';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface PhoneInputProps {
  label?: string;
  value: string; // Full formatted phone string (e.g. "+91 9876543210" or "9876543210")
  onChange: (fullPhoneValue: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '98765 43210',
  helperText,
  error,
  disabled = false,
  required = false,
  id,
}) => {
  const { countryCode: initialCode, nationalNumber: initialNational } = parsePhoneWithCountryCode(value);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCode);
  const [nationalNumber, setNationalNumber] = useState<string>(initialNational);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Sync state if external value changes significantly
  useEffect(() => {
    const parsed = parsePhoneWithCountryCode(value);
    setSelectedCountryCode(parsed.countryCode);
    setNationalNumber(parsed.nationalNumber);
  }, [value]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const activeCountry =
    COUNTRY_PHONE_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_PHONE_CODES[0];

  const filteredCountries = COUNTRY_PHONE_CODES.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.country.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const handleCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    setIsDropdownOpen(false);
    setSearchQuery('');
    const full = formatInternationalPhone(code, nationalNumber);
    onChange(full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s-]/g, '');
    setNationalNumber(raw);
    const full = formatInternationalPhone(selectedCountryCode, raw);
    onChange(full);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left" ref={dropdownRef}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-kth-slate-800">
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {/* Country Code Picker Trigger */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-label="Select Country Code"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 h-[42px] bg-kth-slate-50 hover:bg-kth-slate-100/80 border border-r-0 border-kth-slate-200 rounded-l-md text-xs font-semibold text-kth-slate-800 transition-all select-none focus:outline-none focus:ring-2 focus:ring-kth-primary-600/20 focus:z-10",
              error && "border-kth-semantic-error",
              disabled && "cursor-not-allowed opacity-70 bg-kth-slate-100"
            )}
          >
            <span className="text-base leading-none">{activeCountry.flag}</span>
            <span className="font-mono text-xs text-kth-slate-700">{activeCountry.code}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-kth-slate-400 transition-transform duration-150", isDropdownOpen && "rotate-180 text-kth-primary-600")} />
          </button>

          {/* Country Code Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 z-50 mt-1.5 w-72 max-h-64 bg-white rounded-xl border border-kth-slate-200 shadow-xl p-2 animate-scale-in flex flex-col">
              {/* Search Box */}
              <div className="relative mb-1.5">
                <Search className="w-3.5 h-3.5 text-kth-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-kth-slate-50 border border-kth-slate-200 focus:outline-none focus:border-kth-primary-600 focus:bg-white text-kth-slate-900 placeholder:text-kth-slate-400"
                  autoFocus
                />
              </div>

              {/* Country List */}
              <div className="overflow-y-auto flex-1 space-y-0.5 scrollbar-thin">
                {filteredCountries.length === 0 ? (
                  <div className="py-3 text-center text-xs text-kth-slate-400 font-medium">
                    No country found
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountryCode;
                    return (
                      <button
                        key={`${c.iso}-${c.code}`}
                        type="button"
                        onClick={() => handleCountrySelect(c.code)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left font-medium",
                          isSelected
                            ? "bg-kth-primary-50 text-kth-primary-700 font-bold"
                            : "text-kth-slate-700 hover:bg-kth-slate-50 hover:text-kth-slate-900"
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-sm leading-none">{c.flag}</span>
                          <span className="truncate">{c.country}</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono text-[11px] text-kth-slate-500">{c.code}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-kth-primary-600" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* National Phone Input */}
        <div className="relative flex-1">
          <input
            id={inputId}
            type="tel"
            disabled={disabled}
            required={required}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder}
            autoComplete="tel-national"
            className={cn(
              "w-full font-sans text-sm px-3.5 py-2.5 h-[42px] rounded-r-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150",
              "focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20 focus:z-10",
              error && "border-kth-semantic-error focus:border-kth-semantic-error focus:ring-kth-semantic-error/20",
              disabled && "bg-kth-slate-100 cursor-not-allowed opacity-70"
            )}
          />
        </div>
      </div>

      {error && <span className="text-xs text-kth-semantic-error font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-kth-slate-500">{helperText}</span>}
    </div>
  );
};
