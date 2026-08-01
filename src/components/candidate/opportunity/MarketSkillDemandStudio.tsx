import React from 'react';
import { useOpportunityWorkspace } from '../../../context/OpportunityWorkspaceContext';
import { TrendingUp } from 'lucide-react';

export const MarketSkillDemandStudio: React.FC = () => {
  const { skillDemandNodes } = useOpportunityWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Market Skill Demand & Salary Impact Graph</h3>
          <p className="text-xs text-slate-500">Real-time market growth, salary boost metrics, and replacement skill graphs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillDemandNodes.map((node) => (
          <div key={node.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{node.skill_name}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                  {node.market_demand_rating} Demand
                </span>
              </h4>

              <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{node.year_over_year_growth}% YoY
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between font-semibold">
              <span className="text-slate-500">Avg. Salary Boost:</span>
              <span className="text-slate-900 font-extrabold">{node.average_salary_impact}</span>
            </div>

            {node.replacement_skills && node.replacement_skills.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Related / Alternative Skills:</span>
                <div className="flex gap-1">
                  {node.replacement_skills.map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
