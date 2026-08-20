import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { Plus, X, Tag, Sparkles } from 'lucide-react';

export interface Step3SkillsProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

const POPULAR_SUGGESTIONS = [
  'ESG Reporting',
  'SEBI BRSR',
  'ISO 14001',
  'Carbon Accounting',
  'GHG Protocol (Scope 1, 2 & 3)',
  'GRI Standards',
  'EIA Assessment',
  'Decarbonization',
  'Life Cycle Assessment (LCA)',
  'Net Zero Strategy',
  'Energy Auditing',
  'Water Neutrality',
  'MoEFCC Clearances',
  'Sustainability Strategy',
  'Circular Economy',
];

export const Step3Skills: React.FC<Step3SkillsProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const skills = data.skills || [];

  const handleAddSkill = (skillToAdd?: string) => {
    const rawSkill = skillToAdd || skillInput;
    const trimmed = rawSkill.trim();
    setInputError(null);

    if (!trimmed) return;

    if (skills.length >= 20) {
      setInputError('Maximum 20 skills allowed.');
      return;
    }

    // Case-insensitive duplicate check
    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setInputError(`"${trimmed}" is already in your skills list.`);
      return;
    }

    onChange({ skills: [...skills, trimmed] });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange({
      skills: skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={3}
        title="Key Skills & Competencies"
        subtitle="Add specific methodologies, reporting standards, and domain skills (min. 3, max. 20)."
        tag="Skills Taxonomy"
      />

      <div className="space-y-4">
        {/* Skill Entry Input Bar */}
        <div>
          <label htmlFor="skill-input" className="text-xs font-semibold text-kth-slate-800 block mb-1.5">
            Type a skill and press Enter or Add *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="skill-input"
                type="text"
                placeholder="e.g. Scope 3 Emissions, ISO 50001, CSRD..."
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={handleKeyDown}
                className="w-full font-sans text-sm px-3.5 py-2.5 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none transition-all duration-150 focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleAddSkill()}
              disabled={!skillInput.trim() || skills.length >= 20}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Skill
            </Button>
          </div>

          {(inputError || errors.skills) && (
            <p className="text-xs text-kth-semantic-error font-medium mt-1.5">
              {inputError || errors.skills}
            </p>
          )}
        </div>

        {/* Selected Skills Tag Cloud */}
        <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-kth-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-kth-primary-600" />
              <span>Selected Skills ({skills.length} / 20)</span>
            </span>
            <span
              className={`font-mono text-[11px] ${
                skills.length < 3 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'
              }`}
            >
              {skills.length < 3 ? `Add ${3 - skills.length} more` : 'Requirement met'}
            </span>
          </div>

          {skills.length === 0 ? (
            <p className="text-xs text-kth-slate-400 italic py-2">
              No skills added yet. Select from the suggestions below or type your custom skill tags.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-kth-primary-200 text-kth-primary-900 text-xs font-semibold shadow-2xs group"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    aria-label={`Remove skill ${skill}`}
                    className="w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-700 text-kth-slate-400 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Quick Add Chips */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-kth-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Suggestions (Click to Add):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SUGGESTIONS.map((sug) => {
              const isAlreadyAdded = skills.some(
                (s) => s.toLowerCase() === sug.toLowerCase()
              );
              return (
                <button
                  key={sug}
                  type="button"
                  disabled={isAlreadyAdded || skills.length >= 20}
                  onClick={() => handleAddSkill(sug)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    isAlreadyAdded
                      ? 'bg-kth-slate-100 text-kth-slate-400 border-kth-slate-200 cursor-not-allowed line-through'
                      : 'bg-white hover:bg-kth-primary-50 text-kth-slate-700 hover:text-kth-primary-700 border-kth-slate-200 hover:border-kth-primary-200 shadow-2xs'
                  }`}
                >
                  + {sug}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
