import React from 'react';

export interface OnboardingStepHeaderProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  tag?: string;
}

export const OnboardingStepHeader: React.FC<OnboardingStepHeaderProps> = ({
  stepNumber,
  title,
  subtitle,
  tag,
}) => {
  return (
    <div className="space-y-1.5 text-left py-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-kth-primary-600">
          STEP {stepNumber < 10 ? `0${stepNumber}` : stepNumber}
        </span>
        {tag && (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-kth-slate-100 text-kth-slate-600 border border-kth-slate-200">
            {tag}
          </span>
        )}
      </div>
      <h1 className="font-display font-bold text-xl sm:text-2xl text-kth-slate-900 tracking-tight">
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-kth-slate-600 leading-relaxed font-normal">
        {subtitle}
      </p>
    </div>
  );
};
