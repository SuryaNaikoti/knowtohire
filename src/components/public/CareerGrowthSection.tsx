import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  BookOpen,
  FileText,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Building2,
  GraduationCap,
  Layers,
} from 'lucide-react';

type AudienceRole = 'candidates' | 'employers';

type CandidateFeatureId = 'jobs' | 'knowledge' | 'templates' | 'insights';
type EmployerFeatureId = 'requisition' | 'matching' | 'pipeline' | 'comparison';

export const CareerGrowthSection: React.FC = () => {
  const [activeAudience, setActiveAudience] = useState<AudienceRole>('candidates');
  const [selectedCandidateFeature, setSelectedCandidateFeature] = useState<CandidateFeatureId>('jobs');
  const [selectedEmployerFeature, setSelectedEmployerFeature] = useState<EmployerFeatureId>('pipeline');

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-gradient-to-b from-white via-kth-slate-50/50 to-white border-b border-kth-slate-200 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 -left-40 w-80 sm:w-96 h-80 sm:h-96 bg-kth-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kth-primary-50 border border-kth-primary-200/80 mb-3 sm:mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-kth-primary-600" />
            <span className="text-[11px] sm:text-xs font-bold text-kth-primary-700 uppercase tracking-wider">
              The KnowToHire Platform Suite
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-kth-slate-900 tracking-tight leading-tight text-balance">
            Everything You Need to Advance, Hire & Comply in One Platform
          </h2>

          <p className="text-xs sm:text-base text-kth-slate-600 mt-2 sm:mt-4 leading-relaxed font-normal text-pretty max-w-2xl mx-auto px-2">
            A unified ecosystem built specifically for India&apos;s sustainability, climate tech, environmental compliance, and enterprise consulting sectors.
          </p>

          {/* Interactive Audience Switcher Toggle */}
          <div className="mt-6 sm:mt-8 inline-flex flex-col sm:flex-row p-1 sm:p-1.5 bg-kth-slate-200/80 rounded-2xl shadow-inner border border-kth-slate-300/60 max-w-full">
            <button
              type="button"
              onClick={() => setActiveAudience('candidates')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeAudience === 'candidates'
                  ? 'bg-white text-kth-primary-700 shadow-md border border-kth-slate-200/80 scale-[1.01]'
                  : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-white/40'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-kth-primary-600 shrink-0" />
              <span>For Job Seekers & Candidates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAudience('employers')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeAudience === 'employers'
                  ? 'bg-white text-kth-primary-700 shadow-md border border-kth-slate-200/80 scale-[1.01]'
                  : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-white/40'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>For Employers & Recruiters</span>
            </button>
          </div>
        </div>

        {/* Feature Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Feature Selection Cards */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            {activeAudience === 'candidates' ? (
              <>
                {/* Feature 1: Jobs */}
                <div
                  onClick={() => setSelectedCandidateFeature('jobs')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedCandidateFeature === 'jobs'
                      ? 'bg-white border-kth-primary-500 shadow-lg ring-2 ring-kth-primary-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-kth-primary-50 text-kth-primary-600 border border-kth-primary-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          1. Verified Niche Job Marketplace
                        </h3>
                        <Badge variant="emerald" className="text-[10px] shrink-0">
                          All-India Coverage
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Discover ESG, carbon accounting, renewable energy, and environmental compliance roles with transparent INR salary benchmarks and state-by-state filters.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-kth-primary-600 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Semantic Match Scoring <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Transparent Compensation <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 2: Knowledge Hub */}
                <div
                  onClick={() => setSelectedCandidateFeature('knowledge')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedCandidateFeature === 'knowledge'
                      ? 'bg-white border-cyan-500 shadow-lg ring-2 ring-cyan-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          2. Domain Knowledge Hub & Study Guides
                        </h3>
                        <Badge variant="cyan" className="text-[10px] shrink-0">
                          Regulatory & ESG
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Access expert-authored e-books, SEBI BRSR Core guidebooks, ISO 14001 audit frameworks, and SPCB compliance materials to upskill for senior positions.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-cyan-700 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Free & Premium E-Books <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Research Papers <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 3: Templates */}
                <div
                  onClick={() => setSelectedCandidateFeature('templates')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedCandidateFeature === 'templates'
                      ? 'bg-white border-indigo-500 shadow-lg ring-2 ring-indigo-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          3. Pre-Vetted Legal & Resume Blueprints
                        </h3>
                        <Badge variant="indigo" className="text-[10px] shrink-0">
                          Enterprise-Ready
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Download ATS-optimized resume blueprints, EIA consultancy agreements, NDAs, and corporate compliance checklists formatted for Indian legal standards.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-indigo-600 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          ATS Format Resumes <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Instant DOCX/PDF <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 4: Salary & Skill Gap */}
                <div
                  onClick={() => setSelectedCandidateFeature('insights')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedCandidateFeature === 'insights'
                      ? 'bg-white border-amber-500 shadow-lg ring-2 ring-amber-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          4. Salary Benchmark & Career Pathways
                        </h3>
                        <Badge variant="amber" className="text-[10px] shrink-0">
                          High ROI
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Explore actual salary progressions across Bengaluru, Mumbai, Hyderabad, and Delhi NCR. Identify which certifications yield ₹3L - ₹6L salary jumps.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-amber-700 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          City-Wise INR Insights <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Skill ROI Modeling <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Employer Feature 1: Requisitions */}
                <div
                  onClick={() => setSelectedEmployerFeature('requisition')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedEmployerFeature === 'requisition'
                      ? 'bg-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          1. Targeted Requisition Builder
                        </h3>
                        <Badge variant="emerald" className="text-[10px] shrink-0">
                          Fast Publishing
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Create structured, compliance-ready job requisitions with custom screening questionnaires, required certifications, and transparent INR salary bands.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-emerald-600 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Multi-Location Hiring <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Custom Screening <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employer Feature 2: Pipeline */}
                <div
                  onClick={() => setSelectedEmployerFeature('pipeline')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedEmployerFeature === 'pipeline'
                      ? 'bg-white border-kth-primary-500 shadow-lg ring-2 ring-kth-primary-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-kth-primary-50 text-kth-primary-600 border border-kth-primary-100 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          2. Visual Kanban ATS Pipeline
                        </h3>
                        <Badge variant="indigo" className="text-[10px] shrink-0">
                          Full Workflow
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Manage applicants seamlessly through Applied, Screened, Technical Interview, and Offer stages with custom tags and bulk actions.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-kth-primary-600 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Stage Tracking <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Interview Scheduler <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employer Feature 3: Semantic Match */}
                <div
                  onClick={() => setSelectedEmployerFeature('matching')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedEmployerFeature === 'matching'
                      ? 'bg-white border-cyan-500 shadow-lg ring-2 ring-cyan-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          3. Intelligent Match Scoring
                        </h3>
                        <Badge variant="cyan" className="text-[10px] shrink-0">
                          AI-Powered
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Instantly rank candidates by relevancy to BRSR Core, Scope 1-3 GHG accounting, ISO 14001, and environmental auditing standards.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-cyan-700 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Skill Overlap Analysis <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Zero Noise Filtering <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employer Feature 4: Comparison */}
                <div
                  onClick={() => setSelectedEmployerFeature('comparison')}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedEmployerFeature === 'comparison'
                      ? 'bg-white border-indigo-500 shadow-lg ring-2 ring-indigo-500/20'
                      : 'bg-white/80 hover:bg-white border-kth-slate-200 hover:border-kth-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-bold text-kth-slate-900 leading-snug">
                          4. Side-by-Side Candidate Matrix
                        </h3>
                        <Badge variant="indigo" className="text-[10px] shrink-0">
                          Precision Hiring
                        </Badge>
                      </div>
                      <p className="text-xs text-kth-slate-600 leading-relaxed">
                        Compare shortlisted applicants across match percentages, years of experience, notice periods, and current vs expected CTC in one view.
                      </p>
                      <div className="mt-2.5 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-indigo-600 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Notice Period Metrics <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        </span>
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          Verified Credentials <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Live Dynamic Interactive Preview Showcase */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="bg-[#0b1120] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-kth-slate-800 shadow-2xl relative overflow-hidden">
              {/* Inner ambient glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-kth-primary-600/20 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

              {/* Showcase Top Control Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-kth-slate-800/80 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-kth-slate-400">
                    KnowToHire Live Engine Preview
                  </span>
                </div>
                <Badge variant="cyan" className="text-[10px] bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                  Interactive Preview
                </Badge>
              </div>

              {/* DYNAMIC CONTENT SWITCH BASED ON ACTIVE AUDIENCE & SELECTION */}
              <div className="relative z-10 space-y-6">
                {activeAudience === 'candidates' && selectedCandidateFeature === 'jobs' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                          Opportunity Matcher
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          Senior Sustainability Consultant
                        </h4>
                        <p className="text-xs text-kth-slate-300 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-kth-slate-400" /> EcoStrategy India • Hyderabad, TS (Hybrid)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                          96% Match
                        </span>
                        <div className="text-[11px] font-mono text-cyan-300 font-bold mt-1">
                          ₹24L - ₹32L INR
                        </div>
                      </div>
                    </div>

                    {/* Skill Match Breakdown */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-kth-slate-300">BRSR & SEBI Framework</span>
                        <span className="text-emerald-400 font-mono font-bold">98% Fit</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[98%]" />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-kth-slate-300">GHG Protocol Scope 1, 2, 3</span>
                        <span className="text-cyan-400 font-mono font-bold">94% Fit</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-kth-primary-400 rounded-full w-[94%]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ Verified Enterprise & 1-Click Application
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/jobs')}
                        className="font-bold text-xs"
                      >
                        Explore All 150+ Jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeAudience === 'candidates' && selectedCandidateFeature === 'knowledge' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                          Knowledge Resource Preview
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          SEBI BRSR Core & ESG Reporting Handbook
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          By KnowToHire Regulatory Research Group • PDF Edition (86 Pages)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                          4.9 ★ Rating
                        </span>
                        <div className="text-[11px] text-kth-slate-400 mt-1">1,420+ Downloads</div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5">
                      <div className="text-xs font-semibold text-kth-slate-200">Key Study Modules:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-cyan-200 border border-white/10">
                          Scope 1-3 Value Chain
                        </span>
                        <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-cyan-200 border border-white/10">
                          SEBI Assurance Rules
                        </span>
                        <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-cyan-200 border border-white/10">
                          SPCB Green Compliance
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ Download instant PDF & Study Sheets
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/knowledge')}
                        className="font-bold text-xs"
                      >
                        Browse Knowledge Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeAudience === 'candidates' && selectedCandidateFeature === 'templates' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          Document Blueprint Kit
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          ATS-Optimized Executive ESG Resume & NDA Pack
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          Vetted for Indian Enterprises & Consulting Agencies
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                          DOCX + PDF
                        </span>
                        <div className="text-[11px] text-emerald-400 font-mono font-bold mt-1">
                          Instant Access
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="text-xs font-semibold text-kth-slate-200 mb-2">Included Artifacts:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-kth-slate-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ATS Resume Template
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          Non-Disclosure Agreement
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          EIA Consulting Master Contract
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          BRSR Compliance Audit Sheet
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ Formatted for Indian Legal Standards
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/templates')}
                        className="font-bold text-xs"
                      >
                        Explore Templates <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeAudience === 'candidates' && selectedCandidateFeature === 'insights' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          Career & Salary Insights
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          ESG & Sustainability Salary Benchmark
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          Role: Senior Sustainability Consultant (5-8 Yrs Exp)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                          +28% YoY Growth
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-kth-slate-300">Standard Market CTC:</span>
                        <span className="font-mono text-white font-semibold">₹18,50,000 / yr</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-emerald-300 font-semibold">With BRSR + ISO 14001:</span>
                        <span className="font-mono text-emerald-400 font-bold">₹28,00,000 / yr</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                        💡 Estimated Salary Uplift: <strong>+₹5,50,000 to ₹9,50,000 / yr</strong> upon obtaining BRSR Assurance credentials.
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ City-wise benchmarks across India
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/careers')}
                        className="font-bold text-xs"
                      >
                        View Career Paths <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* EMPLOYER PREVIEWS */}
                {activeAudience === 'employers' && selectedEmployerFeature === 'pipeline' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                          ATS Pipeline Snapshot
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          Senior Carbon Accounting Lead
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          Requisition #KTH-8042 • 42 Total Applicants
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                        Live Pipeline
                      </span>
                    </div>

                    {/* Pipeline Stage Badges */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <div className="text-base font-bold font-mono text-white">42</div>
                        <div className="text-[10px] text-kth-slate-400 mt-0.5">Applied</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <div className="text-base font-bold font-mono text-cyan-300">18</div>
                        <div className="text-[10px] text-kth-slate-400 mt-0.5">Screened</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <div className="text-base font-bold font-mono text-amber-300">6</div>
                        <div className="text-[10px] text-kth-slate-400 mt-0.5">Interview</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <div className="text-base font-bold font-mono text-emerald-400">2</div>
                        <div className="text-[10px] text-kth-slate-400 mt-0.5">Offered</div>
                      </div>
                    </div>

                    {/* Top candidate card */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Ananya Sharma (96% Match)</div>
                        <div className="text-[11px] text-kth-slate-400">7 Yrs Exp • Scope 1-3, SBTi, BRSR • 15 Days Notice</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px] border border-cyan-500/30">
                        Interviewing
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ Kanban tracking & automated notifications
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/pricing')}
                        className="font-bold text-xs"
                      >
                        Explore Employer ATS <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeAudience === 'employers' && selectedEmployerFeature === 'requisition' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                          Requisition Engine
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          Instant Job Post & Multi-State Distribution
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          Reach over 45,000+ verified Indian sustainability specialists
                        </p>
                      </div>
                      <Badge variant="emerald" className="text-[10px]">
                        Instant Live
                      </Badge>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-kth-slate-300">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span>Target Location:</span>
                        <span className="font-semibold text-white">Bengaluru, Hyderabad, Remote</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span>Compensation Range:</span>
                        <span className="font-mono font-bold text-emerald-400">₹20,00,000 - ₹30,00,000 INR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mandatory Questionnaires:</span>
                        <span className="font-semibold text-cyan-300">BRSR Assurance, ISO 14001</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ 40% reduction in time-to-hire
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/pricing')}
                        className="font-bold text-xs"
                      >
                        + Post a Requisition <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeAudience === 'employers' && selectedEmployerFeature === 'matching' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                          Semantic Screening
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          Automated Candidate Match Matrix
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          Evaluates candidate resumes against domain-specific requirements
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                        98% Accuracy
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Candidate #1: Rahul Verma</span>
                        <span className="text-emerald-400 font-mono font-bold">96% Semantic Fit</span>
                      </div>
                      <div className="text-[11px] text-kth-slate-400">
                        Matches: BRSR, GHG Scope 1-3, ISO 14001, EIA, CPCB Norms
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-white font-medium">Candidate #2: Priya Sundaram</span>
                        <span className="text-cyan-300 font-mono font-bold">91% Semantic Fit</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ No unqualified spam applications
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/pricing')}
                        className="font-bold text-xs"
                      >
                        Explore ATS Plans <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeAudience === 'employers' && selectedEmployerFeature === 'comparison' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          Candidate Matrix
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          Side-by-Side Candidate Evaluation
                        </h4>
                        <p className="text-xs text-kth-slate-300 mt-1">
                          Compare notice periods, salary asks, and verified credentials
                        </p>
                      </div>
                      <Badge variant="indigo" className="text-[10px]">
                        Multi-Candidate
                      </Badge>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-white/10 font-semibold text-kth-slate-300">
                        <span>Metric</span>
                        <span>Candidate A</span>
                        <span>Candidate B</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <span className="text-kth-slate-400">Experience</span>
                        <span className="text-white font-medium">6.5 Yrs (ESG Lead)</span>
                        <span className="text-white font-medium">8.0 Yrs (Senior Consultant)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <span className="text-kth-slate-400">Notice Period</span>
                        <span className="text-emerald-400 font-bold">15 Days</span>
                        <span className="text-amber-300">60 Days</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <span className="text-kth-slate-400">Expected CTC</span>
                        <span className="font-mono text-white">₹25,00,000</span>
                        <span className="font-mono text-white">₹28,50,000</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-kth-slate-400">
                        ✓ Make confident hiring decisions
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate('/pricing')}
                        className="font-bold text-xs"
                      >
                        Hire Top Talent <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Bottom Value Metrics Bar */}
        <div className="mt-16 bg-white border border-kth-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-kth-slate-200">
            <div className="px-4">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-kth-slate-900">
                100%
              </div>
              <div className="text-xs font-semibold text-kth-slate-700 mt-1">
                Verified Indian Opportunities
              </div>
              <div className="text-[11px] text-kth-slate-500 mt-0.5">
                Direct enterprise requisitions
              </div>
            </div>

            <div className="px-4 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-kth-primary-600">
                50+
              </div>
              <div className="text-xs font-semibold text-kth-slate-700 mt-1">
                Guides & Blueprints
              </div>
              <div className="text-[11px] text-kth-slate-500 mt-0.5">
                E-books & legal templates
              </div>
            </div>

            <div className="px-4 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-cyan-600">
                20+
              </div>
              <div className="text-xs font-semibold text-kth-slate-700 mt-1">
                Indian States Filtered
              </div>
              <div className="text-[11px] text-kth-slate-500 mt-0.5">
                State-by-state job discovery
              </div>
            </div>

            <div className="px-4 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600">
                40%
              </div>
              <div className="text-xs font-semibold text-kth-slate-700 mt-1">
                Faster Time-to-Hire
              </div>
              <div className="text-[11px] text-kth-slate-500 mt-0.5">
                ATS pipeline & semantic match
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export { CareerGrowthSection as PlatformFeaturesSection };
