import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { navigateTo } from '@/utils/navigation';

export interface QuickAlertsNavBarProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

const CATEGORY_ITEMS = [
  { label: 'All Jobs', path: '/jobs', isHighlight: true },
  { label: 'General', path: '/jobs?category=General' },
  { label: 'Environmental', path: '/jobs?category=Environmental' },
  { label: 'ESG', path: '/jobs?category=ESG' },
  { label: 'Sustainability', path: '/jobs?category=Sustainability' },
  { label: 'Patent', path: '/jobs?category=Patent' },
  { label: 'IPR', path: '/jobs?category=IPR' },
  { label: 'Research', path: '/jobs?category=Research' },
  { label: 'Consulting', path: '/jobs?category=Consulting' },
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
      navigateTo(path);
    }
  };

  return (
    <div className={`w-full bg-white/80 backdrop-blur-md border-b border-kth-slate-200/60 py-1.5 sm:py-2 px-3 sm:px-6 md:px-8 select-none ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-1.5 xl:gap-0">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Horizontal Category Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none touch-scroll flex-1 min-w-0">
            {CATEGORY_ITEMS.map((item) => {
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-all duration-150 shrink-0 ${
                    item.isHighlight
                      ? 'text-kth-primary-700 bg-kth-primary-50 font-bold hover:bg-kth-primary-100/80'
                      : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-100 font-medium'
                  }`}
                >
                  {item.isHighlight && <Sparkles className="w-3 h-3 text-kth-primary-600 shrink-0" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* State/Region Quick Filter Indicator (Desktop XL+) */}
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

        {/* State/Region Quick Filter Sub-strip (Mobile & Tablet < XL) */}
        <div className="flex xl:hidden items-center gap-1 overflow-x-auto pb-0.5 pt-1 border-t border-kth-slate-100/80 scrollbar-none touch-scroll text-[11px]">
          <div className="flex items-center gap-1 text-kth-slate-400 shrink-0 pr-1">
            <MapPin className="w-3 h-3 text-kth-primary-600 shrink-0" />
            <span className="font-semibold text-kth-slate-600 text-[10px] uppercase tracking-wider">States:</span>
          </div>
          {STATE_ITEMS.map((st) => (
            <button
              key={st.code}
              title={`Explore verified jobs in ${st.name}`}
              onClick={() => handleNav(`/jobs?location=${st.code}`)}
              className="text-kth-slate-600 hover:text-kth-primary-700 active:bg-kth-primary-100 bg-kth-slate-50/80 hover:bg-kth-primary-50 border border-kth-slate-200/60 font-mono font-medium text-[10px] px-1.5 py-0.5 rounded shrink-0 transition-colors"
            >
              {st.code}
            </button>
          ))}
          <button
            onClick={() => handleNav('/jobs')}
            className="text-[10px] font-semibold text-kth-primary-600 hover:text-kth-primary-700 px-1 shrink-0 whitespace-nowrap"
          >
            All Locations &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
