import React from 'react';
import { useOpportunityWorkspace } from '../../../context/OpportunityWorkspaceContext';
import { AlertTriangle, TrendingUp, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';

export const OpportunityFitEngineStudio: React.FC = () => {
  const { currentOpportunityFit, opportunities, selectedOpportunityId, applyToOpportunity } = useOpportunityWorkspace();
  const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId);

  if (!currentOpportunityFit || !selectedOpp) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <p className="text-xs text-slate-500">Select an opportunity from the Explorer to run the 13-Factor Fit & Risk Engine.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper 4 Score Breakdown Strip */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Opportunity Fit & Risk Analysis</span>
            <h2 className="text-2xl font-black text-white">{selectedOpp.instance_title}</h2>
            <p className="text-xs text-slate-400">@ {selectedOpp.provider_name} • {selectedOpp.city}, {selectedOpp.country}</p>
          </div>

          <Button
            onClick={() => applyToOpportunity(selectedOpp.id)}
            className="px-6 h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" /> One-Click Apply with CDIC Persona
          </Button>
        </div>

        {/* Split Probabilities Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Fit Score</span>
            <span className="text-xl font-black text-emerald-400">{currentOpportunityFit.fitScore}%</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Risk Score</span>
            <span className="text-xl font-black text-amber-400">{currentOpportunityFit.riskScore}%</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Interview Prob.</span>
            <span className="text-xl font-black text-teal-400">{currentOpportunityFit.interviewProbability}%</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Offer Prob.</span>
            <span className="text-xl font-black text-blue-400">{currentOpportunityFit.offerProbability}%</span>
          </div>
        </div>
      </div>

      {/* Granular Positive & Negative Explainability Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Positive Score Boost Drivers
          </h4>

          <div className="space-y-2">
            {currentOpportunityFit.positiveBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-800 font-medium">{item.factor}</span>
                <span className="font-extrabold text-emerald-700 text-xs">+{item.boost}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Risk Penalties */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Penalties & Gaps
          </h4>

          <div className="space-y-2">
            {currentOpportunityFit.negativeBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-800 font-medium">{item.factor}</span>
                <span className="font-extrabold text-amber-700 text-xs">{item.penalty}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prescriptive Recommended Actions */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-600" /> Recommended Actions to Maximize Fit Score
        </h4>

        <div className="space-y-2">
          {currentOpportunityFit.recommendedActions.map((action, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
