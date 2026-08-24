import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Alert } from '@/components/ui/Alert';
import {
  careerInsightsService,
  CareerIntelligenceResult,
} from '@/services/careerInsightsService';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Loader2,
  Briefcase,
  Layers,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const CandidateCareerInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<CareerIntelligenceResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await careerInsightsService.getCareerInsights();
    if (error) {
      setErrorMessage(error.message);
      setInsights(null);
    } else if (data) {
      setInsights(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('kth_profile_updated', handleDataChanged);
    window.addEventListener('kth_resume_uploaded', handleDataChanged);
    window.addEventListener('kth_applications_changed', handleDataChanged);
    return () => {
      window.removeEventListener('kth_profile_updated', handleDataChanged);
      window.removeEventListener('kth_resume_uploaded', handleDataChanged);
      window.removeEventListener('kth_applications_changed', handleDataChanged);
    };
  }, [loadData]);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <CandidateShell title="Career Insights & Explainable Matching" currentPath="/candidate/career-insights">
      <div className="space-y-6 max-w-5xl mx-auto text-left font-sans">
        {/* Header Hero Message */}
        <div className="bg-gradient-to-r from-kth-slate-900 via-kth-slate-900 to-kth-primary-950 p-6 md:p-8 rounded-2xl text-white shadow-md">
          <Badge variant="cyan" className="mb-2.5 gap-1 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-cyan-300" /> Deterministic Career Intelligence
          </Badge>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-1.5 leading-tight">
            {insights?.currentTitle ? `Explainable Market Progression for ${insights.currentTitle}` : 'Career Insights & Market Alignment'}
          </h1>
          <p className="text-xs md:text-sm text-kth-slate-300 max-w-2xl leading-relaxed">
            {insights?.verifiedSkillsCount
              ? `Insights calculated from your verified skill profile (${insights.verifiedSkillsCount} active skills) matched dynamically against verified job openings and market demand.`
              : 'Real-time role matching, skill gap discovery, and learning recommendations driven by your profile data.'}
          </p>
        </div>

        {/* Load Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Career Insights">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadData}>
                Retry Analysis
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading Spinner Skeleton */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">
              Analyzing your verified skill matrix & experience against live job openings...
            </p>
          </div>
        )}

        {/* Insufficient Profile Data State */}
        {!isLoading && !errorMessage && insights && !insights.hasSufficientProfileData && (
          <EmptyState
            title="Complete Profile to Unlock Insights"
            description={insights.emptyStateReason || "Upload your resume or add your verified skills and experience to compute explainable career matching."}
            actionText="Edit Candidate Profile"
            onAction={() => handleNavigate('/candidate/profile/edit')}
            icon={<Layers className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Insufficient Market Data State */}
        {!isLoading && !errorMessage && insights && insights.hasSufficientProfileData && !insights.hasSufficientMarketData && (
          <EmptyState
            title="Market Catalog Expanding"
            description={insights.emptyStateReason || "Not enough relevant openings currently published in the catalog to generate market-wide skill gap benchmarks."}
            actionText="Explore Available Jobs"
            onAction={() => handleNavigate('/candidate/jobs')}
            icon={<Briefcase className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Main Insights Content (Only when sufficient data is present) */}
        {!isLoading && !errorMessage && insights && insights.hasSufficientProfileData && insights.hasSufficientMarketData && (
          <>
            {/* Projected Career Trajectory & Match Card */}
            <Card className="p-6 md:p-8 bg-white border-kth-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-kth-primary-600" /> Progression Alignment
                </h2>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanations(!showExplanations)}
                  className="text-xs text-kth-slate-600 gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-kth-primary-600" />
                  {showExplanations ? 'Hide Score Breakdown' : 'Why this score?'}
                </Button>
              </div>

              {/* Progression Pipeline: Current Profile -> Target Role -> Market Availability */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Current Profile */}
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-kth-slate-400 uppercase tracking-wider block">
                    CURRENT PROFILE
                  </span>
                  <h3 className="font-bold text-sm text-kth-slate-900 line-clamp-1">{insights.currentTitle}</h3>
                  <span className="text-xs font-mono text-kth-slate-500 block">
                    {insights.verifiedSkillsCount} Verified Skills
                  </span>
                </div>

                {/* Target Role with Match Percentage */}
                <div className="bg-kth-primary-50 p-4 rounded-xl border border-kth-primary-200 text-center space-y-1 relative ring-1 ring-kth-primary-500/20">
                  <span className="text-[10px] font-bold text-kth-primary-600 uppercase tracking-wider block">
                    TARGET ROLE ({insights.matchScore}% ALIGNED)
                  </span>
                  <h3 className="font-bold text-sm text-kth-primary-900 line-clamp-1">{insights.targetRoleTitle}</h3>
                  <span className="text-xs font-mono text-kth-primary-700 font-semibold block">
                    {insights.targetSalaryRange}
                  </span>
                </div>

                {/* Market Availability */}
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-kth-slate-400 uppercase tracking-wider block">
                    MARKET AVAILABILITY
                  </span>
                  <h3 className="font-bold text-sm text-kth-slate-900">
                    {insights.marketOpeningsCount} Verified Opening{insights.marketOpeningsCount !== 1 ? 's' : ''}
                  </h3>
                  <span className="text-xs font-mono text-kth-slate-500 block">
                    Across Relevant Opportunities
                  </span>
                </div>
              </div>

              {/* Match Score Progress Bar */}
              <div className="space-y-2">
                <Progress
                  value={insights.matchScore}
                  label="Target Role Match Score"
                  showValue
                  color="primary"
                />
              </div>

              {/* Explainable Factor Breakdown (Collapsible / Transparent) */}
              {showExplanations && insights.explanations.length > 0 && (
                <div className="mt-6 pt-5 border-t border-kth-slate-100 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-kth-slate-700">
                    Explainable Weighted Score Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.explanations.map((exp, idx) => (
                      <div
                        key={idx}
                        className="bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200 space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-kth-slate-900">{exp.factor} ({exp.weightPct}% weight)</span>
                          <span className={exp.isPositive ? 'text-emerald-700 font-mono' : 'text-amber-700 font-mono'}>
                            {exp.scorePct}%
                          </span>
                        </div>
                        <p className="text-kth-slate-600 text-[11px] leading-relaxed">{exp.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Skill Strengths & Identified Growth Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Verified Skill Strengths */}
              <Card className="p-6 bg-white border-kth-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-kth-slate-900 mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" /> Verified Skill Strengths
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    Competencies in your profile with direct evidence matching current market requisitions:
                  </p>
                  <div className="space-y-2">
                    {insights.matchedSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-900"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{sk}</span>
                        </span>
                        <Badge variant="emerald" className="shrink-0 text-[10px]">Matched</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-kth-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/candidate/profile/edit')}
                    className="text-xs text-kth-slate-600"
                  >
                    Edit Verified Skills <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>

              {/* Identified Growth Skills */}
              <Card className="p-6 bg-white border-kth-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-kth-slate-900 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Identified Growth Skills
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    High-demand competencies that will materially elevate your target role match score:
                  </p>

                  <div className="space-y-3">
                    {insights.growthSkillRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <strong className="font-bold text-amber-950 block">{rec.skill}</strong>
                            <p className="text-[11px] text-amber-800 leading-snug">{rec.reason}</p>
                          </div>
                          <Badge variant="amber" className="shrink-0 text-[10px]">Recommended</Badge>
                        </div>

                        {/* Real Knowledge Hub Study Guide Resource Link */}
                        <div className="flex justify-between items-center text-[11px] text-kth-slate-600 pt-1.5 border-t border-amber-200/60">
                          <span className="text-kth-slate-500">Recommended Resource:</span>
                          {rec.recommendedResource?.isAvailable ? (
                            <a
                              href={rec.recommendedResource.url}
                              className="font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1 hover:underline"
                            >
                              <BookOpen className="w-3 h-3" /> Study Guide
                            </a>
                          ) : (
                            <span className="text-kth-slate-400 italic">Resource coming soon</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-kth-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/candidate/jobs')}
                    className="text-xs text-kth-slate-600"
                  >
                    View Matching Openings <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </CandidateShell>
  );
};
