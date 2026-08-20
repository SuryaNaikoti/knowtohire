import React from 'react';
import { SectionHeader } from './SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Target, Zap, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

export const CareerGrowthSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#090e1a] text-white border-b border-kth-slate-800/80 relative overflow-hidden">
      {/* Subtle Glow Accents */}
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-kth-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-kth-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badgeText="Proprietary Intelligence"
          badgeVariant="cyan"
          title="Career Intelligence That Gives You The Edge"
          subtitle="Real-time skill gap modeling, verified domain credentials, and automated ATS match optimization designed for high-growth sectors."
          align="center"
          className="text-white mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Intelligence Features */}
          <div className="lg:col-span-6 space-y-5">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">96% Skill Match Scoring</h3>
                    <Badge variant="cyan" className="text-[10px] py-0 px-2">AI Verified</Badge>
                  </div>
                  <p className="text-xs text-kth-slate-300 leading-relaxed">
                    Compare your actual resume keywords against live employer job descriptions with semantic relevancy modeling before applying.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">Targeted Skill Gap Discovery</h3>
                    <Badge variant="emerald" className="text-[10px] py-0 px-2">Actionable</Badge>
                  </div>
                  <p className="text-xs text-kth-slate-300 leading-relaxed">
                    Discover exact missing certifications (e.g. GRI Standards, ISO 14001, BRSR Core) that increase salary potential in Indian enterprises.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">Lawyer-Vetted Documents & E-Books</h3>
                    <Badge variant="indigo" className="text-[10px] py-0 px-2">Gov & Enterprise Ready</Badge>
                  </div>
                  <p className="text-xs text-kth-slate-300 leading-relaxed">
                    Access standardized NDAs, Master Service Agreements, and ATS-optimized resume blueprints verified for Indian compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Proprietary Live Career Intelligence Dashboard Mockup */}
          <div className="lg:col-span-6 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-kth-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live Candidate Intelligence Matrix</h4>
                  <span className="text-[11px] text-kth-slate-400">Target Role: Senior ESG Consultant</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                96% Match
              </span>
            </div>

            {/* Metric Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-kth-slate-200">BRSR & Sustainability Reporting</span>
                  <span className="text-emerald-400 font-mono">98% Fit</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-kth-slate-200">Carbon Accounting & GHG Protocol</span>
                  <span className="text-cyan-400 font-mono">92% Fit</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-kth-primary-400 rounded-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-kth-slate-200">ISO 14001 Environmental Audit</span>
                  <span className="text-amber-400 font-mono">Recommended Add-on</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            {/* Action Callout */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Estimated Salary Growth
                </div>
                <div className="text-[11px] text-kth-slate-400 mt-0.5">
                  + ₹3,50,000 / annum with BRSR Certification
                </div>
              </div>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => window.location.href = '/knowledge'}
                className="shrink-0 text-xs font-bold"
              >
                Access Study Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

