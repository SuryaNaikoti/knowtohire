import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, FileText, Brain, Award, BookOpen, Settings, X, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

interface GlobalCommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCommandSearch: React.FC<GlobalCommandSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const searchItems = [
    { title: 'Senior Frontend Engineer (Google)', category: 'Jobs', route: ROUTES.DASHBOARD.CANDIDATE.JOBS, icon: Briefcase },
    { title: 'Lead Full Stack Architect (Tech Solutions)', category: 'Jobs', route: ROUTES.DASHBOARD.CANDIDATE.JOBS, icon: Briefcase },
    { title: 'Resume Analyzer & ATS Diagnostic', category: 'Tools', route: '/dashboard/candidate/resume-analyzer', icon: FileText },
    { title: 'AI Career Coach Assistant', category: 'AI', route: '/dashboard/candidate/assistant', icon: Brain },
    { title: 'Interview Preparation Kit', category: 'Tools', route: '/dashboard/candidate/interview-prep', icon: BookOpen },
    { title: 'AWS Cloud Solutions Architect Certification', category: 'Certifications', route: ROUTES.DASHBOARD.CANDIDATE.CERTIFICATIONS, icon: Award },
    { title: 'React & TypeScript Skill Graph', category: 'Skills', route: ROUTES.DASHBOARD.CANDIDATE.SKILLS, icon: Settings },
    { title: 'Candidate Profile & Portfolio', category: 'Pages', route: ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO, icon: FileText },
    { title: 'Account Billing & Subscriptions', category: 'Settings', route: ROUTES.DASHBOARD.CANDIDATE.BILLING, icon: Settings }
  ];

  const filteredItems = query.trim() === ''
    ? searchItems
    : searchItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent listener
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-solid border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-solid border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, skills, tools, AI directives (Ctrl + K)..."
            className="w-full text-xs font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            aria-label="Close command search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No matching commands or resources found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(item.route);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600">{item.title}</h4>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-solid border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[9px]">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[9px]">↓</kbd></span>
          <span>Close with <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[9px]">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
