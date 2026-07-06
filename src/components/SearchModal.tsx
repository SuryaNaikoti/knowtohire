import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../lib/services/searchService';
import type { SearchResultItem } from '../lib/services/searchService';
import { Search, X, Briefcase, FileText, Download, Layout, Sparkles, Command } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'job' | 'blog' | 'resource' | 'template' | 'lead_magnet'>('all');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchService.globalSearch(val);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(r => r.type === filter);

  const getIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'job': return Briefcase;
      case 'blog': return FileText;
      case 'resource': return Download;
      case 'template': return Layout;
      case 'lead_magnet': return Sparkles;
    }
  };

  const getTypeLabel = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'job': return 'Job';
      case 'blog': return 'Blog';
      case 'resource': return 'Resource';
      case 'template': return 'Template';
      case 'lead_magnet': return 'Lead Magnet';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search templates, jobs, guides..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-slate-800 placeholder-slate-400 text-base"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-400">
            <Command className="w-3 h-3" />
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-50 overflow-x-auto">
          {(['all', 'job', 'blog', 'resource', 'template', 'lead_magnet'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                filter === opt
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt === 'all' ? 'All Results' : opt.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[350px] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
              Searching database...
            </div>
          )}

          {!loading && query.trim().length >= 2 && filteredResults.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No results found for "<span className="font-semibold">{query}</span>"
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Type at least 2 characters to begin searching.
            </div>
          )}

          {!loading && filteredResults.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <div
                key={item.id}
                onClick={() => {
                  navigate(item.link);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
