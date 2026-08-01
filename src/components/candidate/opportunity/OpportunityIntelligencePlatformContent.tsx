import React from 'react';
import { useOpportunityWorkspace, type OpportunityViewTab } from '../../../context/OpportunityWorkspaceContext';
import { OpportunityExplorerStudio } from './OpportunityExplorerStudio';
import { ProviderDirectoryStudio } from './ProviderDirectoryStudio';
import { OpportunityFitEngineStudio } from './OpportunityFitEngineStudio';
import { MarketSkillDemandStudio } from './MarketSkillDemandStudio';
import { Compass, Building2, Target, TrendingUp, AlertTriangle } from 'lucide-react';

export const OpportunityIntelligencePlatformContent: React.FC = () => {
  const { activeTab, setActiveTab, loading, serverError, opportunities, providers } = useOpportunityWorkspace();

  const tabs: { id: OpportunityViewTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'explorer', label: 'Ecosystem Explorer', icon: <Compass className="w-4 h-4" />, count: opportunities.length },
    { id: 'providers', label: 'Provider Graph', icon: <Building2 className="w-4 h-4" />, count: providers.length },
    { id: 'fit-engine', label: '13-Factor Fit Engine', icon: <Target className="w-4 h-4" /> },
    { id: 'skill-demand', label: 'Market Skill Demand', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-8 h-8 mx-auto border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading Opportunity Intelligence Platform...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Opportunity Intelligence Platform</h2>
            <p className="text-xs text-slate-300">
              Multi-category ecosystem matching candidates across Jobs, Fellowships, Grants, Research & Hackathons.
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
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[160px] px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === tab.id
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
      {activeTab === 'explorer' && <OpportunityExplorerStudio />}
      {activeTab === 'providers' && <ProviderDirectoryStudio />}
      {activeTab === 'fit-engine' && <OpportunityFitEngineStudio />}
      {activeTab === 'skill-demand' && <MarketSkillDemandStudio />}
    </div>
  );
};
