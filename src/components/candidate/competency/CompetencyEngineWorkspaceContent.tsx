import React from 'react';
import { useCompetencyEngine, type CompetencyViewMode } from '../../../context/CompetencyEngineContext';
import { CompetencySkillsGraphEditor } from './CompetencySkillsGraphEditor';
import { PortfolioEvidenceRepositoryEditor } from './PortfolioEvidenceRepositoryEditor';
import { Tag, FolderGit2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CompetencyEngineWorkspaceContent: React.FC = () => {
  const { viewMode, setViewMode, loading, serverError, skills, portfolioItems, aiSuggestedSkills } = useCompetencyEngine();

  const tabs: { id: CompetencyViewMode; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'Competency Graph', icon: <Tag className="w-4 h-4" />, count: skills.length },
    { id: 'portfolio', label: 'Evidence Repository', icon: <FolderGit2 className="w-4 h-4" />, count: portfolioItems.length },
    { id: 'ai-suggestions', label: 'AI Inferred Skills', icon: <Sparkles className="w-4 h-4" />, count: aiSuggestedSkills.length },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-8 h-8 mx-auto border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading Professional Competency Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Professional Competency Engine</h2>
            <p className="text-xs text-slate-300">
              Build your evidence-backed skills graph. Every competency links directly to experiences, projects, and certifications.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Graph Verified: {skills.length} Competencies</span>
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
            className={`flex-1 min-w-[150px] px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              viewMode === tab.id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-extrabold rounded-full text-slate-700">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Editor Module */}
      {viewMode === 'portfolio' ? (
        <PortfolioEvidenceRepositoryEditor />
      ) : (
        <CompetencySkillsGraphEditor />
      )}
    </div>
  );
};
