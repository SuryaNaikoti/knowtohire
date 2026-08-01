import React from 'react';
import { useDocumentIntelligence } from '../../../context/DocumentIntelligenceContext';
import { Sparkles, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

export const AIResumeOptimizationStudio: React.FC = () => {
  const { documents, applyAISuggestion } = useDocumentIntelligence();
  const primaryDoc = documents[0];

  if (!primaryDoc) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <p className="text-xs text-slate-500">No generated resume variants found. Use the Generator Studio to create your first variant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper AI Score Overview */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Resume Review Studio: {primaryDoc.title}</span>
            </h3>
            <p className="text-xs text-slate-400">Version: {primaryDoc.version_name}</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
            Human-in-the-Loop Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">ATS Score</span>
            <span className="text-base font-extrabold text-emerald-400">{primaryDoc.ats_score}%</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Recruiter Score</span>
            <span className="text-base font-extrabold text-teal-400">{primaryDoc.recruiter_score}%</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Exec Readability</span>
            <span className="text-base font-extrabold text-blue-400">{primaryDoc.executive_readability}%</span>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop AI Optimization Suggestions */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>AI Suggested Improvements (Human Decision Required)</span>
        </h3>

        {(primaryDoc.ai_suggestions || []).length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All AI suggestions applied! ATS score maximized.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {(primaryDoc.ai_suggestions || []).map((suggestion, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-slate-800">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{suggestion}</span>
                </div>

                <Button
                  onClick={() => applyAISuggestion(primaryDoc.id, suggestion)}
                  className="px-3 h-8 text-[11px] font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shrink-0"
                >
                  Apply Improvement (+3% ATS)
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
