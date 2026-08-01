import React from 'react';
import { useUnifiedIntelligence } from '../../../context/UnifiedIntelligenceContext';
import { CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';

export const PrescriptiveAICoachStudio: React.FC = () => {
  const { report, acceptActionItem, dismissActionItem } = useUnifiedIntelligence();

  if (!report) return null;

  const pendingActions = report.prescriptiveActions.filter((a) => a.status === 'Pending');
  const acceptedActions = report.prescriptiveActions.filter((a) => a.status === 'Accepted');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl text-white space-y-2 shadow-md">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <h3 className="text-sm font-bold text-white">Prescriptive AI Career Coach</h3>
        </div>
        <p className="text-xs text-slate-300">
          Prioritized high-impact recommendations to maximize your overall career intelligence score. Every action is explainable & evidence-backed.
        </p>
      </div>

      {/* Pending High Impact Actions */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Highest Impact Pending Actions ({pendingActions.length})
        </h4>

        {pendingActions.length === 0 ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-800 text-xs font-bold space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p>All recommended career optimizations have been executed!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded-full">
                        +{action.impactScoreBoost} {action.targetDomain} Boost
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Confidence: {action.confidenceScore}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{action.title}</h4>
                    <p className="text-xs text-slate-600">{action.rationale}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => acceptActionItem(action.id)}
                      className="px-3 h-8 text-[11px] font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Execute Action
                    </Button>
                    <button
                      type="button"
                      onClick={() => dismissActionItem(action.id)}
                      className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Evidence Support: <strong className="text-slate-700">{action.evidenceSupport}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Actions History */}
      {acceptedActions.length > 0 && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Completed Optimizations ({acceptedActions.length})
          </h4>

          <div className="space-y-2">
            {acceptedActions.map((action) => (
              <div key={action.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{action.title}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700">+{action.impactScoreBoost} Score Boost Applied</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
