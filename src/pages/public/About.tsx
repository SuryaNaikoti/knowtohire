import React from 'react';
import { Card } from '../../components/ui/Card';
import { Award, Eye, Shield, Users, Target, Compass } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-about" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-about)" />
    </svg>
  </div>
);

export const About: React.FC = () => {
  const values = [
    {
      title: 'Data Integrity',
      desc: 'Our intelligence profiles are built on verified salary reports and validated credentials.',
      icon: Shield,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Access Transparency',
      desc: 'Clear pathways for candidate evaluation and transparent terms for scouting teams.',
      icon: Eye,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Inclusivity First',
      desc: 'Designed strictly to meet WCAG 2.2 AA specifications, ensuring accessibility for all users.',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
  ];

  const milestones = [
    { quarter: 'Q1 2026', title: 'Platform Foundation', status: 'Completed', desc: 'Core UI layout, Clerk auth integration, and database schema preparation.' },
    { quarter: 'Q2 2026', title: 'Knowledge Hub & Jobs', status: 'In Progress', desc: 'Launch of candidate portfolios, resume indexing, and ATS vacancy search.' },
    { quarter: 'Q3 2026', title: 'Marketplace & Billing', status: 'Planned', desc: 'Premium templates, custom intelligence reporting, and billing integration.' },
  ];

  return (
    <div className="flex flex-col w-full bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-slate-50/50 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <DotGrid className="text-slate-400 opacity-25" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
            <Compass className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
            Know More. <span className="kth-gradient-text">Hire Better.</span> Grow Faster.
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            KnowToHire bridges the information gap between ambitious professionals looking for growth indicators and organizations looking for verified, skilled contributors.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            <Target className="w-3.5 h-3.5" />
            <span>Operational DNA</span>
          </div>
          <h2 className="text-3xl font-black font-heading text-slate-900 tracking-tight">
            Core Operating Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title} hoverEffect className="bg-white border border-slate-200 p-8 rounded-[24px] shadow-sm flex flex-col justify-between group text-left">
                <div className="space-y-6">
                  <div className="relative w-12 h-12">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-slate-800" />
                    </div>
                    <div className={`absolute -inset-1 rounded-xl bg-gradient-to-br ${v.color} opacity-0 group-hover:opacity-15 blur-sm transition-opacity`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">{v.title}</h3>
                    <p className="text-sm text-slate-500 font-normal leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-24 bg-slate-50/50 border-t border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </div>
            <h2 className="text-3xl font-black font-heading text-slate-900 tracking-tight">
              Development Timeline
            </h2>
          </div>

          <div className="space-y-6 max-w-4xl">
            {milestones.map((m) => (
              <div
                key={m.quarter}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-premium hover:-translate-y-0.5 transition-all text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
                      {m.quarter}
                    </span>
                    <span className="text-slate-300">|</span>
                    <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed pt-2">{m.desc}</p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border shrink-0 text-center ${
                  m.status === 'Completed'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : m.status === 'In Progress'
                    ? 'bg-blue-50 border-blue-100 text-blue-800 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Footnote */}
      <section className="py-16 max-w-[1440px] mx-auto px-6 md:px-12">
        <div id="accessibility" className="bg-emerald-50 border border-emerald-150 rounded-2xl p-8 text-emerald-900 space-y-3 text-left">
          <h3 className="text-base font-black flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> WCAG 2.2 AA Compliance Statement
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed font-medium">
            KnowToHire is built from the ground up to support accessible keyboard navigation, correct document heading structures, high color-contrast ratios, and clear ARIA labeling. We are committed to making career intelligence available to every professional.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
