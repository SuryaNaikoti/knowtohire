import React from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from './SectionHeader';
import { ALL_CAREER_CATEGORIES } from '@/pages/public/CareersPage';
import { ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 md:py-16 bg-white border-b border-kth-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Career Exploration"
          badgeVariant="indigo"
          title="Browse Opportunities by Category"
          subtitle="Discover curated roles across specialized sustainability, environmental, IPR, and consulting domains."
          action={
            <a href="/careers" className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1">
              View All Categories <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {ALL_CAREER_CATEGORIES.slice(0, 8).map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <a
                key={idx}
                href={`/jobs?q=${encodeURIComponent(cat.query)}`}
                className="no-underline group"
              >
                <Card variant="interactive" className="h-full flex items-center justify-between p-3 sm:p-5">
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-kth-slate-50 border border-kth-slate-200 flex items-center justify-center group-hover:bg-kth-primary-50 transition-colors shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-kth-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors truncate">
                        {cat.name}
                      </h4>
                      <span className="text-[11px] sm:text-xs text-kth-slate-500 font-medium truncate block">{cat.badge}</span>
                    </div>
                  </div>
                  <ArrowRight className="hidden sm:block w-4 h-4 text-kth-slate-300 group-hover:text-kth-primary-600 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
