import React from 'react';
import { SectionHeader } from './SectionHeader';
import { ALL_CAREER_CATEGORIES } from '@/pages/public/CareersPage';
import { ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 md:py-16 bg-white border-b border-kth-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Career Domains"
          badgeVariant="indigo"
          title="Browse Opportunities by Category"
          subtitle="Explore specialized roles across sustainability, carbon accounting, ESG compliance, and clean technology."
          action={
            <a href="/careers" className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1">
              View All Categories <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {ALL_CAREER_CATEGORIES.slice(0, 8).map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <a
                key={idx}
                href={`/jobs?q=${encodeURIComponent(cat.query)}`}
                className="no-underline group"
              >
                <div className="h-full bg-kth-slate-50/70 hover:bg-white border border-kth-slate-200/90 hover:border-kth-primary-300 rounded-xl p-3.5 sm:p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-kth-slate-200 group-hover:border-kth-primary-200 group-hover:bg-kth-primary-50 flex items-center justify-center transition-colors shrink-0 shadow-xs">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-kth-primary-600" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-kth-slate-500 bg-white px-2 py-0.5 rounded-full border border-kth-slate-200/80 group-hover:border-kth-primary-200 group-hover:text-kth-primary-700 transition-colors shrink-0">
                      {cat.badge}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors truncate">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-kth-slate-500 line-clamp-1 mt-0.5">
                      Explore active openings
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
