import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export interface OnboardingCompleteProps {
  title: string;
  subtitle: string;
  role: 'candidate' | 'employer';
  portalPath: string;
  onNavigateToPortal: () => void;
  metrics?: { label: string; value: string }[];
}

export const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({
  title,
  subtitle,
  role,
  portalPath,
  onNavigateToPortal,
  metrics,
}) => {
  return (
    <div className="text-center py-10 px-4 space-y-6 max-w-lg mx-auto">
      {/* Celebratory Icon */}
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-kth-primary-600 via-kth-accent-cyan to-emerald-500 flex items-center justify-center text-white shadow-xl mx-auto animate-bounce-subtle">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Badge variant="emerald" hasPulse>
            Active Account
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-kth-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-kth-slate-600 leading-relaxed max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200">
          {metrics.map((m, idx) => (
            <div key={idx} className="text-left">
              <span className="text-[10px] uppercase font-bold text-kth-slate-400 block">
                {m.label}
              </span>
              <span className="text-sm font-bold text-kth-slate-800 font-mono block mt-0.5">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-md"
          onClick={onNavigateToPortal}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {role === 'candidate' ? 'Go to Candidate Dashboard' : 'Open Employer ATS Portal'}
        </Button>

        <p className="text-[11px] text-kth-slate-400">
          You will now be redirected to <span className="font-mono text-kth-slate-600">{portalPath}</span>
        </p>
      </div>
    </div>
  );
};
