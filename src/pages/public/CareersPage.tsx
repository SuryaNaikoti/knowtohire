import React from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  Leaf,
  ShieldCheck,
  FileText,
  Award,
  Search,
  TrendingUp,
  ArrowRight,
  Scale,
} from 'lucide-react';

export interface CategoryInfo {
  name: string;
  query: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ALL_CAREER_CATEGORIES: CategoryInfo[] = [
  {
    name: 'General Careers',
    query: 'General',
    description: 'Corporate strategy, operations management, HR, technology, and organizational leadership positions.',
    badge: 'Operations',
    icon: Briefcase,
  },
  {
    name: 'Environmental Careers',
    query: 'Environmental',
    description: 'EIA coordinators, air/water quality specialists, pollution control engineers, and SPCB liaison officers.',
    badge: 'Core Vertical',
    icon: Leaf,
  },
  {
    name: 'ESG Careers',
    query: 'ESG',
    description: 'SEBI BRSR Core assurance analysts, CSR reporting strategists, and corporate ESG compliance officers.',
    badge: 'High Demand',
    icon: ShieldCheck,
  },
  {
    name: 'Sustainability Careers',
    query: 'Sustainability',
    description: 'Corporate net-zero consultants, circular economy advisors, and supply chain decarbonization experts.',
    badge: 'Net Zero',
    icon: TrendingUp,
  },
  {
    name: 'Patent Careers',
    query: 'Patent',
    description: 'CleanTech patent attorneys, prior art search analysts, patent drafting agents, and IPO agents.',
    badge: 'Patent Law',
    icon: FileText,
  },
  {
    name: 'IPR Careers',
    query: 'IPR',
    description: 'Intellectual property managers, technology commercialization officers, and licensing specialists.',
    badge: 'IP Strategy',
    icon: Scale,
  },
  {
    name: 'Research Careers',
    query: 'Research',
    description: 'Environmental scientists, clean energy researchers, policy analysts, and R&D specialists.',
    badge: 'R&D',
    icon: Search,
  },
  {
    name: 'Consulting Careers',
    query: 'Consulting',
    description: 'Management consultants, regulatory compliance advisors, technical auditors, and advisory leads.',
    badge: 'Advisory',
    icon: Award,
  },
];

export const CareersPage: React.FC = () => {
  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Career Exploration"
          badgeVariant="indigo"
          title="Contracted Career Categories"
          subtitle="Explore verified opportunities, requisitions, and targeted learning resources across the 8 contracted domains."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ALL_CAREER_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Card key={idx} variant="interactive" className="flex flex-col justify-between h-full p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center font-bold text-xl shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="indigo">{cat.badge}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">{cat.name}</h3>
                  <p className="text-xs text-kth-slate-600 mb-4 leading-relaxed">{cat.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-kth-slate-100">
                  <a
                    href={`/jobs?q=${encodeURIComponent(cat.query)}`}
                    className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1 no-underline"
                  >
                    Explore Openings <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/knowledge?category=${encodeURIComponent(cat.query)}`}
                    className="text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-800 no-underline"
                  >
                    Study Guides
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
