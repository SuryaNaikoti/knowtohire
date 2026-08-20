import React from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from './SectionHeader';
import { ALL_CAREER_CATEGORIES } from '@/pages/public/CareersPage';
import { ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-16 bg-white border-b border-kth-slate-200">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ALL_CAREER_CATEGORIES.slice(0, 8).map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <a
                key={idx}
                href={`/jobs?q=${encodeURIComponent(cat.query)}`}
                className="no-underline group"
              >
                <Card variant="interactive" className="h-full flex items-center justify-between p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-kth-slate-50 border border-kth-slate-200 flex items-center justify-center group-hover:bg-kth-primary-50 transition-colors">
                      <Icon className="w-5 h-5 text-kth-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors">
                        {cat.name}
                      </h4>
                      <span className="text-xs text-kth-slate-500 font-medium">{cat.badge}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-kth-slate-300 group-hover:text-kth-primary-600 group-hover:translate-x-1 transition-all" />
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
