import React from 'react';
import { useCareerEvidence, type ActiveEvidenceTab } from '../../../context/CareerEvidenceContext';
import { ExperienceTimelineEditor } from './ExperienceTimelineEditor';
import { EducationProgressionEditor } from './EducationProgressionEditor';
import { CertificationsAccreditationEditor } from './CertificationsAccreditationEditor';
import { InteractiveCareerTimelinePreview } from './InteractiveCareerTimelinePreview';
import { Briefcase, GraduationCap, Award, TrendingUp, AlertTriangle } from 'lucide-react';

export const CareerEvidenceWorkspaceContent: React.FC = () => {
  const { activeTab, setActiveTab, loading, serverError, experiences, educationList, certifications } = useCareerEvidence();

  const tabs: { id: ActiveEvidenceTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'experience', label: 'Work Experience', icon: <Briefcase className="w-4 h-4" />, count: experiences.length },
    { id: 'education', label: 'Academic Progression', icon: <GraduationCap className="w-4 h-4" />, count: educationList.length },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: certifications.length },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-8 h-8 mx-auto border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading Career Evidence Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Career Evidence & Timeline Engine</h2>
            <p className="text-xs text-slate-300">
              Build your verified career progression story. Linked skills & achievements feed AI matching & ATS readiness.
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

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Sub-module Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 border border-slate-200/80 rounded-2xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === tab.id
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

          {/* Active Sub-module Editor */}
          {activeTab === 'experience' && <ExperienceTimelineEditor />}
          {activeTab === 'education' && <EducationProgressionEditor />}
          {activeTab === 'certifications' && <CertificationsAccreditationEditor />}
        </div>

        {/* Centerpiece Trajectory & Visual Timeline */}
        <div className="lg:col-span-1">
          <InteractiveCareerTimelinePreview />
        </div>
      </div>
    </div>
  );
};
