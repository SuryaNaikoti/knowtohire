import React, { useState } from 'react';
import { useCompetencyEngine } from '../../../context/CompetencyEngineContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Plus, Trash2, ShieldCheck, Tag, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

export const CompetencySkillsGraphEditor: React.FC = () => {
  const { skills, aiSuggestedSkills, addSkill, deleteSkill, acceptAISuggestedSkill, rejectAISuggestedSkill } = useCompetencyEngine();

  const [skillName, setSkillName] = useState('');
  const [categoryName, setCategoryName] = useState<'Technical' | 'Functional' | 'Soft' | 'AI' | 'ESG'>('Technical');
  const [yearsExp, setYearsExp] = useState<number | ''>(3);
  const [competencyLevel, setCompetencyLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Advanced');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    await addSkill({
      skill_name: skillName.trim(),
      category_name: categoryName,
      years_of_experience: typeof yearsExp === 'number' ? yearsExp : 1,
      last_used_year: 2026,
      competency_level: competencyLevel,
      confidence_score: 90,
      market_demand: 'High',
      evidence_count: 1,
      verification_status: 'Self-Verified',
    });

    setSkillName('');
    setYearsExp(3);
  };

  return (
    <div className="space-y-6">
      {/* Human-in-the-Loop AI Inferred Skill Suggestions Banner */}
      {aiSuggestedSkills.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl text-white space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <h4 className="text-sm font-bold text-white">AI-Inferred Competencies (Human-in-the-Loop)</h4>
          </div>
          <p className="text-xs text-slate-300">
            Based on your career evidence, projects, and certifications, our engine inferred these competencies:
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {aiSuggestedSkills.map((suggested) => (
              <div
                key={suggested.id}
                className="p-3 bg-slate-900/90 border border-emerald-500/40 rounded-xl text-xs flex items-center justify-between gap-4 shrink-0"
              >
                <div>
                  <span className="font-bold text-emerald-300 block">{suggested.skill_name}</span>
                  <span className="text-[10px] text-slate-400">
                    {suggested.years_of_experience} Yrs • Confidence: {suggested.confidence_score}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => acceptAISuggestedSkill(suggested)}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectAISuggestedSkill(suggested.id)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Competency Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-600" />
          <span>Add Competency to Knowledge Graph</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Competency / Skill Name *"
            placeholder="e.g. React, ESG Compliance, PyTorch, Kubernetes"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Domain Category</label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Technical">Technical Competency</option>
              <option value="Functional">Functional / Domain</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="ESG">ESG & Sustainability</option>
              <option value="Soft">Leadership & Soft Skills</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Years of Experience"
            type="number"
            value={yearsExp}
            onChange={(e) => setYearsExp(e.target.value ? Number(e.target.value) : '')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Proficiency Maturity</label>
            <select
              value={competencyLevel}
              onChange={(e) => setCompetencyLevel(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Beginner">Beginner (Basic Awareness)</option>
              <option value="Intermediate">Intermediate (Independent Practitioner)</option>
              <option value="Advanced">Advanced (Domain Expert)</option>
              <option value="Expert">Expert (Thought Leader / Architect)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Competency Entry</span>
        </Button>
      </form>

      {/* Competency Graph Cards Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Evidence-Backed Competencies ({skills.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{skill.skill_name}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full">
                      {skill.competency_level}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">{skill.years_of_experience} Years Exp • Last Used: {skill.last_used_year || 2026}</p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteSkill(skill.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Multi-Dimensional Competency Maturity Specs */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold">
                <div>
                  <span className="text-slate-400 block uppercase">Confidence</span>
                  <span className="text-emerald-600 font-extrabold">{skill.confidence_score}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Demand</span>
                  <span className="text-teal-600 font-extrabold">{skill.market_demand || 'High'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Evidence Proof</span>
                  <span className="text-blue-600 font-extrabold">{skill.evidence_count} Items</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{skill.verification_status || 'Self-Verified'}</span>
                </span>
                {skill.ai_recommendation && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>AI Status: {skill.ai_recommendation}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
