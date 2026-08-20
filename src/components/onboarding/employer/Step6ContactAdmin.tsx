import React from 'react';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';
import { Mail, ShieldCheck, Lock } from 'lucide-react';

export interface Step6ContactAdminProps {
  data: EmployerOnboardingData;
  onChange: (updates: Partial<EmployerOnboardingData>) => void;
  errors: Record<string, string>;
  authEmail: string;
}

export const Step6ContactAdmin: React.FC<Step6ContactAdminProps> = ({
  data,
  onChange,
  errors,
  authEmail,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={6}
        title="Admin Contact & Authorization"
        subtitle="Confirm your corporate administration permissions and official contact details."
        tag="Governance & Admin"
      />

      <div className="space-y-4">
        {/* Authoritative Work Email */}
        <div className="relative">
          <Input
            label="Authoritative Account Email"
            type="email"
            value={authEmail || data.workEmail}
            disabled
            helperText="Your authenticated login email is authoritative and cannot be modified here."
            leftIcon={<Mail className="w-4 h-4" />}
            rightIcon={<Lock className="w-4 h-4 text-kth-slate-400" />}
          />
        </div>

        {/* Contact Phone */}
        <PhoneInput
          label="Recruitment Desk / Direct Work Phone *"
          placeholder="80 4920 1800"
          value={data.contactPhone || data.workPhone}
          onChange={(val) =>
            onChange({
              contactPhone: val,
              workPhone: val,
            })
          }
          error={errors.contactPhone}
          required
        />

        {/* Company Admin Authorization */}
        <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-kth-slate-800 block">
                Enterprise Account Administrator
              </span>
              <p className="text-xs text-kth-slate-600 mt-0.5">
                As the primary creator of this corporate profile, you will be granted Company Administrator privileges to post jobs, manage hiring team members, and review ATS candidate pipelines.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-kth-slate-200">
            <Checkbox
              label="I confirm I am an authorized representative of this company."
              checked={data.isCompanyAdmin}
              onChange={(checked) => onChange({ isCompanyAdmin: checked })}
            />
          </div>
          {errors.isCompanyAdmin && (
            <p className="text-xs text-kth-semantic-error font-medium">{errors.isCompanyAdmin}</p>
          )}
        </div>
      </div>
    </div>
  );
};
