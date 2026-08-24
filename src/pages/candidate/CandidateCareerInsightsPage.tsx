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
    <CandidateShell title="Career Insights" currentPath="/candidate/career-insights">
      <div className="space-y-6 max-w-5xl mx-auto text-left font-sans">
        {/* Professional Hero Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" className="text-xs font-semibold py-0.5 px-2.5">
              Career Intelligence
            </Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
            Career Insights
          </h1>
          <p className="text-xs sm:text-sm text-kth-slate-600 mt-1 max-w-2xl leading-relaxed">
            Understand how your profile matches current opportunities and identify the skills that can improve your career fit.
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">
              Comparing your profile with active market openings...
            </p>
          </div>
        )}

        {/* Insufficient Profile Data State */}
        {!isLoading && !errorMessage && insights && !insights.hasSufficientProfileData && (
          <EmptyState
            title="Complete Profile to Unlock Insights"
            description={insights.emptyStateReason || "Upload your resume or add your verified skills and experience to compute role matching."}
            actionText="Edit Profile"
            onAction={() => handleNavigate('/candidate/profile/edit')}
            icon={<Layers className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Insufficient Market Data State */}
        {!isLoading && !errorMessage && insights && insights.hasSufficientProfileData && !insights.hasSufficientMarketData && (
          <EmptyState
            title="No Matching Openings Found"
            description={insights.emptyStateReason || "Not enough relevant openings currently published in the catalog to generate market-wide skill gap benchmarks."}
            actionText="Explore Available Jobs"
            onAction={() => handleNavigate('/candidate/jobs')}
            icon={<Briefcase className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Main Insights Dashboard */}
        {!isLoading && !errorMessage && insights && insights.hasSufficientProfileData && insights.hasSufficientMarketData && (
          <>
            {/* Progression Alignment Card */}
            <Card className="p-6 md:p-8 bg-white border-kth-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-kth-primary-600" /> Progression Alignment
                </h2>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanations(!showExplanations)}
                  className="text-xs text-kth-slate-600 gap-1.5 hover:text-kth-primary-600"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-kth-primary-600" />
                  {showExplanations ? 'Hide Score Breakdown' : 'Why this score?'}
                </Button>
              </div>

              {/* Three-Column Progression: Current Profile -> Target Role -> Market */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Current Profile */}
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-left space-y-1.5">
                  <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider block">
                    CURRENT PROFILE
                  </span>
                  <h3 className="font-bold text-sm text-kth-slate-900 leading-snug" title={insights.currentTitle}>
                    {insights.currentTitle}
                  </h3>
                  <span className="text-xs font-mono text-kth-slate-600 block">
                    {insights.verifiedSkillsCount} Verified Skills
                  </span>
                </div>

                {/* Target Role */}
                <div className="bg-kth-primary-50/70 p-4 rounded-xl border border-kth-primary-200 text-left space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-kth-primary-700 uppercase tracking-wider block">
                      TARGET ROLE
                    </span>
                    <Badge variant="indigo" className="text-[10px] font-bold py-0.5">
                      {insights.matchScore}% Match
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-kth-primary-950 leading-snug" title={insights.targetRoleTitle}>
                    {insights.targetRoleTitle}
                  </h3>
                  <span className="text-xs font-mono text-kth-primary-800 font-semibold block">
                    {insights.targetSalaryRange}
                  </span>
                </div>

                {/* Market Availability */}
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-left space-y-1.5">
                  <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider block">
                    MARKET
                  </span>
                  <h3 className="font-bold text-sm text-kth-slate-900">
                    {insights.marketOpeningsCount} Relevant Opening{insights.marketOpeningsCount !== 1 ? 's' : ''}
                  </h3>
                  <span className="text-xs text-kth-slate-600 block">
                    {insights.marketOpeningsCount > 0 ? 'Across Active Requisitions' : 'No strongly aligned openings currently available'}
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

              {/* Explainable Factor Breakdown (Collapsible) */}
              {showExplanations && insights.explanations.length > 0 && (
                <div className="mt-6 pt-5 border-t border-kth-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-kth-slate-700">
                    Why this score?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.explanations.map((exp, idx) => (
                      <div
                        key={idx}
                        className="bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200 space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-kth-slate-900">{exp.factor}</span>
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

            {/* Strengths & Growth Skills Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Verified Skill Strengths */}
              <Card className="p-6 bg-white border-kth-slate-200 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" /> Verified Skill Strengths
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    Skills from your profile that match current opportunities.
                  </p>
                  <div className="space-y-2">
                    {insights.matchedSkills.length > 0 ? (
                      insights.matchedSkills.map((sk, idx) => (
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
                      ))
                    ) : (
                      <p className="text-xs text-kth-slate-500 italic p-3 bg-kth-slate-50 rounded-lg">
                        Add technical skills to your profile to view verified strengths.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-kth-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/candidate/profile/edit')}
                    className="text-xs text-kth-slate-600 hover:text-kth-primary-600"
                  >
                    Edit Verified Skills <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>

              {/* Skills to Strengthen (Growth Skills) */}
              <Card className="p-6 bg-white border-kth-slate-200 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Skills to Strengthen
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    Skills that could improve your fit for relevant opportunities.
                  </p>

                  <div className="space-y-3">
                    {insights.growthSkillRecommendations.length > 0 ? (
                      insights.growthSkillRecommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1.5 text-xs"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <strong className="font-bold text-amber-950 text-sm block">{rec.skill}</strong>
                              <p className="text-[11px] text-amber-800 leading-snug">{rec.reason}</p>
                            </div>
                            <Badge variant="amber" className="shrink-0 text-[10px]">Recommended</Badge>
                          </div>

                          {/* Knowledge Hub Resource Link if available */}
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
                      ))
                    ) : (
                      <p className="text-xs text-kth-slate-600 p-4 bg-kth-slate-50 rounded-lg border border-kth-slate-200 leading-relaxed">
                        Your current skills closely match the requirements of your strongest target roles.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-kth-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/candidate/jobs')}
                    className="text-xs text-kth-slate-600 hover:text-kth-primary-600"
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
