import React from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { CheckCircle, AlertCircle, Clock, Sparkles, Star } from 'lucide-react';

export const RealtimeCompletionBadge: React.FC = () => {
  const { completion, qualityMetrics } = useIdentityWorkspace();

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      {/* Upper Metrics Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-sm border border-emerald-200 shrink-0">
            {completion.overall_readiness_score}%
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Profile Readiness Score</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
                Quality: {qualityMetrics.qualityScore}%
              </span>
            </h4>
            <p className="text-xs text-slate-500">Completing your identity unlocks recruiter matching & ATS scoring.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Est. time: {completion.missing_sections.length * 1} min</span>
        </div>
      </div>

      {/* Multi-Dimensional Scores Strip */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Completion</span>
          <span className="text-xs font-extrabold text-slate-800">{qualityMetrics.completionScore}%</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Quality</span>
          <span className="text-xs font-extrabold text-emerald-600">{qualityMetrics.qualityScore}%</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">ATS Score</span>
          <span className="text-xs font-extrabold text-teal-600">{qualityMetrics.atsReadinessScore}%</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Appeal</span>
          <span className="text-xs font-extrabold text-blue-600">{qualityMetrics.recruiterAppealScore}%</span>
        </div>
      </div>

      {/* Headline Quality Feedback Banner */}
      {qualityMetrics.headlineSuggestion && (
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Headline Quality Rating: {qualityMetrics.headlineRating}</span>
            <div className="flex items-center gap-0.5 text-amber-500 ml-auto">
              <Star className="w-3 h-3 fill-amber-400" />
              <Star className="w-3 h-3 fill-amber-400" />
              <Star className="w-3 h-3 fill-amber-400" />
            </div>
          </div>
          <p className="text-amber-800 text-[11px]">{qualityMetrics.headlineSuggestion}</p>
        </div>
      )}

      {/* Actionable Missing Section Chips */}
      {completion.missing_sections.length > 0 ? (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Actionable Next Steps:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {completion.missing_sections.map((item: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-amber-900 text-xs font-medium flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Identity workspace is 100% complete! Recruiter & ATS visibility maximized.</span>
        </div>
      )}
    </div>
  );
};


