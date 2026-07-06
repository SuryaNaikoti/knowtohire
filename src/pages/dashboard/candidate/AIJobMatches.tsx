import React, { useState, useEffect } from 'react';
import { jobMatchingService } from '../../../lib/services/jobMatchingService';
import type { JobMatch } from '../../../lib/services/jobMatchingService';
import { Sparkles, Briefcase, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIJobMatches: React.FC = () => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await jobMatchingService.getMatches();
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const getMatchColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (pct >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-swing" />
            AI Job Matches
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review semantically matched jobs based on your parsed skills profile.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
            Calculating matching indicators...
          </div>
        ) : (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
                <Briefcase className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                <p className="font-semibold text-slate-700 mb-1">No matches calculated yet</p>
                <p className="text-sm">Click the matching button on any Job detail page to generate analysis.</p>
              </div>
            ) : (
              matches.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${item.job_id}`)}
                >
                  {/* Percent circle */}
                  <div className={`w-14 h-14 rounded-full border flex items-center justify-center font-bold text-lg shrink-0 ${getMatchColor(item.match_percentage)}`}>
                    {item.match_percentage}%
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400">Match score</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Activity className="w-3 h-3" />
                        Semantic
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-800 truncate mb-1">
                      {item.job?.title ?? 'Job Title'}
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
                      {item.job?.company_name ?? 'Company'}
                    </p>

                    {item.gap_analysis && (
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {item.gap_analysis}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 self-center hidden md:block" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIJobMatches;
