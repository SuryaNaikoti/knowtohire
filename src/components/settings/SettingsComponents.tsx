import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

// 1. SETTINGS SECTION WRAPPER
export interface SettingsSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  id,
  title,
  subtitle,
  icon,
  children,
  className = '',
}) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className={`space-y-6 ${className}`}
    >
      <div className="flex items-start justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-black font-heading text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.section>
  );
};

// 2. SETTINGS CARD
export interface SettingsCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className = '',
  badge,
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all space-y-4 ${className}`}>
      {(title || description) && (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            {title && <h3 className="text-sm font-black font-heading text-slate-900 leading-tight">{title}</h3>}
            {description && <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{description}</p>}
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// 3. SETTINGS TOGGLE CONTROL
export interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badgeText?: string;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  badgeText,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="space-y-0.5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">{label}</span>
          {badgeText && (
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
              {badgeText}
            </span>
          )}
        </div>
        {description && <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-lg">{description}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
          checked ? 'bg-emerald-600' : 'bg-slate-200'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

// 4. FLOATING STICKY UNSAVED CHANGES BAR
export interface UnsavedChangesBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  saving?: boolean;
}

export const UnsavedChangesBar: React.FC<UnsavedChangesBarProps> = ({
  hasChanges,
  onSave,
  onReset,
  saving = false,
}) => {
  return (
    <AnimatePresence>
      {hasChanges && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 z-40 max-w-xl mx-auto sm:mx-0 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Unsaved Settings Changes</p>
              <p className="text-[11px] text-slate-300 font-medium">You have modified parameters in this session.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
