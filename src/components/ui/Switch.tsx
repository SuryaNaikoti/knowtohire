import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kth-primary-600 focus:ring-offset-2",
          checked ? "bg-kth-primary-600" : "bg-kth-slate-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-kth-slate-800">{label}</span>}
    </label>
  );
};
