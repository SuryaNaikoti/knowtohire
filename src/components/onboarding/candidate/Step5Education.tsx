import React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { GraduationCap, Building } from 'lucide-react';

export interface Step5EducationProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const QUALIFICATION_OPTIONS = [
  { value: '', label: 'Select highest qualification...' },
  { value: "Bachelor's", label: "Bachelor's Degree (B.Tech / B.Sc / B.Com / B.A / LL.B)" },
  { value: "Master's", label: "Master's Degree (M.Sc / M.Tech / M.A / LL.M)" },
  { value: 'MBA', label: 'MBA / Post Graduate Diploma in Management (PGDM)' },
  { value: 'PhD', label: 'Doctorate / PhD' },
  { value: 'Diploma', label: 'Specialized Diploma' },
  { value: 'High School', label: 'Higher Secondary / High School' },
  { value: 'Other', label: 'Other Qualification' },
];

export const Step5Education: React.FC<Step5EducationProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={5}
        title="Education & Academic Background"
        subtitle="Provide your highest degree or academic credential."
        tag="Academic Credentials"
      />

      <div className="space-y-4">
        <Select
          label="Highest Educational Qualification *"
          options={QUALIFICATION_OPTIONS}
          value={data.highestQualification}
          onChange={(e) => onChange({ highestQualification: e.target.value })}
          error={errors.highestQualification}
        />

        <Input
          label="College / University / Institution *"
          placeholder="e.g. Indian Institute of Technology (IIT) Bombay"
          value={data.institution}
          onChange={(e) => onChange({ institution: e.target.value })}
          error={errors.institution}
          leftIcon={<Building className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Field of Study / Discipline *"
            placeholder="e.g. Environmental Science & Engineering"
            value={data.fieldOfStudy}
            onChange={(e) => onChange({ fieldOfStudy: e.target.value })}
            error={errors.fieldOfStudy}
            leftIcon={<GraduationCap className="w-4 h-4" />}
            required
          />

          <Input
            label="Graduation Year *"
            type="number"
            placeholder="e.g. 2024"
            min={1970}
            max={2032}
            value={data.graduationYear}
            onChange={(e) => onChange({ graduationYear: e.target.value })}
            error={errors.graduationYear}
            required
          />
        </div>
      </div>
    </div>
  );
};
