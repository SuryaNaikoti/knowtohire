import React, { useState } from 'react';
import { useHiringWorkspace } from '../../context/HiringWorkspaceContext';
import { Search, Filter, Star } from 'lucide-react';
import { Button } from '../ui/Button';

export const CandidateScoutStudio: React.FC = () => {
  const { shortlistedCandidateIds, toggleShortlistCandidate } = useHiringWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [perspectiveMode, setPerspectiveMode] = useState<'Employer View' | 'ATS View' | 'Public Profile' | 'Anonymous Profile'>('Employer View');

  const candidates = [
    {
      id: 'cand_1',
      name: 'Alex Rivera',
      headline: 'Senior Full-Stack ESG Engineer • React & Environmental Systems',
      location: 'San Francisco, CA (Remote Ready)',
      overall_score: 91,
      ats_score: 88,
      recruiter_appeal: 94,
      skills: ['React', 'TypeScript', 'ISO 14001', 'Node.js', 'PostgreSQL'],
      experience_summary: '4.5 Yrs Exp • Ex-Lead Full Stack Engineer at Acme Systems',
      verified_proofs: 4,
    },
    {
      id: 'cand_2',
      name: 'Elena Rostova',
      headline: 'Climate AI & Data Systems Architect',
      location: 'Stanford, CA (Hybrid)',
      overall_score: 94,
      ats_score: 92,
      recruiter_appeal: 96,
      skills: ['PyTorch', 'Python', 'SQL', 'Climate AI', 'Data Pipelines'],
      experience_summary: '6.0 Yrs Exp • Senior Researcher at Stanford Sustainability',
      verified_proofs: 6,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Search & Filter Bar */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recruiter Candidate Talent Scout & Knowledge Graph Search</h3>
            <p className="text-xs text-slate-500">Query candidate evidence graphs, competencies, and UCIE intelligence scores directly.</p>
          </div>

          {/* Switchable Recruiter Perspective Modes */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {[
              { mode: 'Employer View', desc: 'Full recruiter perspective with complete verified credentials' },
              { mode: 'ATS View', desc: 'Parsed keyword extraction view for ATS compliance check' },
              { mode: 'Public Profile', desc: 'Public candidate profile perspective' },
              { mode: 'Anonymous Profile', desc: 'Privacy-first anonymous candidate perspective' },
            ].map(({ mode, desc }) => (
              <button
                key={mode}
                type="button"
                title={desc}
                onClick={() => setPerspectiveMode(mode as any)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                  perspectiveMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by skill (e.g., React, ISO 14001), role title, or UCIE score..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>
          <Button className="px-4 h-10 text-xs font-bold bg-slate-900 text-white rounded-xl flex items-center gap-1.5 cursor-pointer">
            <Filter className="w-3.5 h-3.5" /> Filter Graph
          </Button>
        </div>
      </div>

      {/* Candidate Scout Cards */}
      <div className="space-y-4">
        {candidates.map((cand) => {
          const isShortlisted = shortlistedCandidateIds.includes(cand.id);

          return (
            <div key={cand.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {cand.name.split(' ').map((n) => n[0]).join('')}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{perspectiveMode === 'Anonymous Profile' ? `Candidate #${cand.id}` : cand.name}</span>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200">
                        {cand.overall_score}% Unified Career Score
                      </span>
                    </h4>

                    <p className="text-xs text-slate-600 font-medium">{cand.headline}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cand.location} • {cand.experience_summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleShortlistCandidate(cand.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                      isShortlisted
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                    <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Candidate'}</span>
                  </button>
                </div>
              </div>

              {/* Skills Graph Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                {cand.skills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-lg">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
