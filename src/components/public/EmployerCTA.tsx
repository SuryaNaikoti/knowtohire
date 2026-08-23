import React from 'react';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const EmployerCTA: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#0b1120] to-[#0f172a] text-white border-b border-kth-slate-800/80 relative overflow-hidden font-sans">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-kth-primary-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Enterprise Hiring & ATS Pipeline</span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight text-balance">
              Build Your Next Team With Precision Talent Discovery
            </h2>
            
            <p className="text-kth-slate-300 text-xs sm:text-base leading-relaxed font-normal text-pretty">
              Access verified sustainability consultants, carbon accounting leads, and compliance specialists across India. Streamline candidate screening with intelligent semantic match scores and full ATS stage tracking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Semantic skill match scoring</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Visual Kanban applicant workflow</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Side-by-side candidate comparison</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Transparent INR salary benchmarking</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-bold px-6 text-xs sm:text-sm h-11 sm:h-10 shadow-sm"
                onClick={() => window.location.href = '/pricing'}
              >
                + Post a Job Opportunity
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 text-xs sm:text-sm h-11 sm:h-10 font-semibold"
                onClick={() => window.location.href = '/pricing'}
              >
                Explore ATS Plans <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Column: Premium ATS Product Visualization */}
          <div className="lg:col-span-6 bg-white/[0.05] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-kth-primary-600/30 border border-kth-primary-400/30 text-kth-primary-300 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">KnowToHire ATS Workspace</h4>
                  <p className="text-[10px] text-kth-slate-400 truncate">Requisition: Lead ESG Consultant (Bengaluru)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                38 Applicants
              </span>
            </div>

            {/* Pipeline Stage Tracker */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                <span className="text-[10px] text-kth-slate-400 block font-medium">New</span>
                <span className="text-xs font-bold text-white font-mono">14</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                <span className="text-[10px] text-kth-slate-400 block font-medium">Screened</span>
                <span className="text-xs font-bold text-cyan-300 font-mono">11</span>
              </div>
              <div className="bg-kth-primary-600/20 border border-kth-primary-400/30 rounded-lg p-2 ring-1 ring-kth-primary-400/40">
                <span className="text-[10px] text-kth-primary-200 block font-bold">Interview</span>
                <span className="text-xs font-bold text-white font-mono">9</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                <span className="text-[10px] text-kth-slate-400 block font-medium">Offer</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">4</span>
              </div>
            </div>

            {/* Top Shortlisted Candidate Cards */}
            <div className="space-y-2.5">
              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3 rounded-xl border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-kth-primary-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    AK
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">Ananya Kapoor</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded shrink-0">Verified</span>
                    </div>
                    <span className="text-[10px] text-kth-slate-300 block truncate">7 Yrs Exp • SEBI BRSR Lead • 15d Notice</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    96% Match
                  </span>
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3 rounded-xl border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    RS
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">Rahul Sharma</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded shrink-0">Verified</span>
                    </div>
                    <span className="text-[10px] text-kth-slate-300 block truncate">5 Yrs Exp • Scope 1-3 GHG Audit • Immediate</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    91% Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

