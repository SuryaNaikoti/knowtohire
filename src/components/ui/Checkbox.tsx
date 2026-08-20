import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-kth-primary-600/20",
          checked
            ? "bg-kth-primary-600 border-kth-primary-600 text-white"
            : "bg-white border-kth-slate-300 text-transparent hover:border-kth-slate-400"
        )}
      >
        <Check className="w-3 h-3 stroke-[3]" />
      </button>
      {label && <span className="text-sm font-medium text-kth-slate-800">{label}</span>}
    </label>
  );
};
