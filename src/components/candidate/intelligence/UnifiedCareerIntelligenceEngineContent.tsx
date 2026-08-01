import React from 'react';
import { useUnifiedIntelligence, type UCIEViewMode } from '../../../context/UnifiedIntelligenceContext';
import { UnifiedIntelligenceDashboard } from './UnifiedIntelligenceDashboard';
import { PrescriptiveAICoachStudio } from './PrescriptiveAICoachStudio';
import { ExplainabilityGraphStudio } from './ExplainabilityGraphStudio';
import { Sparkles, LayoutDashboard, Zap, HelpCircle, AlertTriangle } from 'lucide-react';

export const UnifiedCareerIntelligenceEngineContent: React.FC = () => {
  const { viewMode, setViewMode, loading, serverError, report } = useUnifiedIntelligence();

  const tabs: { id: UCIEViewMode; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'UCIE Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'actions', label: 'AI Prescriptive Coach', icon: <Zap className="w-4 h-4" />, count: report?.prescriptiveActions.filter(a => a.status === 'Pending').length },
    { id: 'explainability', label: 'Explainability & Lineage', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-8 h-8 mx-auto border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Synthesizing Unified Career Intelligence Engine (UCIE)...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Unified Career Intelligence Engine (UCIE)</h2>
            <p className="text-xs text-slate-300">
              Platform Flagship Intelligence Orchestration Layer. Synthesizes Identity, Evidence, Competencies & Documents.
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 border border-slate-200/80 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`flex-1 min-w-[160px] px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              viewMode === tab.id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Workspace View */}
      {viewMode === 'dashboard' && <UnifiedIntelligenceDashboard />}
      {viewMode === 'actions' && <PrescriptiveAICoachStudio />}
      {viewMode === 'explainability' && <ExplainabilityGraphStudio />}
    </div>
  );
};
