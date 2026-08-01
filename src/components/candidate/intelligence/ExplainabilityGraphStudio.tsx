import React from 'react';
import { useUnifiedIntelligence } from '../../../context/UnifiedIntelligenceContext';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export const ExplainabilityGraphStudio: React.FC = () => {
  const { report } = useUnifiedIntelligence();

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Explainable AI Audit & Evidence Lineage</h3>
            <p className="text-xs text-slate-500">
              Every score, recommendation, and insight is transparently mapped to your verified candidate evidence graph.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Human-in-the-Loop AI Mandate</span>
            </h4>
            <p>
              KnowToHire AI algorithms never mutate or alter candidate profiles automatically. Recommendations must be explicitly accepted or edited by the candidate before publishing to recruiter views.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Domain Evidence Mapping</h4>

            {report.domainScores.map((domain, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{domain.domainName} Intelligence Domain</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-md">
                    {domain.score}% Rating
                  </span>
                </div>
                <p className="text-xs text-slate-600">{domain.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
