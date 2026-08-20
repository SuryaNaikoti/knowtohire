import React from 'react';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';
import { User, Briefcase } from 'lucide-react';

export interface Step1RecruiterInfoProps {
  data: EmployerOnboardingData;
  onChange: (updates: Partial<EmployerOnboardingData>) => void;
  errors: Record<string, string>;
}

export const Step1RecruiterInfo: React.FC<Step1RecruiterInfoProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={1}
        title="Recruiter Information"
        subtitle="Provide your name, corporate title, and contact details as the primary hiring contact."
        tag="Recruiter Identity"
      />

      <div className="space-y-4">
        <Input
          label="Your Full Name *"
          placeholder="e.g. Priya Nair"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        <Input
          label="Your Professional Job Title *"
          placeholder="e.g. Talent Acquisition Lead / Head of HR"
          value={data.jobTitle}
          onChange={(e) => onChange({ jobTitle: e.target.value })}
          error={errors.jobTitle}
          leftIcon={<Briefcase className="w-4 h-4" />}
          required
        />

        <PhoneInput
          label="Corporate Work Phone *"
          placeholder="80 4920 1800 or 98765 43210"
          value={data.workPhone}
          onChange={(workPhone) => onChange({ workPhone })}
          helperText="Used for verification notices and urgent candidate interview coordination."
          error={errors.workPhone}
          required
        />
      </div>
    </div>
  );
};
