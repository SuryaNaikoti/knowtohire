import React from 'react';
import { useCareerSuccess, type CareerSuccessViewTab } from '../../../context/CareerSuccessContext';
import { InterviewSimulationStudio } from './InterviewSimulationStudio';
import { OutcomeLearningRoadmapStudio } from './OutcomeLearningRoadmapStudio';
import { CareerProgressionSimulatorStudio } from './CareerProgressionSimulatorStudio';
import { MessageSquare, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

export const CareerSuccessIntelligenceContent: React.FC = () => {
  const { activeTab, setActiveTab, loading, serverError } = useCareerSuccess();

  const tabs: { id: CareerSuccessViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'interview-studio', label: 'AI Interview Practice', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'learning-roadmap', label: 'Outcome Learning Roadmap', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'simulator', label: 'Progression Simulator', icon: <Zap className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-8 h-8 mx-auto border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading Career Success Intelligence Suite...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Career Success Intelligence Suite</h2>
            <p className="text-xs text-slate-300">
              AI Interview Practice, Outcome-Linked Learning Roadmaps, and "What If?" Progression Simulation.
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
          </button>
        ))}
      </div>

      {/* Active Studio View */}
      {activeTab === 'interview-studio' && <InterviewSimulationStudio />}
      {activeTab === 'learning-roadmap' && <OutcomeLearningRoadmapStudio />}
      {activeTab === 'simulator' && <CareerProgressionSimulatorStudio />}
    </div>
  );
};
