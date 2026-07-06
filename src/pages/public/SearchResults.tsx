import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchService } from '../../lib/services/searchService';
import type { SearchResultItem } from '../../lib/services/searchService';
import { Search, Briefcase, FileText, Download, Layout, Sparkles, ArrowRight } from 'lucide-react';

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadResults = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await searchService.globalSearch(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      loadResults(q);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const getIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'job': return Briefcase;
      case 'blog': return FileText;
      case 'resource': return Download;
      case 'template': return Layout;
      case 'lead_magnet': return Sparkles;
    }
  };

  const getIconBg = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'job': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'blog': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'resource': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'template': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'lead_magnet': return 'bg-pink-50 text-pink-600 border-pink-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Search header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Search Results</h1>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates, jobs, blog articles..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-emerald-400 outline-none rounded-xl text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
              Fetching results...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Search className="w-12 h-12 mx-auto text-slate-200 mb-4" />
              <p className="font-semibold text-slate-600 mb-1">No matches found</p>
              <p className="text-sm">Try broadening your search query parameters.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              {results.map((item) => {
                const Icon = getIcon(item.type);
                const bgClass = getIconBg(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.link)}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl px-2 cursor-pointer transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bgClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {item.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                        {item.title}
                      </h2>
                      <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                    </div>
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
