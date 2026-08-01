import React from 'react';
import { useCareerSuccess } from '../../../context/CareerSuccessContext';
import { TrendingUp } from 'lucide-react';

export const OutcomeLearningRoadmapStudio: React.FC = () => {
  const { learningRoadmap } = useCareerSuccess();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Outcome-Linked Personalized Learning Roadmap</h3>
          <p className="text-xs text-slate-500">Every skill recommendation is tied to concrete opportunity fit boosts & market demand.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningRoadmap.map((item) => (
          <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase border border-slate-200">
                  {item.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{item.skill_name}</h4>
              </div>

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{item.fit_impact_percent_boost}% Fit Impact
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Target Open Opportunities:</span>
                <span className="text-emerald-700 font-bold">{item.target_opportunity_count} Roles</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Est. Time to Mastery:</span>
                <span>{item.estimated_hours_to_master} Hours</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
