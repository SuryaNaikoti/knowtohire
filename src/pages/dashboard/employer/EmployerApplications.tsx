import React, { useState, useEffect } from 'react';
import { applicationService } from '../../../lib/services/applications/ApplicationService';
import { atsWorkflowService } from '../../../lib/services/applications/ATSWorkflowService';
import type { JobApplication, ApplicationStage } from '../../../lib/services/applications/types';
import { CandidateTimeline } from '../../../components/candidate/CandidateTimeline';
import { Briefcase, Calendar, CheckCircle2, Star, MapPin, DollarSign, UserCheck, Layers } from 'lucide-react';

export const EmployerApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const employerId = 'emp-techcorp';

  useEffect(() => {
    setApplications(applicationService.getApplications({ employerId }));
  }, []);

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    await atsWorkflowService.updateStage(appId, newStage);
    setApplications(applicationService.getApplications({ employerId }));
  };

  const stages: ApplicationStage[] = ['New', 'Reviewing', 'Interview', 'Offered', 'Rejected'];

  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = applications.filter((a) => a.stage === stage);
    return acc;
  }, {} as Record<ApplicationStage, JobApplication[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Applicant Management Pipeline</h1>
          <p className="text-xs text-slate-500">Track candidate applications, update hiring stages, and trigger automated notifications.</p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Live Applicant Management Active
        </div>
      </div>

      {/* Toggle View Mode & Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'kanban' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> List View
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-600">No applications ingested yet</p>
          <p className="text-xs">Submit a job application via Global Discovery to test candidate triage cards in this ATS pipeline.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ATS Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((stg) => (
            <div key={stg} className="bg-slate-100/70 border border-slate-200/60 rounded-2xl p-3 flex flex-col gap-3 min-w-[240px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700">{stg}</span>
                <span className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                  {grouped[stg]?.length || 0}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {grouped[stg]?.map((app) => (
                  <div key={app.id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{app.candidateName}</h4>
                        <p className="text-[10px] text-slate-400">{app.jobTitle}</p>
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {app.rating || 4}.0
                      </div>
                    </div>

                    {/* Candidate Triage Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-1.5 rounded-lg text-center font-bold">
                        Match: {app.matchScore}%
                      </div>
                      <div className="bg-violet-50 text-violet-800 border border-violet-100 p-1.5 rounded-lg text-center font-bold">
                        Resume: {app.resumeScore}%
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {app.candidateLocation || 'San Francisco, CA'}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400 shrink-0" /> {app.candidateSalary || '$145,000 / yr'}
                      </div>
                    </div>

                    <CandidateTimeline timeline={app.timeline} />

                    <div className="pt-2 border-t border-slate-100">
                      <select
                        value={app.stage}
                        onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                        className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-700 focus:outline-none"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            Move to {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-xs">
          {applications.map((app) => (
            <div key={app.id} className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{app.candidateName}</span>
                  <span className="text-xs text-slate-400">({app.candidateEmail})</span>
                </div>
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {app.jobTitle}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Applied {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={app.stage}
                  onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  {stages.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;
