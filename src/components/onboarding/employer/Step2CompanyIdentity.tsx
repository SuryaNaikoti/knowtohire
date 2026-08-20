import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';
import { Building2, Globe, Shield } from 'lucide-react';

export interface Step2CompanyIdentityProps {
  data: EmployerOnboardingData;
  onChange: (updates: Partial<EmployerOnboardingData>) => void;
  errors: Record<string, string>;
}

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select company industry sector...' },
  { value: 'Environmental & ESG Advisory', label: 'Environmental & ESG Advisory / Consulting' },
  { value: 'Renewable Energy & CleanTech', label: 'Renewable Energy & CleanTech' },
  { value: 'Corporate Sustainability', label: 'Corporate Sustainability & Decarbonization' },
  { value: 'Climate Tech & Carbon Markets', label: 'Climate Tech & Carbon Markets' },
  { value: 'Industrial Manufacturing & EHS', label: 'Industrial Manufacturing, EHS & Engineering' },
  { value: 'Legal & Regulatory Compliance', label: 'Legal, Intellectual Property & Compliance' },
  { value: 'Sustainable Finance & Private Equity', label: 'Sustainable Finance & Private Equity' },
  { value: 'Technology & Enterprise SaaS', label: 'Technology & Enterprise Software' },
  { value: 'Other Industry', label: 'Other Specialized Industry' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'Select employee scale...' },
  { value: 'Startup (1–10)', label: 'Startup (1–10 Employees)' },
  { value: '11–50 Employees', label: '11–50 Employees' },
  { value: '51–200 Employees', label: '51–200 Employees' },
  { value: '201–500 Employees', label: '201–500 Employees' },
  { value: '501–1000 Employees', label: '501–1000 Employees' },
  { value: '1000+ Enterprise', label: '1000+ Enterprise / Multinational' },
];

export const Step2CompanyIdentity: React.FC<Step2CompanyIdentityProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={2}
        title="Company Identity & Entity Information"
        subtitle="Establish your corporate organization profile and legal entity details."
        tag="Corporate Identity"
      />

      <div className="space-y-4">
        <Input
          label="Display Company Name *"
          placeholder="e.g. Acme Sustainability"
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          error={errors.companyName}
          leftIcon={<Building2 className="w-4 h-4" />}
          required
        />

        <Input
          label="Registered Legal Entity Name *"
          placeholder="e.g. Acme Sustainability Solutions Pvt. Ltd."
          value={data.legalName}
          onChange={(e) => onChange({ legalName: e.target.value })}
          helperText="Official registered enterprise name matching MCA / GST records."
          error={errors.legalName}
          leftIcon={<Shield className="w-4 h-4" />}
          required
        />

        <Input
          label="Corporate Website URL *"
          type="url"
          placeholder="https://acmesustainability.co.in"
          value={data.websiteUrl}
          onChange={(e) => onChange({ websiteUrl: e.target.value, website: e.target.value })}
          helperText="Public domain or career portal URL."
          error={errors.websiteUrl}
          leftIcon={<Globe className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Industry Sector *"
            options={INDUSTRY_OPTIONS}
            value={data.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            error={errors.industry}
          />

          <Select
            label="Company Size / Scale *"
            options={COMPANY_SIZE_OPTIONS}
            value={data.companySize}
            onChange={(e) => onChange({ companySize: e.target.value })}
            error={errors.companySize}
          />
        </div>
      </div>
    </div>
  );
};
