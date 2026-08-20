import React from 'react';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { IndianRupee, Sparkles } from 'lucide-react';

export interface Step8SalaryExpectationsProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const COMMON_SALARY_RANGES = [
  { min: 600000, max: 1000000, label: '₹6L – ₹10L/yr' },
  { min: 1000000, max: 1600000, label: '₹10L – ₹16L/yr' },
  { min: 1600000, max: 2400000, label: '₹16L – ₹24L/yr' },
  { min: 2400000, max: 3500000, label: '₹24L – ₹35L/yr' },
  { min: 3500000, max: 5000000, label: '₹35L – ₹50L/yr' },
];

export const Step8SalaryExpectations: React.FC<Step8SalaryExpectationsProps> = ({
  data,
  onChange,
  errors,
}) => {
  const formatInLakhs = (val: number) => {
    if (!val || val <= 0) return '₹0';
    const inL = val / 100000;
    return `₹${inL % 1 === 0 ? inL : inL.toFixed(1)} Lakhs/yr`;
  };

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={8}
        title="Annual Compensation Expectations"
        subtitle="Set your target annual salary in Indian Rupees (INR / ₹) for employer alignment."
        tag="Compensation"
      />

      <div className="space-y-6">
        {/* Quick Range Selection Chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-kth-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Benchmark Range (or enter custom below):</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_SALARY_RANGES.map((range) => {
              const isSelected =
                data.minSalaryINR === range.min && data.maxSalaryINR === range.max;
              return (
                <button
                  key={range.label}
                  type="button"
                  onClick={() =>
                    onChange({
                      minSalaryINR: range.min,
                      maxSalaryINR: range.max,
                    })
                  }
                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-mono transition-all ${
                    isSelected
                      ? 'bg-kth-primary-600 text-white border-kth-primary-600 font-bold shadow-2xs'
                      : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:bg-kth-slate-50'
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Numeric Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Expected Salary (INR / ₹ Annual) *"
            type="number"
            placeholder="e.g. 1800000 (18 Lakhs)"
            min={0}
            step={50000}
            value={data.minSalaryINR || ''}
            onChange={(e) =>
              onChange({
                minSalaryINR: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            helperText={data.minSalaryINR > 0 ? formatInLakhs(data.minSalaryINR) : 'Enter full amount (e.g. 1800000)'}
            error={errors.minSalaryINR}
            leftIcon={<IndianRupee className="w-4 h-4" />}
            required
          />

          <Input
            label="Maximum Expected Salary (INR / ₹ Annual) *"
            type="number"
            placeholder="e.g. 2600000 (26 Lakhs)"
            min={0}
            step={50000}
            value={data.maxSalaryINR || ''}
            onChange={(e) =>
              onChange({
                maxSalaryINR: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            helperText={data.maxSalaryINR > 0 ? formatInLakhs(data.maxSalaryINR) : 'Enter full amount (e.g. 2600000)'}
            error={errors.maxSalaryINR}
            leftIcon={<IndianRupee className="w-4 h-4" />}
            required
          />
        </div>

        {errors.salaryMismatch && (
          <p className="text-xs text-kth-semantic-error font-medium">{errors.salaryMismatch}</p>
        )}

        {/* Negotiable Checkbox */}
        <div className="pt-2 p-3.5 rounded-lg bg-kth-slate-50 border border-kth-slate-200">
          <Checkbox
            label="Open to negotiation based on role scope, ESOPs, and benefits package"
            checked={data.isNegotiable}
            onChange={(checked) => onChange({ isNegotiable: checked })}
          />
        </div>
      </div>
    </div>
  );
};
