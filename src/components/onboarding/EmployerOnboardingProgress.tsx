import React from 'react';
import { Check } from 'lucide-react';

export interface EmployerOnboardingProgressProps {
  currentStep: number;
  highestStepReached: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { id: 1, title: 'Recruiter Profile', desc: 'Name, job title & phone' },
  { id: 2, title: 'Company Identity', desc: 'Brand, industry & scale' },
  { id: 3, title: 'Corporate Location', desc: 'Headquarters & city' },
  { id: 4, title: 'Company Description', desc: 'Mission & work culture' },
  { id: 5, title: 'Online Presence', desc: 'Website & LinkedIn' },
  { id: 6, title: 'Contact & Admin', desc: 'Work email & permissions' },
  { id: 7, title: 'Review & Complete', desc: 'Final review & submit' },
];

export const EmployerOnboardingProgress: React.FC<EmployerOnboardingProgressProps> = ({
  currentStep,
  highestStepReached,
  onStepClick,
}) => {
  return (
    <nav aria-label="Employer Onboarding Steps" className="space-y-1.5">
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

            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-kth-primary-900' : 'text-kth-slate-800'}`}>
                {step.title}
              </p>
              <p className="text-[11px] text-kth-slate-500 truncate leading-snug mt-0.5">
                {step.desc}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
