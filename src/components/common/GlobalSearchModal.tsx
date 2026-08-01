import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import type { SearchEntityType } from '../../lib/services/search/types';
import { Search, X, Briefcase, FileText, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: SearchEntityType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Results' },
  { id: 'job', label: 'Jobs' },
  { id: 'blog', label: 'Articles' },
  { id: 'template', label: 'Templates' },
  { id: 'marketplace', label: 'Marketplace' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, setTargetTypes, results, loading } = useSearch('', 250);
  const [activeCategory, setActiveCategory] = React.useState<SearchEntityType | 'all'>('all');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCategorySelect = (cat: SearchEntityType | 'all') => {
    setActiveCategory(cat);
    setTargetTypes(cat === 'all' ? [] : [cat]);
  };

  const handleSelectResult = (url: string) => {
    navigate(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search jobs, articles, templates..."
            className="w-full text-base bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results Body */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
              Searching platform records...
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No matching records found for "{query}".
            </div>
          ) : !query.trim() ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-slate-600">Esc</kbd> to exit or type keywords to search across the entire platform.
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelectResult(item.url)}
                className="py-3 px-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                    {item.type === 'job' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-slate-400 font-medium">{item.subtitle}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{item.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
