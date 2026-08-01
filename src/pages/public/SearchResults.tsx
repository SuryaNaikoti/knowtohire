import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  recentSearchesService,
  savedSearchesService,
} from '../../lib/services/search';
import { applicationService } from '../../lib/services/applications/ApplicationService';
import { resumeService } from '../../lib/services/resume/ResumeService';
import { useSearch } from '../../hooks/useSearch';
import type { SortOption } from '../../lib/services/search/types';
import {
  Search,
  Briefcase,
  FileText,
  Bookmark,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Send,
} from 'lucide-react';

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuth();
  const userId = profile?.id || 'guest-candidate';
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const {
    query,
    setQuery,
    sort,
    setSort,
    results,
    loading,
  } = useSearch(initialQuery);

  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentQueries(recentSearchesService.getRecentSearches());
    const userApps = applicationService.getApplications({ candidateId: userId });
    setAppliedJobIds(userApps.map((a) => a.jobId));
  }, [query, userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    setSearchParams({ q });
  };

  const handleSaveSearch = () => {
    if (!query.trim()) return;
    savedSearchesService.saveSearch(userId, `Search for "${query}"`, {
      query,
      sort,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleApply = async (e: React.MouseEvent, jobId: string, jobTitle: string) => {
    e.stopPropagation();
    const resumes = resumeService.getResumes(userId);
    const activeResume = resumes.length > 0 ? resumes[0] : null;

    await applicationService.submitApplication(
      jobId,
      jobTitle,
      'emp-techcorp',
      userId,
      profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Alex Morgan',
      profile?.email || 'alex.morgan@example.com',
      activeResume?.id || 'default-resume-id',
      activeResume?.summary || 'Candidate Profile Resume'
    );

    setAppliedJobIds((prev) => [...prev, jobId]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Search header & Filter bar */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Global Discovery</h1>
            {query.trim() && (
              <button
                onClick={handleSaveSearch}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {isSaved ? 'Search Saved!' : 'Save Search Alert'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, articles, templates..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-xl text-sm transition-colors shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Recent Searches Chips */}
          {recentQueries.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-400 font-medium shrink-0">Recent:</span>
              {recentQueries.slice(0, 5).map((q) => (
                <button
                  key={q}
                  onClick={() => handleRecentClick(q)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Control Bar: Sorting */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-xs flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            Showing {results.length} results
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Body */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
              Executing discovery search...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Search className="w-12 h-12 mx-auto text-slate-200 mb-4" />
              <p className="font-semibold text-slate-600 mb-1">No matching results found</p>
              <p className="text-sm">Try modifying your query terms or clearing category filters.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              {results.map((item) => {
                const isApplied = appliedJobIds.includes(item.id);
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => navigate(item.url)}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl px-2 cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      {item.type === 'job' ? <Briefcase className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                        {item.subtitle && (
                          <span className="text-xs text-slate-400">{item.subtitle}</span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                        {item.title}
                      </h2>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {item.type === 'job' && (
                      <div className="self-center flex items-center gap-2">
                        {isApplied ? (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl">
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleApply(e, item.id, item.title)}
                            className="px-3.5 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1 hover:bg-emerald-700 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Quick Apply
                          </button>
                        )}
                      </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 self-center transition-opacity">
                      <ArrowRight className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

