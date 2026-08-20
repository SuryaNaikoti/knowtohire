import React from 'react';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { User, Briefcase, MapPin } from 'lucide-react';

export interface Step1BasicInfoProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={1}
        title="Basic Information"
        subtitle="Let employers know who you are and where you are located."
        tag="Profile Identity"
      />

      <div className="space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Aarav Mehta"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        <Input
          label="Professional Headline *"
          placeholder="e.g. Environmental & ESG Consultant"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          helperText="A concise summary of your current professional focus or desired role."
          error={errors.headline}
          leftIcon={<Briefcase className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PhoneInput
            label="Phone Number"
            value={data.phone}
            onChange={(phone) => onChange({ phone })}
            helperText="Optional, but recommended for recruiters."
            error={errors.phone}
            placeholder="98765 43210"
          />

          <Input
            label="Current Location *"
            placeholder="e.g. Hyderabad, Telangana"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            helperText="City and State in India (or global location)."
            error={errors.location}
            leftIcon={<MapPin className="w-4 h-4" />}
            required
          />
        </div>
      </div>
    </div>
  );
};
