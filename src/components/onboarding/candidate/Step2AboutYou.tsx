import React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';

export interface Step2AboutYouProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const DOMAIN_OPTIONS = [
  { value: '', label: 'Select your primary domain specialization...' },
  { value: 'Environmental', label: 'Environmental Science & Management' },
  { value: 'ESG', label: 'ESG Reporting & Corporate Governance' },
  { value: 'Sustainability', label: 'Sustainability Strategy & Decarbonization' },
  { value: 'Climate', label: 'Climate Tech & Carbon Markets' },
  { value: 'Energy', label: 'Renewable Energy & CleanTech' },
  { value: 'Compliance', label: 'Environmental & Regulatory Compliance (SPCB/MoEFCC)' },
  { value: 'Legal', label: 'Environmental Law & IP Governance' },
  { value: 'Technology', label: 'Climate & Sustainability Software / Analytics' },
  { value: 'Finance', label: 'Sustainable Finance & Green Investments' },
  { value: 'Other', label: 'Other Specialization' },
];

export const Step2AboutYou: React.FC<Step2AboutYouProps> = ({
  data,
  onChange,
  errors,
}) => {
  const bioLength = data.bio.length;
  const isBioTooShort = bioLength > 0 && bioLength < 50;
  const isBioTooLong = bioLength > 1000;

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={2}
        title="About You"
        subtitle="Highlight your expertise and background for sustainability & consulting employers."
        tag="Professional Summary"
      />

      <div className="space-y-5">
        {/* Domain Specialization Selection */}
        <Select
          label="Primary Domain Specialization *"
          options={DOMAIN_OPTIONS}
          value={data.domainSpecialization}
          onChange={(e) => onChange({ domainSpecialization: e.target.value })}
          error={errors.domainSpecialization}
          helperText="Select the sector that best aligns with your expertise."
        />

        {data.domainSpecialization === 'Other' && (
          <Input
            label="Specify Your Domain Specialization *"
            placeholder="e.g. Waste Management & Circular Economy"
            value={data.customDomainSpecialization || ''}
            onChange={(e) => onChange({ customDomainSpecialization: e.target.value })}
            error={errors.customDomainSpecialization}
            required
          />
        )}

        {/* Bio Textarea */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between">
            <label htmlFor="candidate-bio" className="text-xs font-semibold text-kth-slate-800">
              Professional Bio / Summary *
            </label>
            <span
              className={`text-[11px] font-mono ${
                isBioTooShort
                  ? 'text-amber-600 font-semibold'
                  : isBioTooLong
                  ? 'text-red-600 font-bold'
                  : 'text-kth-slate-400'
              }`}
            >
              {bioLength} / 1000 chars {bioLength < 50 && '(min. 50)'}
            </span>
          </div>

          <textarea
            id="candidate-bio"
            rows={5}
            placeholder="Introduce your key achievements, focus areas, regulations handled (e.g. SEBI BRSR, ISO 14001, Net Zero pathways), and what value you bring to prospective teams..."
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            className={`w-full font-sans text-sm p-3.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150 focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20 ${
              errors.bio ? 'border-kth-semantic-error' : ''
            }`}
          />

          {errors.bio ? (
            <span className="text-xs text-kth-semantic-error font-medium">{errors.bio}</span>
          ) : (
            <span className="text-xs text-kth-slate-500">
              A well-crafted bio significantly improves employer shortlisting.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
