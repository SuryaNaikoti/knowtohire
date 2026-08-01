import React, { useMemo } from 'react';
import { Check, X, KeyRound } from 'lucide-react';

interface Requirement {
  id: string;
  label: string;
  met: boolean;
}

interface PasswordStrengthMeterProps {
  password?: string;
  onGeneratePassword?: () => void;
}

export const calculatePasswordStrength = (password = '') => {
  const requirements: Requirement[] = [
    { id: 'length', label: 'Min. 8 characters', met: password.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
    { id: 'nospace', label: 'No spaces allowed', met: password.length > 0 && !/\s/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  let score = 0;
  let label = 'Empty';
  let color = 'bg-slate-200 text-slate-400';
  let barColor = 'bg-slate-200';

  if (password.length > 0) {
    if (metCount <= 2) {
      score = 25;
      label = 'Weak';
      color = 'bg-red-50 text-red-700 border-red-200';
      barColor = 'bg-red-500';
    } else if (metCount <= 4) {
      score = 50;
      label = 'Fair';
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      barColor = 'bg-amber-500';
    } else if (metCount === 5) {
      score = 75;
      label = 'Good';
      color = 'bg-yellow-50 text-yellow-800 border-yellow-200';
      barColor = 'bg-yellow-500';
    } else if (metCount === 6) {
      score = 100;
      label = 'Enterprise Secure';
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      barColor = 'bg-emerald-500';
    }
  }

  return { requirements, metCount, score, label, color, barColor };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password = '',
  onGeneratePassword,
}) => {
  const { requirements, score, label, color, barColor } = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  return (
    <div className="space-y-2 mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300">
      <div className="flex justify-between items-center text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] uppercase tracking-wider">Password Security</span>
          {password && (
            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border transition-all duration-300 ${color}`}>
              {label}
            </span>
          )}
        </div>

        {onGeneratePassword && (
          <button
            type="button"
            onClick={onGeneratePassword}
            tabIndex={0}
            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors"
          >
            <KeyRound className="w-3 h-3 text-emerald-600" />
            <span>Generate Strong</span>
          </button>
        )}
      </div>

      {password ? (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Requirements Checklist */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {requirements.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200 ${
                  req.met ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                }`}
              >
                {req.met ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                )}
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[11px] text-slate-400 font-medium italic">
          Enter a password to inspect security criteria or click "Generate Strong".
        </p>
      )}
    </div>
  );
};
