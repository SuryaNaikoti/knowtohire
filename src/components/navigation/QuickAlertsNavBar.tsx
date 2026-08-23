import React from 'react';
import { MapPin, Sparkles, Bell } from 'lucide-react';

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
    <div className={`w-full bg-white/80 backdrop-blur-md border-b border-kth-slate-200/60 py-2 px-4 sm:px-6 md:px-8 select-none ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Horizontal Category Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
          {CATEGORY_ITEMS.map((item) => {
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-all duration-150 shrink-0 ${
                  item.isHighlight
                    ? 'text-kth-primary-700 bg-kth-primary-50 font-bold hover:bg-kth-primary-100/80'
                    : item.isAlert
                    ? 'text-emerald-700 bg-emerald-50/70 font-semibold hover:bg-emerald-100/70'
                    : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-100 font-medium'
                }`}
              >
                {item.isHighlight && <Sparkles className="w-3 h-3 text-kth-primary-600 shrink-0" />}
                {item.isAlert && <Bell className="w-3 h-3 text-emerald-600 shrink-0" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* State/Region Quick Filter Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 shrink-0 pl-3 border-l border-kth-slate-200">
          <MapPin className="w-3 h-3 text-kth-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold text-kth-slate-500 mr-1">Locations:</span>
          {STATE_ITEMS.slice(0, 8).map((st) => (
            <button
              key={st.code}
              title={`Explore verified jobs in ${st.name}`}
              onClick={() => handleNav(`/jobs?location=${st.code}`)}
              className="text-kth-slate-500 hover:text-kth-primary-700 hover:bg-kth-primary-50 font-mono font-medium text-[11px] px-1.5 py-0.5 rounded transition-colors"
            >
              {st.code}
            </button>
          ))}
          <button
            onClick={() => handleNav('/jobs')}
            className="text-[11px] font-semibold text-kth-primary-600 hover:text-kth-primary-700 ml-0.5"
          >
            +More
          </button>
        </div>
      </div>
    </div>
  );
};
