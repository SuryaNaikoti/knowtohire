import React from 'react';
import { Progress } from '@/components/ui/Progress';

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  completionPct?: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  completionPct,
}) => {
  const stepPercentage = Math.round(((currentStep - 1) / totalSteps) * 100);
  const displayPercentage = completionPct !== undefined ? completionPct : stepPercentage;

  return (
    <div className="w-full space-y-3 pb-6 border-b border-kth-slate-100">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold text-kth-slate-600">
          <span className="px-2 py-0.5 rounded bg-kth-primary-50 text-kth-primary-700 border border-kth-primary-200 font-mono text-[11px]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-kth-slate-900 font-bold">{stepTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-kth-primary-700 font-bold">
          <span>{displayPercentage}%</span>
          <span className="text-kth-slate-400 text-[10px] uppercase font-sans font-medium">Complete</span>
        </div>
      </div>

      <Progress value={displayPercentage} color="primary" />
    </div>
  );
};
