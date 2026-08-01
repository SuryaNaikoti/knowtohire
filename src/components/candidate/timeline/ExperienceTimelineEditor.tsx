import React, { useState } from 'react';
import { useCareerEvidence } from '../../../context/CareerEvidenceContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Plus, Trash2, Briefcase, Calendar, MapPin, Tag, CheckCircle2 } from 'lucide-react';

export const ExperienceTimelineEditor: React.FC = () => {
  const { experiences, addExperience, deleteExperience } = useCareerEvidence();

  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship'>('Full-time');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [skillTagInput, setSkillTagInput] = useState('');
  const [skillsUsed, setSkillsUsed] = useState<{ skill_name: string }[]>([]);

  const handleAddSkillTag = () => {
    if (!skillTagInput.trim()) return;
    setSkillsUsed([...skillsUsed, { skill_name: skillTagInput.trim() }]);
    setSkillTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !roleTitle || !startDate) return;

    await addExperience({
      company_name: companyName,
      role_title: roleTitle,
      employment_type: employmentType,
      industry,
      location,
      start_date: startDate,
      end_date: isCurrent ? null : endDate,
      is_current: isCurrent,
      description,
      achievements: achievements ? achievements.split('\n').filter(Boolean) : [],
      skills_used: skillsUsed,
      verification_status: 'Self-Verified',
    });

    // Reset Form
    setCompanyName('');
    setRoleTitle('');
    setIndustry('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setAchievements('');
    setSkillsUsed([]);
  };

  return (
    <div className="space-y-6">
      {/* Add Experience Evidence Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600" />
          <span>Add Work Experience Evidence</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            placeholder="e.g. Acme Corporation"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <Input
            label="Role Title *"
            placeholder="e.g. Senior Full-Stack Engineer"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <Input
            label="Industry Domain"
            placeholder="e.g. Environmental Tech / SaaS"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <Input
            label="Location"
            placeholder="e.g. San Francisco, CA or Remote"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">End Date</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Currently Working Here</span>
              </label>
            </div>
            {!isCurrent && (
              <Input
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Responsibilities & Impact Description</label>
          <textarea
            rows={3}
            placeholder="Describe key responsibilities and domain scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Key Achievements (One per line)</label>
          <textarea
            rows={2}
            placeholder="e.g. Reduced emissions by 28%&#10;Saved $250K annually in operating expenses"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        {/* Skills Demonstrated Linking */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Link Demonstrated Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. React, EIA, ISO 14001"
              value={skillTagInput}
              onChange={(e) => setSkillTagInput(e.target.value)}
              className="flex-1 px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            <Button
              type="button"
              onClick={handleAddSkillTag}
              className="px-3 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" /> Link Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skillsUsed.map((sk, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                {sk.skill_name}
                <button type="button" onClick={() => setSkillsUsed(skillsUsed.filter((_, i) => i !== idx))}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Save Experience Evidence</span>
        </Button>
      </form>

      {/* Experience Evidence Repositories List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Recorded Experience Evidence ({experiences.length})
        </h4>

        {experiences.map((exp) => (
          <div key={exp.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{exp.role_title}</span>
                  <span className="text-xs font-semibold text-emerald-600">@ {exp.company_name}</span>
                </h4>
                <p className="text-xs text-slate-500">{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date} • {exp.location}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {exp.verification_status || 'Self-Verified'}
                </span>
                <button
                  type="button"
                  onClick={() => deleteExperience(exp.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700">{exp.description}</p>

            {exp.skills_used && exp.skills_used.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {exp.skills_used.map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                    {sk.skill_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
