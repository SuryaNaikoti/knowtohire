import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const EmployerCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0b1120] to-[#0f172a] text-white border-b border-kth-slate-800/80 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kth-primary-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="cyan" className="text-xs px-3 py-1">Enterprise Hiring & ATS</Badge>
            
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight text-balance">
              Build Your Next Team With Precision Talent Discovery
            </h2>
            
            <p className="text-kth-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal text-pretty">
              Access verified sustainability consultants, patent analysts, and ESG specialists across India. Streamline candidate screening with intelligent semantic match scores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Verified skill alignment & credentials</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Full ATS pipeline & Kanban candidate tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">Direct INR salary benchmarking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-kth-slate-200 font-medium">40% lower average time-to-hire</span>
              </div>
            </div>

            <div className="flex gap-3.5 pt-4 flex-wrap">
              <Button
                variant="primary"
                size="md"
                className="font-bold px-6"
                onClick={() => window.location.href = '/pricing'}
              >
                + Post a Job Opportunity
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                onClick={() => window.location.href = '/pricing'}
              >
                Explore ATS Plans <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/[0.06] border border-white/10 rounded-2xl p-6 sm:p-7 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-kth-primary-600/30 text-kth-primary-300 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ATS Applicant Snapshot</h4>
                <p className="text-[11px] text-kth-slate-400">Live Active Requisitions</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-3.5 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                <span className="text-kth-slate-200 font-medium">Senior ESG Compliance Consultant</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">42 Applicants</span>
              </div>
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-3.5 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                <span className="text-kth-slate-200 font-medium">Carbon Accounting Lead</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">18 Applicants</span>
              </div>
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-3.5 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                <span className="text-kth-slate-200 font-medium">Renewable Energy Project Manager</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">29 Applicants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

