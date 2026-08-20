import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData, CertificationItem } from '@/types/onboarding';
import { Award, Plus, Trash2, Sparkles } from 'lucide-react';

export interface Step6CertificationsProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const COMMON_CERT_TEMPLATES = [
  { name: 'GRI Certified Sustainability Professional', org: 'Global Reporting Initiative (GRI)' },
  { name: 'Lead Auditor ISO 14001:2015 (EMS)', org: 'BSI / IRCA' },
  { name: 'Sustainability and Climate Risk (SCR)', org: 'GARP' },
  { name: 'Certified Energy Auditor (CEA)', org: 'Bureau of Energy Efficiency (BEE)' },
  { name: 'NEBOSH International General Certificate', org: 'NEBOSH UK' },
];

export const Step6Certifications: React.FC<Step6CertificationsProps> = ({
  data,
  onChange,
}) => {
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certYear, setCertYear] = useState(new Date().getFullYear().toString());
  const [addError, setAddError] = useState<string | null>(null);

  const certifications = data.certifications || [];

  const handleAdd = (nameVal?: string, orgVal?: string) => {
    const finalName = (nameVal || certName).trim();
    const finalOrg = (orgVal || certOrg).trim();
    const finalYear = certYear.trim() || new Date().getFullYear().toString();

    if (!finalName) {
      setAddError('Please enter the certification or credential title.');
      return;
    }

    setAddError(null);
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: finalName,
      issuingOrg: finalOrg || 'Accredited Body',
      year: finalYear,
    };

    onChange({
      certifications: [...certifications, newCert],
    });

    setCertName('');
    setCertOrg('');
  };

  const handleRemove = (id: string) => {
    onChange({
      certifications: certifications.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={6}
        title="Professional Certifications & Accreditations"
        subtitle="Add industry credentials, auditor licenses, and specialized compliance certifications."
        tag="Industry Credentials"
      />

      <div className="space-y-5">
        {/* Add New Certification Card */}
        <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 space-y-3">
          <span className="text-xs font-bold text-kth-slate-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-kth-primary-600" />
            <span>Add a Certification (Optional)</span>
          </span>

          <div className="space-y-3">
            <Input
              label="Certification / License Title"
              placeholder="e.g. GRI Certified Sustainability Professional"
              value={certName}
              onChange={(e) => {
                setCertName(e.target.value);
                if (addError) setAddError(null);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Issuing Organization"
                  placeholder="e.g. Global Reporting Initiative (GRI)"
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Year Issued"
                  placeholder="e.g. 2024"
                  value={certYear}
                  onChange={(e) => setCertYear(e.target.value)}
                />
              </div>
            </div>

            {addError && <p className="text-xs text-kth-semantic-error font-medium">{addError}</p>}

            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleAdd()}
                disabled={!certName.trim()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Certification
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Certifications List */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-kth-slate-800 block">
            Added Certifications ({certifications.length})
          </label>

          {certifications.length === 0 ? (
            <p className="text-xs text-kth-slate-400 italic p-3 rounded-lg border border-dashed border-kth-slate-200 bg-white">
              No certifications added yet. You can skip this step or add credentials anytime.
            </p>
          ) : (
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-kth-slate-200 shadow-2xs"
                >
                  <div className="min-w-0 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-kth-slate-900 leading-tight truncate">
                        {cert.name}
                      </p>
                      <p className="text-[11px] text-kth-slate-500 mt-0.5">
                        {cert.issuingOrg} • {cert.year}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(cert.id)}
                    aria-label={`Remove certification ${cert.name}`}
                    className="text-kth-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Certification Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-kth-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-kth-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Click to Add Popular Credentials:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_CERT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleAdd(tmpl.name, tmpl.org)}
                className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-kth-primary-50 text-kth-slate-700 hover:text-kth-primary-700 border border-kth-slate-200 hover:border-kth-primary-200 shadow-2xs"
              >
                + {tmpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
