import React from 'react';
import { useUnifiedIntelligence } from '../../../context/UnifiedIntelligenceContext';
import { TrendingUp } from 'lucide-react';

export const UnifiedIntelligenceDashboard: React.FC = () => {
  const { report } = useUnifiedIntelligence();

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Upper Overall Score Card */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Unified Career Score</span>
            <h2 className="text-3xl font-black text-white">{report.overallCareerScore} <span className="text-lg font-normal text-slate-400">/ 100</span></h2>
            <p className="text-xs text-slate-400">Synthesized from Identity, Career Evidence, Competencies & Documents</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> +7% This Month
            </span>
          </div>
        </div>

        {/* 4 Core Module Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Identity</span>
            <span className="text-base font-extrabold text-white">{report.identityScore}%</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Evidence</span>
            <span className="text-base font-extrabold text-emerald-400">{report.evidenceScore}%</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Competency</span>
            <span className="text-base font-extrabold text-teal-400">{report.competencyScore}%</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Documents</span>
            <span className="text-base font-extrabold text-blue-400">{report.documentScore}%</span>
          </div>
        </div>
      </div>

      {/* 6 Intelligence Domain Cards Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          6 Intelligence Domains Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.domainScores.map((domain, idx) => (
            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{domain.domainName} Intelligence</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded-full">
                  {domain.score}%
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{domain.insight}</p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500">Status: <strong className="text-slate-800">{domain.status}</strong></span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending Up
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Growth Analytics Table */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Historical Intelligence Growth Trends
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2">Time Period</th>
                <th className="py-2">Overall Score</th>
                <th className="py-2">ATS Score</th>
                <th className="py-2">Recruiter Appeal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.historicalScoreTrends.map((row, idx) => (
                <tr key={idx} className="text-slate-700">
                  <td className="py-2.5 font-bold text-slate-900">{row.month}</td>
                  <td className="py-2.5 font-bold text-emerald-600">{row.overallScore}%</td>
                  <td className="py-2.5">{row.atsScore}%</td>
                  <td className="py-2.5">{row.recruiterScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
