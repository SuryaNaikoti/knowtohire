import React from 'react';
import { MapPin, BookOpen, Wrench, LogIn, Sparkles, Bell } from 'lucide-react';

export interface QuickAlertsNavBarProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

const CATEGORY_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'All India Jobs', path: '/jobs', isHighlight: true },
  { label: 'ESG & Sustainability', path: '/jobs?category=sustainability' },
  { label: 'Renewable Energy', path: '/jobs?category=renewables' },
  { label: 'Climate Tech & Carbon', path: '/jobs?category=carbon' },
  { label: 'Engineering Jobs', path: '/jobs?category=engineering' },
  { label: 'EHS & Compliance', path: '/jobs?category=ehs' },
  { label: 'Green Finance & CSR', path: '/jobs?category=finance' },
  { label: 'Job Alerts & Mobile', path: '/careers', isAlert: true },
];

const STATE_ITEMS = [
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'DL', name: 'Delhi NCR' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'HR', name: 'Haryana' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'OD', name: 'Odisha' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'WB', name: 'West Bengal' },
];

export const QuickAlertsNavBar: React.FC<QuickAlertsNavBarProps> = ({
  className = '',
  onNavigate,
}) => {
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className={`w-full bg-kth-slate-50/90 backdrop-blur-md border-b border-kth-slate-200/80 py-2.5 px-3 sm:px-6 md:px-8 shadow-xs select-none ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Row 1: Primary Category Navigation Tabs */}
        <div className="flex items-center justify-start lg:justify-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORY_ITEMS.map((item) => {
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150 shrink-0 shadow-xs border ${
                  item.isHighlight
                    ? 'bg-kth-primary-600 text-white border-kth-primary-700 hover:bg-kth-primary-700 shadow-sm font-bold'
                    : item.isAlert
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 font-semibold'
                    : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:bg-kth-primary-50/70 hover:text-kth-primary-700 hover:border-kth-primary-300'
                }`}
              >
                {item.isHighlight && <Sparkles className="w-3 h-3 text-cyan-200" />}
                {item.isAlert && <Bell className="w-3 h-3 text-emerald-600" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Indian State Code Filter Chips & Quick Platform Utilities */}
        <div className="flex items-center justify-start lg:justify-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider pl-1 pr-1.5">
            <MapPin className="w-3 h-3 text-kth-slate-400" />
            <span className="hidden sm:inline">Regions:</span>
          </div>

          {STATE_ITEMS.map((st) => (
            <button
              key={st.code}
              title={`Explore verified jobs in ${st.name}`}
              onClick={() => handleNav(`/jobs?location=${st.code}`)}
              className="bg-white hover:bg-kth-primary-50 hover:text-kth-primary-700 hover:border-kth-primary-300 text-kth-slate-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-xs transition-all duration-150 shrink-0 min-w-[28px] text-center border border-kth-slate-200 active:scale-95"
            >
              {st.code}
            </button>
          ))}

          <div className="h-4 w-px bg-kth-slate-200 shrink-0 mx-1" />

          {/* Quick Platform Shortcuts */}
          <button
            onClick={() => handleNav('/knowledge')}
            className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold text-[11px] px-2.5 py-0.5 rounded-md whitespace-nowrap shadow-xs transition-all duration-150 flex items-center gap-1 shrink-0"
          >
            <BookOpen className="w-3 h-3 text-cyan-600" />
            <span>EDUCATION</span>
          </button>

          <button
            onClick={() => handleNav('/templates')}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[11px] px-2.5 py-0.5 rounded-md whitespace-nowrap shadow-xs transition-all duration-150 flex items-center gap-1 shrink-0"
          >
            <Wrench className="w-3 h-3 text-indigo-600" />
            <span>Tools</span>
          </button>

          <button
            onClick={() => handleNav('/login')}
            className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-[11px] px-3 py-0.5 rounded-md whitespace-nowrap shadow-xs transition-all duration-150 flex items-center gap-1 shrink-0 border border-kth-primary-700 shadow-sm"
          >
            <LogIn className="w-3 h-3" />
            <span>Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
