import React from 'react';
import { Input } from '@/components/ui/Input';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';
import { Globe, Linkedin } from 'lucide-react';

export interface Step5OnlinePresenceProps {
  data: EmployerOnboardingData;
  onChange: (updates: Partial<EmployerOnboardingData>) => void;
  errors: Record<string, string>;
}

export const Step5OnlinePresence: React.FC<Step5OnlinePresenceProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={5}
        title="Online & Social Presence"
        subtitle="Provide verified links to your corporate website and official LinkedIn profile."
        tag="Public Footprint"
      />

      <div className="space-y-4">
        <Input
          label="Corporate Website URL *"
          type="url"
          placeholder="https://acmesustainability.co.in"
          value={data.website || data.websiteUrl}
          onChange={(e) =>
            onChange({
              website: e.target.value,
              websiteUrl: e.target.value,
            })
          }
          helperText="Candidates use this to research your enterprise credentials."
          error={errors.websiteUrl}
          leftIcon={<Globe className="w-4 h-4" />}
          required
        />

        <Input
          label="LinkedIn Company Page URL"
          type="url"
          placeholder="https://www.linkedin.com/company/acme-sustainability"
          value={data.linkedinUrl}
          onChange={(e) => onChange({ linkedinUrl: e.target.value })}
          helperText="Optional, but enhances credibility during company verification."
          error={errors.linkedinUrl}
          leftIcon={<Linkedin className="w-4 h-4 text-[#0077b5]" />}
        />

        <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 text-xs text-kth-slate-600 space-y-1">
          <p className="font-semibold text-kth-slate-800">Company Verification Process:</p>
          <p>
            KnowToHire performs standard domain validation. Your organization profile is created immediately and reviewed by our verification team without delaying job postings.
          </p>
        </div>
      </div>
    </div>
  );
};
