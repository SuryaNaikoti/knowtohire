import React from 'react';
import { Check } from 'lucide-react';

export interface CreatorOnboardingProgressProps {
  currentStep: number;
  highestStepReached: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { id: 1, title: 'Creator Profile', desc: 'Display name & bio' },
  { id: 2, title: 'Domain Expertise', desc: 'Topics & specializations' },
  { id: 3, title: 'Content Focus', desc: 'Resources & templates' },
  { id: 4, title: 'Payout Details', desc: 'UPI & bank credentials' },
  { id: 5, title: 'Terms & Agreement', desc: '70% royalty & moderation' },
];

export const CreatorOnboardingProgress: React.FC<CreatorOnboardingProgressProps> = ({
  currentStep,
  highestStepReached,
  onStepClick,
}) => {
  return (
    <nav aria-label="Creator Onboarding Steps" className="space-y-1.5">
      {STEPS.map((step) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isAccessible = step.id <= highestStepReached;

        return (
          <button
            key={step.id}
            type="button"
            disabled={!isAccessible}
            onClick={() => isAccessible && onStepClick(step.id)}
            className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
              isCurrent
                ? 'bg-kth-primary-50 border border-kth-primary-200 text-kth-primary-900 shadow-2xs'
                : isCompleted
                ? 'hover:bg-kth-slate-50 text-kth-slate-700'
                : 'opacity-60 cursor-not-allowed text-kth-slate-400'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              ) : isCurrent ? (
                <div className="w-5 h-5 rounded-full bg-kth-primary-600 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                  {step.id}
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center font-mono text-[10px]">
                  {step.id}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">{step.title}</span>
              <span className="text-[11px] text-kth-slate-500 block truncate">{step.desc}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
