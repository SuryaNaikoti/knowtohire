import React from 'react';
import { Input } from '@/components/ui/Input';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';
import { MapPin, Building } from 'lucide-react';

export interface Step3CompanyLocationProps {
  data: EmployerOnboardingData;
  onChange: (updates: Partial<EmployerOnboardingData>) => void;
  errors: Record<string, string>;
}

const COMMON_CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Delhi NCR',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
];

export const Step3CompanyLocation: React.FC<Step3CompanyLocationProps> = ({
  data,
  onChange,
  errors,
}) => {
  const handleQuickCity = (city: string) => {
    let state = 'Karnataka';
    if (city === 'Hyderabad') state = 'Telangana';
    else if (city === 'Mumbai' || city === 'Pune') state = 'Maharashtra';
    else if (city === 'Delhi NCR') state = 'Delhi / Haryana';
    else if (city === 'Chennai') state = 'Tamil Nadu';
    else if (city === 'Kolkata') state = 'West Bengal';
    else if (city === 'Ahmedabad') state = 'Gujarat';

    onChange({
      city,
      state,
      headquartersLocation: `${city}, ${state}`,
    });
  };

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={3}
        title="Corporate Location & Headquarters"
        subtitle="Where is your primary headquarters and talent recruitment hub located?"
        tag="Corporate Location"
      />

      <div className="space-y-4">
        {/* Quick City Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-kth-slate-800 block">
            Popular Hiring Hubs (Click to Pre-fill):
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCity(city)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  data.city === city
                    ? 'bg-kth-primary-600 text-white border-kth-primary-600 font-semibold shadow-2xs'
                    : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:bg-kth-slate-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Corporate Headquarters Address / Location *"
          placeholder="e.g. Acme Towers, Whitefield, Bengaluru, Karnataka"
          value={data.headquartersLocation}
          onChange={(e) => onChange({ headquartersLocation: e.target.value })}
          error={errors.headquartersLocation}
          leftIcon={<Building className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="City *"
            placeholder="e.g. Bengaluru"
            value={data.city}
            onChange={(e) =>
              onChange({
                city: e.target.value,
                headquartersLocation: `${e.target.value}, ${data.state || ''}`,
              })
            }
            error={errors.city}
            leftIcon={<MapPin className="w-4 h-4" />}
            required
          />

          <Input
            label="State *"
            placeholder="e.g. Karnataka"
            value={data.state}
            onChange={(e) =>
              onChange({
                state: e.target.value,
                headquartersLocation: `${data.city || ''}, ${e.target.value}`,
              })
            }
            error={errors.state}
            required
          />

          <Input
            label="Country"
            value={data.country || 'India'}
            onChange={(e) => onChange({ country: e.target.value })}
            disabled
            helperText="Default primary operational country"
          />
        </div>
      </div>
    </div>
  );
};
