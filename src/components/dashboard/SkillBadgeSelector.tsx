import React, { useState } from 'react';
import { Plus, X, Award, ShieldAlert } from 'lucide-react';
import { candidateService } from '../../lib/services/candidateService';
import type { CandidateSkill } from '../../lib/services/candidateService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';

interface SkillBadgeSelectorProps {
  candidateId: string;
  skills: CandidateSkill[];
  onSkillsChange: () => void;
}

export const SkillBadgeSelector: React.FC<SkillBadgeSelectorProps> = ({
  candidateId,
  skills,
  onSkillsChange,
}) => {
  const [skillName, setSkillName] = useState('');
  const [yearsOfExp, setYearsOfExp] = useState(1);
  const [competency, setCompetency] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setError('');
    setLoading(true);

    const isDuplicate = skills.some(
      (s) => s.skill_name.toLowerCase() === skillName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError(`"${skillName.trim()}" is already listed in your skills inventory.`);
      setLoading(false);
      return;
    }

    try {
      const success = await candidateService.addSkill({
        candidate_id: candidateId,
        skill_name: skillName.trim(),
        years_of_experience: yearsOfExp,
        competency_level: competency,
      });

      if (success) {
        setSkillName('');
        setYearsOfExp(1);
        setCompetency('Intermediate');
        onSkillsChange();
      } else {
        setError('Could not add skill.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const success = await candidateService.deleteSkill(candidateId, skillId);
      if (success) {
        onSkillsChange();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Skill Input Form */}
      <form onSubmit={handleAddSkill} className="bg-gray-50 border border-gray-200 border-solid rounded-xl p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-primary" /> Add Skill Reference
        </h4>

        {error && <Alert type="error" className="text-xs" title="Skills Alert">{error}</Alert>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Input
            label="Skill Name"
            placeholder="e.g. React, TypeScript, Python"
            required
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />

          <Input
            label="Years of Experience"
            type="number"
            min={0}
            required
            value={yearsOfExp}
            onChange={(e) => setYearsOfExp(Math.max(0, parseInt(e.target.value) || 0))}
          />

          <Select
            label="Competency Rating"
            value={competency}
            onChange={(e) => setCompetency(e.target.value as any)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </Select>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={loading} size="sm" className="font-bold text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add to List
          </Button>
        </div>
      </form>

      {/* Active Skills Inventory Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skills Inventory ({skills.length})</h4>
        {skills.length === 0 ? (
          <div className="bg-white border border-gray-150 border-solid rounded-xl p-6 text-center space-y-1">
            <ShieldAlert className="w-5 h-5 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-500">No skills declared yet.</p>
            <p className="text-[10px] text-gray-400 font-medium">Add technical capabilities to display matching vacancies.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white border border-gray-200 border-solid rounded-lg px-3 py-2 flex items-center justify-between gap-3 shadow-xs hover:border-gray-300 transition-all"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-gray-900 leading-none">{skill.skill_name}</p>
                  <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1 leading-none mt-0.5">
                    {skill.years_of_experience} {skill.years_of_experience === 1 ? 'year' : 'years'} •{' '}
                    <span className={
                      skill.competency_level === 'Expert'
                        ? 'text-primary'
                        : skill.competency_level === 'Intermediate'
                        ? 'text-secondary'
                        : 'text-gray-500'
                    }>
                      {skill.competency_level}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="p-0.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                  aria-label={`Remove skill ${skill.skill_name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
