import React, { useState } from 'react';
import { useCareerSuccess } from '../../../context/CareerSuccessContext';
import { Zap, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';

export const CareerProgressionSimulatorStudio: React.FC = () => {
  const { activeSimulationResult, runCareerSimulation } = useCareerSuccess();
  const [skillsInput, setSkillsInput] = useState('Kubernetes, GraphQL');
  const [certsInput, setCertsInput] = useState('AWS Solutions Architect');
  const [extraYears, setExtraYears] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const certs = certsInput.split(',').map((c) => c.trim()).filter(Boolean);

    await runCareerSimulation(skills, certs, extraYears);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Form */}
      <form onSubmit={handleSimulate} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Interactive Career Progression Scenario Simulator</span>
          </h3>
          <p className="text-xs text-slate-500">
            Simulate "What If?" career scenarios to project simulated fit score boosts, unlocked roles & salary growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Simulate Skill Additions</label>
            <input
              type="text"
              placeholder="e.g. Kubernetes, GraphQL"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            />
            {/* DEF-UX-02 Quick Add Recommendation Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['Kubernetes', 'GraphQL', 'Docker', 'PyTorch'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    if (!skillsInput.includes(chip)) {
                      setSkillsInput((prev) => (prev ? `${prev}, ${chip}` : chip));
                    }
                  }}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md cursor-pointer hover:bg-emerald-100 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Simulate Certification</label>
            <input
              type="text"
              placeholder="e.g. AWS Certified Solutions Architect"
              value={certsInput}
              onChange={(e) => setCertsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Additional Experience Years</label>
            <input
              type="number"
              min={0}
              max={10}
              value={extraYears}
              onChange={(e) => setExtraYears(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isSimulating}
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Simulate Career Progression Scenario</span>
        </Button>
      </form>

      {/* Simulation Result Card */}
      {activeSimulationResult && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Scenario Projection Result</span>
              <h4 className="text-lg font-bold text-white">{activeSimulationResult.scenario_name}</h4>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
              Simulated Growth
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">Opportunity Fit</span>
              <span className="text-xl font-black text-emerald-400">
                {activeSimulationResult.initial_fit_score}% → {activeSimulationResult.simulated_fit_score}%
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">Unlocked Roles</span>
              <span className="text-xl font-black text-teal-400">{activeSimulationResult.unlocked_opportunity_count} Roles</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">Est. Salary Boost</span>
              <span className="text-xl font-black text-blue-400">{activeSimulationResult.estimated_salary_boost_amount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
