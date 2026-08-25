import React, { useState, useEffect } from 'react';
import { Search, Briefcase, BookOpen, FileText, Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from './Badge';
import { jobService } from '@/services/jobService';
import { knowledgeService } from '@/services/knowledgeService';
import { templateService } from '@/services/templateService';
import { blogService } from '@/services/blogService';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  label: string;
  category: string;
  link: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeVariant: 'slate' | 'cyan' | 'indigo' | 'emerald';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live Multi-Domain Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([
        { label: 'Browse Environmental & ESG Jobs', category: 'Jobs', link: '/jobs', icon: Briefcase, badgeVariant: 'slate' },
        { label: 'Knowledge Hub E-Books & Handbooks', category: 'Knowledge', link: '/knowledge', icon: BookOpen, badgeVariant: 'cyan' },
        { label: 'ATS-Optimised Resume Templates', category: 'Templates', link: '/templates', icon: FileText, badgeVariant: 'indigo' },
        { label: 'Editorial Policy & Market Insights', category: 'Blog', link: '/blog', icon: Newspaper, badgeVariant: 'emerald' },
      ]);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const performSearch = async () => {
      const term = searchTerm.trim();
      const [jobsRes, knowRes, tmplRes, blogRes] = await Promise.all([
        jobService.getPublishedJobs({ keyword: term, pageSize: 3 }),
        knowledgeService.getResources({ search: term, limit: 3 }),
        templateService.getTemplates({ search: term, limit: 3 }),
        blogService.getBlogPosts({ search: term, limit: 3 }),
      ]);

      if (!isMounted) return;

      const combined: SearchResultItem[] = [];

      (jobsRes.data?.data || []).forEach((j) => {
        combined.push({
          label: `${j.title} — ${j.company?.name || 'Company'}`,
          category: 'Jobs',
          link: `/jobs/${j.id}`,
          icon: Briefcase,
          badgeVariant: 'slate',
        });
      });

      (knowRes.data || []).forEach((k) => {
        combined.push({
          label: k.title,
          category: 'Knowledge',
          link: `/knowledge/${k.slug || k.id}`,
          icon: BookOpen,
          badgeVariant: 'cyan',
        });
      });

      (tmplRes.data || []).forEach((t) => {
        combined.push({
          label: t.title,
          category: 'Templates',
          link: `/templates/${t.slug || t.id}`,
          icon: FileText,
          badgeVariant: 'indigo',
        });
      });

      (blogRes.data || []).forEach((b) => {
        combined.push({
          label: b.title,
          category: 'Blog',
          link: `/blog/${b.slug || b.id}`,
          icon: Newspaper,
          badgeVariant: 'emerald',
        });
      });

      setResults(combined);
      setIsSearching(false);
    };

    const debounce = setTimeout(performSearch, 200);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (link: string) => {
    onClose();
    window.history.pushState({}, '', link);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 p-4 bg-kth-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-white border border-kth-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-kth-slate-200 gap-3">
          <Search className="w-5 h-5 text-kth-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search KnowToHire across Jobs, E-Books, Templates, Articles..."
            className="w-full bg-transparent text-sm font-sans text-kth-slate-900 placeholder:text-kth-slate-400 outline-none"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-kth-primary-600 animate-spin shrink-0" />}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-kth-slate-100 border border-kth-slate-200 text-kth-slate-500 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-kth-slate-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-kth-slate-400 uppercase tracking-wider">
            {searchTerm ? `Search Results (${results.length})` : 'Quick Navigation Shortcuts'}
          </div>

          {results.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-xs text-kth-slate-500">
              No matching results found for "{searchTerm}".
            </div>
          ) : (
            results.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(item.link)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-kth-primary-50 hover:text-kth-primary-700 cursor-pointer transition-colors duration-150 text-xs font-medium text-kth-slate-800 group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Icon className="w-4 h-4 text-kth-slate-400 group-hover:text-kth-primary-600 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.badgeVariant}>{item.category}</Badge>
                    <ArrowRight className="w-4 h-4 text-kth-slate-300 group-hover:text-kth-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
