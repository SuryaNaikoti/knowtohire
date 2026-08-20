import React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { Briefcase, Building2 } from 'lucide-react';

export interface Step4ExperienceProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: '', label: 'Select your total work experience...' },
  { value: 'Fresher', label: 'Fresher / Entry Level (0 Years)' },
  { value: '0–1 years', label: '0 – 1 Years Experience' },
  { value: '1–3 years', label: '1 – 3 Years Experience' },
  { value: '3–5 years', label: '3 – 5 Years Experience' },
  { value: '5–10 years', label: '5 – 10 Years Experience' },
  { value: '10+ years', label: '10+ Years (Senior / Leadership)' },
];

export const Step4Experience: React.FC<Step4ExperienceProps> = ({
  data,
  onChange,
  errors,
}) => {
  const isFresher = data.totalExperience === 'Fresher';

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={4}
        title="Work Experience"
        subtitle="Specify your career seniority and current or most recent role."
        tag="Career Track"
      />

      <div className="space-y-4">
        {/* Total Experience Level */}
        <Select
          label="Total Professional Experience *"
          options={EXPERIENCE_LEVEL_OPTIONS}
          value={data.totalExperience}
          onChange={(e) => {
            const val = e.target.value;
            let numericYears = 0;
            if (val === 'Fresher') numericYears = 0;
            else if (val === '0–1 years') numericYears = 1;
            else if (val === '1–3 years') numericYears = 2;
            else if (val === '3–5 years') numericYears = 4;
            else if (val === '5–10 years') numericYears = 7;
            else if (val === '10+ years') numericYears = 10;

            onChange({
              totalExperience: val,
              experienceYears: numericYears,
              ...(val === 'Fresher' && { currentJobTitle: '', currentCompany: '' }),
            });
          }}
          error={errors.totalExperience}
          helperText="Select your overall professional work history."
        />

        {!isFresher && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Current / Most Recent Job Title *"
              placeholder="e.g. Senior ESG Consultant"
              value={data.currentJobTitle}
              onChange={(e) => onChange({ currentJobTitle: e.target.value })}
              error={errors.currentJobTitle}
              leftIcon={<Briefcase className="w-4 h-4" />}
              required={!isFresher}
            />

            <Input
              label="Current / Most Recent Employer *"
              placeholder="e.g. EcoStrategy India Pvt Ltd"
              value={data.currentCompany}
              onChange={(e) => onChange({ currentCompany: e.target.value })}
              error={errors.currentCompany}
              leftIcon={<Building2 className="w-4 h-4" />}
              required={!isFresher}
            />
          </div>
        )}

        {isFresher && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <span className="font-semibold">Entry Level / Fresher Track: </span>
            <span>
              Employer experience is optional. In subsequent steps, emphasize your academic credentials, internships, and certifications.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
