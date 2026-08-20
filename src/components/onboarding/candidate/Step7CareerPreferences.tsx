import React, { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { Plus, X, MapPin, Briefcase } from 'lucide-react';

export interface Step7CareerPreferencesProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const COMMON_LOCATIONS = [
  'Hyderabad, TS',
  'Bengaluru, KA',
  'Mumbai, MH',
  'Delhi NCR',
  'Pune, MH',
  'Chennai, TN',
  'Kolkata, WB',
  'Remote (Anywhere in India)',
];

const REMOTE_PREFERENCES = [
  { value: 'Hybrid', label: 'Hybrid (Preferred balance of office & remote)' },
  { value: 'Remote', label: '100% Remote / Telecommute' },
  { value: 'On-site', label: 'On-site / Corporate Office' },
  { value: 'Flexible', label: 'Flexible / Open to any work mode' },
];

const EMPLOYMENT_TYPES = [
  { value: 'Full-time', label: 'Full-Time Employment' },
  { value: 'Contract', label: 'Contract / Project Basis' },
  { value: 'Part-time', label: 'Part-Time' },
  { value: 'Internship', label: 'Internship / Graduate Trainee' },
];

export const Step7CareerPreferences: React.FC<Step7CareerPreferencesProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [roleInput, setRoleInput] = useState('');
  const [customLocInput, setCustomLocInput] = useState('');

  const preferredTitles = data.preferredJobTitles || [];
  const preferredLocations = data.preferredLocations || [];

  const handleAddRole = (titleToAdd?: string) => {
    const raw = (titleToAdd || roleInput).trim();
    if (!raw) return;
    if (!preferredTitles.some((t) => t.toLowerCase() === raw.toLowerCase())) {
      onChange({ preferredJobTitles: [...preferredTitles, raw] });
    }
    setRoleInput('');
  };

  const handleRemoveRole = (titleToRemove: string) => {
    onChange({
      preferredJobTitles: preferredTitles.filter((t) => t !== titleToRemove),
    });
  };

  const handleToggleLocation = (loc: string) => {
    if (preferredLocations.includes(loc)) {
      onChange({
        preferredLocations: preferredLocations.filter((l) => l !== loc),
      });
    } else {
      onChange({
        preferredLocations: [...preferredLocations, loc],
      });
    }
  };

  const handleAddCustomLocation = () => {
    const trimmed = customLocInput.trim();
    if (!trimmed) return;
    if (!preferredLocations.includes(trimmed)) {
      onChange({
        preferredLocations: [...preferredLocations, trimmed],
      });
    }
    setCustomLocInput('');
  };

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={7}
        title="Career Preferences & Work Mode"
        subtitle="Let prospective employers know your ideal roles, locations, and workplace setup."
        tag="Career Positioning"
      />

      <div className="space-y-6">
        {/* Preferred Job Titles */}
        <div className="space-y-2">
          <label htmlFor="role-input" className="text-xs font-semibold text-kth-slate-800 block">
            Target / Desired Job Titles *
          </label>
          <div className="flex gap-2">
            <input
              id="role-input"
              type="text"
              placeholder="e.g. Lead Sustainability Consultant, ESG Auditor"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRole();
                }
              }}
              className="flex-1 font-sans text-sm px-3.5 py-2.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150 focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleAddRole()}
              disabled={!roleInput.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Role
            </Button>
          </div>

          {errors.preferredJobTitles && (
            <p className="text-xs text-kth-semantic-error font-medium">{errors.preferredJobTitles}</p>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {preferredTitles.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kth-primary-50 border border-kth-primary-200 text-kth-primary-800 text-xs font-semibold"
              >
                <Briefcase className="w-3 h-3 text-kth-primary-600" />
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(t)}
                  className="w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-700 text-kth-slate-400 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-kth-slate-800 block">
            Preferred Job Locations *
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_LOCATIONS.map((loc) => {
              const isSelected = preferredLocations.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleToggleLocation(loc)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-kth-primary-600 text-white border-kth-primary-600 shadow-2xs font-semibold'
                      : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:bg-kth-slate-50'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{loc}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add other city / state in India..."
              value={customLocInput}
              onChange={(e) => setCustomLocInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomLocation();
                }
              }}
              className="flex-1 font-sans text-xs px-3 py-2 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddCustomLocation}
              disabled={!customLocInput.trim()}
            >
              + Add City
            </Button>
          </div>

          {errors.preferredLocations && (
            <p className="text-xs text-kth-semantic-error font-medium">{errors.preferredLocations}</p>
          )}
        </div>

        {/* Work Mode & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Remote / Workplace Preference *"
            options={REMOTE_PREFERENCES}
            value={data.remotePreference}
            onChange={(e) =>
              onChange({
                remotePreference: e.target.value as 'Remote' | 'Hybrid' | 'On-site' | 'Flexible',
              })
            }
            error={errors.remotePreference}
          />

          <Select
            label="Employment Type *"
            options={EMPLOYMENT_TYPES}
            value={data.employmentType}
            onChange={(e) =>
              onChange({
                employmentType: e.target.value as 'Full-time' | 'Part-time' | 'Contract' | 'Internship',
              })
            }
            error={errors.employmentType}
          />
        </div>
      </div>
    </div>
  );
};
