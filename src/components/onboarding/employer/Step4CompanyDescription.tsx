import React from 'react';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';

export interface Step4CompanyDescriptionProps {
  data: EmployerOnboardingData;
  onChange: (updates: Partial<EmployerOnboardingData>) => void;
  errors: Record<string, string>;
}

export const Step4CompanyDescription: React.FC<Step4CompanyDescriptionProps> = ({
  data,
  onChange,
  errors,
}) => {
  const descLength = data.description?.length || 0;
  const isTooShort = descLength > 0 && descLength < 50;
  const isTooLong = descLength > 1000;

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={4}
        title="Company Profile & Culture"
        subtitle="Introduce your enterprise vision, decarbonization mission, and working culture."
        tag="Company Story"
      />

      <div className="space-y-4">
        {/* Company Description Textarea */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between">
            <label htmlFor="company-description" className="text-xs font-semibold text-kth-slate-800">
              Company Overview / About Us *
            </label>
            <span
              className={`text-[11px] font-mono ${
                isTooShort
                  ? 'text-amber-600 font-semibold'
                  : isTooLong
                  ? 'text-red-600 font-bold'
                  : 'text-kth-slate-400'
              }`}
            >
              {descLength} / 1000 chars {descLength < 50 && '(min. 50)'}
            </span>
          </div>

          <textarea
            id="company-description"
            rows={5}
            placeholder="Describe what your enterprise delivers, core industry focus, key clients, and what makes your sustainability / consulting practice unique..."
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className={`w-full font-sans text-sm p-3.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150 focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20 ${
              errors.description ? 'border-kth-semantic-error' : ''
            }`}
          />

          {errors.description ? (
            <span className="text-xs text-kth-semantic-error font-medium">{errors.description}</span>
          ) : (
            <span className="text-xs text-kth-slate-500">
              Visible to prospective candidates on your job postings and company page.
            </span>
          )}
        </div>

        {/* Company Mission Textarea */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="company-mission" className="text-xs font-semibold text-kth-slate-800">
            Corporate Mission / Sustainability Vision (Optional)
          </label>
          <textarea
            id="company-mission"
            rows={2}
            placeholder="e.g. Accelerating corporate Net Zero transitions and BRSR compliance across India's industrial backbone."
            value={data.mission}
            onChange={(e) => onChange({ mission: e.target.value })}
            className="w-full font-sans text-sm p-3.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20"
          />
        </div>

        {/* Work Culture & Benefits */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="company-culture" className="text-xs font-semibold text-kth-slate-800">
            Workplace Culture & Benefits Highlights (Optional)
          </label>
          <textarea
            id="company-culture"
            rows={2}
            placeholder="e.g. Hybrid working policy, comprehensive health insurance, continuous ESG certification sponsorship, ESOP pool."
            value={data.cultureBenefits}
            onChange={(e) => onChange({ cultureBenefits: e.target.value })}
            className="w-full font-sans text-sm p-3.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20"
          />
        </div>
      </div>
    </div>
  );
};
