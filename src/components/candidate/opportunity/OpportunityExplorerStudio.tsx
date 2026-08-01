import React from 'react';
import { useOpportunityWorkspace } from '../../../context/OpportunityWorkspaceContext';
import { MapPin, DollarSign, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '../../ui/Button';

export const OpportunityExplorerStudio: React.FC = () => {
  const { opportunities, setSelectedOpportunityId, selectedOpportunityId, applyToOpportunity } = useOpportunityWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Multi-Category Opportunity Ecosystem Explorer</h3>
          <p className="text-xs text-slate-500">Discover verified Jobs, Research Fellowships, Grants & Hackathons</p>
        </div>
        <span className="text-xs font-bold text-slate-500">{opportunities.length} Active Opportunities</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => {
          const isSelected = selectedOpportunityId === opp.id;
          return (
            <div
              key={opp.id}
              onClick={() => setSelectedOpportunityId(opp.id)}
              className={`p-5 bg-white border rounded-2xl shadow-xs space-y-3 cursor-pointer transition ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase border border-slate-200">
                    {opp.opportunity_type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{opp.instance_title}</h4>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> @ {opp.provider_name} ({opp.provider_type})
                  </p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                  92% Fit
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.city}, {opp.country} ({opp.location_type})
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {opp.compensation_range}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Deadline: {opp.application_deadline}
                </span>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    applyToOpportunity(opp.id);
                  }}
                  className="px-3 h-8 text-[11px] font-bold bg-slate-900 text-white rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Apply
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
