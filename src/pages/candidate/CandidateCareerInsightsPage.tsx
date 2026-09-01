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
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const CandidateCareerInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<CareerIntelligenceResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await careerInsightsService.getCareerInsights();
    if (error) {
      console.error('[CareerInsights UI] Error loading insights:', error);
      setErrorMessage(error.message);
      setInsights(null);
    } else if (data) {
      console.log('[CareerInsights UI] Received insights:', {
        currentTitle: data.currentTitle,
        hasSufficientProfileData: data.hasSufficientProfileData,
        hasSufficientMarketData: data.hasSufficientMarketData,
        opportunitiesCount: data.opportunities?.length,
        targetRoleTitle: data.targetRoleTitle,
        matchScore: data.matchScore,
      });
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
        {/* Header Hero Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="indigo" className="text-xs font-semibold py-0.5 px-2.5">
              Career Intelligence
            </Badge>
            <Badge variant="emerald" className="text-[11px] font-semibold py-0.5 px-2.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Resume-Parsed Intelligence</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
            Career Insights
          </h1>
          <p className="text-xs sm:text-sm text-kth-slate-600 mt-1 max-w-2xl leading-relaxed">
            Understand your current career position, market alignment, and next opportunities generated from your individual verified profile and parsed resume.
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
              Comparing your verified profile with active market openings...
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
        {!isLoading && !errorMessage && insights && insights.hasSufficientProfileData && (!insights.hasSufficientMarketData || insights.opportunities.length === 0) && (
          <EmptyState
            title="No Matching Openings Found"
            description={insights.emptyStateReason || "Not enough relevant openings currently published in the catalog to generate market-wide skill gap benchmarks."}
            actionText="Explore Available Jobs"
            onAction={() => handleNavigate('/candidate/jobs')}
            icon={<Briefcase className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Main Insights Content Dashboard */}
        {!isLoading && !errorMessage && insights && insights.hasSufficientProfileData && (insights.hasSufficientMarketData && insights.opportunities.length > 0) && (
          <>
            {/* 1. CURRENT CAREER POSITION */}
            <Card className="p-6 md:p-7 bg-white border-kth-slate-200 shadow-xs">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="space-y-1 max-w-xl">
                  <span className="text-[11px] font-bold text-kth-slate-400 uppercase tracking-wider block">
                    CURRENT CAREER POSITION
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-kth-slate-900 leading-snug">
                    {insights.currentTitle}
                  </h2>
                  <p className="text-xs text-kth-slate-600 font-medium">
                    Domain: <span className="text-kth-slate-900 font-semibold">{insights.currentDomain}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 bg-kth-slate-100 text-kth-slate-700 px-3 py-1.5 rounded-lg font-medium border border-kth-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{insights.verifiedSkillsCount}</strong> Verified Skills
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-kth-slate-100 text-kth-slate-700 px-3 py-1.5 rounded-lg font-medium border border-kth-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-kth-slate-500" />
                    {insights.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-kth-slate-100 text-kth-slate-700 px-3 py-1.5 rounded-lg font-medium border border-kth-slate-200">
                    <Clock className="w-3.5 h-3.5 text-kth-slate-500" />
                    {insights.employmentPreference}
                  </span>
                </div>
              </div>
            </Card>

            {/* 2. STRONGEST CURRENT OPPORTUNITIES & PROGRESSION ALIGNMENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Progression Alignment & Explainable Score */}
              <Card className="lg:col-span-2 p-6 md:p-7 bg-white border-kth-slate-200 shadow-xs space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-kth-primary-600" /> Progression Alignment
                    </h3>
                    <span className="text-xs font-semibold text-kth-slate-500">
                      Strongest Current Alignment
                    </span>
                  </div>
                  <p className="text-xs text-kth-slate-500">
                    Calculated alignment between your verified profile and live platform requisitions.
                  </p>
                </div>

                {/* Main Target Role Match Overview */}
                <div className="bg-kth-primary-50/70 p-5 rounded-xl border border-kth-primary-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-kth-primary-700 uppercase tracking-wider block">
                        TARGET ROLE
                      </span>
                      <h4 className="font-display font-extrabold text-lg text-kth-primary-950">
                        {insights.targetRoleTitle}
                      </h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-kth-primary-700 uppercase tracking-wider block">
                        MATCH SCORE
                      </span>
                      <span className="font-mono text-2xl font-black text-kth-primary-700">
                        {insights.matchScore}%
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={insights.matchScore}
                    label="Role Alignment Progress"
                    color="primary"
                  />

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-kth-primary-900 font-semibold font-mono">
                      {insights.targetSalaryRange}
                    </span>
                    <span className="text-kth-slate-600">
                      {insights.marketOpeningsCount} Active Opening{insights.marketOpeningsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Explainable Dimensions Breakdown */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-kth-slate-700">
                    Why this score?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.explanations.map((exp, idx) => (
                      <div
                        key={idx}
                        className="bg-kth-slate-50 p-3.5 rounded-xl border border-kth-slate-200/80 space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-kth-slate-900">{exp.factor}</span>
                          <span
                            className={
                              exp.ratingLabel === 'Excellent' || exp.ratingLabel === 'Strong'
                                ? 'text-emerald-700'
                                : exp.ratingLabel === 'Developing'
                                ? 'text-amber-700'
                                : 'text-kth-slate-700'
                            }
                          >
                            {exp.ratingLabel}
                          </span>
                        </div>
                        <p className="text-kth-slate-600 text-[11px] leading-relaxed">{exp.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Right Col: Career Opportunity Map (Ranked Alternative Roles) */}
              <Card className="p-6 bg-white border-kth-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-kth-primary-600" /> Career Opportunity Map
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    Comparison across relevant openings in your career domain:
                  </p>

                  <div className="space-y-3">
                    {insights.opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleNavigate(`/candidate/jobs?keyword=${encodeURIComponent(opp.roleTitle)}`)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                          opp.isTopMatch
                            ? 'bg-kth-primary-50/50 border-kth-primary-300 hover:border-kth-primary-500'
                            : 'bg-kth-slate-50/70 border-kth-slate-200 hover:border-kth-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <strong className="font-bold text-kth-slate-900 leading-snug line-clamp-1">
                            {opp.roleTitle}
                          </strong>
                          <Badge variant={opp.matchScore >= 80 ? 'emerald' : 'indigo'} className="shrink-0 text-[10px]">
                            {opp.matchScore}%
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-kth-slate-500">
                          <span>{opp.openingsCount} opening{opp.openingsCount !== 1 ? 's' : ''}</span>
                          <span className="font-mono text-kth-slate-700">{opp.salaryRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('/candidate/jobs')}
                  className="w-full text-xs text-kth-slate-700 font-semibold"
                >
                  Explore All Jobs <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Card>
            </div>

            {/* 3. VERIFIED SKILL STRENGTHS & IDENTIFIED SKILL GAPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Verified Skill Strengths */}
              <Card className="p-6 bg-white border-kth-slate-200 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" /> Verified Skill Strengths
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    Skills from your profile that directly match requirements in relevant market openings:
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

              {/* Identified Skill Gaps */}
              <Card className="p-6 bg-white border-kth-slate-200 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Identified Skill Gaps
                  </h3>
                  <p className="text-xs text-kth-slate-500 mb-4">
                    High-demand competencies missing from your profile that could improve your match:
                  </p>

                  <div className="space-y-3">
                    {insights.growthSkillRecommendations.length > 0 ? (
                      insights.growthSkillRecommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs"
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
                            <span className="text-kth-slate-500">Learning Material:</span>
                            {rec.recommendedResource?.isAvailable ? (
                              <a
                                href={rec.recommendedResource.url}
                                className="font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1 hover:underline"
                              >
                                <BookOpen className="w-3 h-3" /> {rec.recommendedResource.title}
                              </a>
                            ) : (
                              <span className="text-kth-slate-400 italic">Resource coming soon</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-kth-slate-600 p-4 bg-kth-slate-50 rounded-lg border border-kth-slate-200 leading-relaxed">
                        No significant skill gaps identified for this opportunity.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-kth-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/knowledge')}
                    className="text-xs text-kth-slate-600 hover:text-kth-primary-600"
                  >
                    Explore Knowledge Hub <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* 4. IMPROVE MY MATCH & RECOMMENDED NEXT ACTIONS */}
            <Card className="p-6 md:p-7 bg-white border-kth-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-kth-primary-600" /> Improve My Match & Recommended Next Actions
                </h3>
                <p className="text-xs text-kth-slate-500">
                  Concrete steps connected to verified opportunities to elevate your candidate profile:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {insights.recommendedActions.map((action) => (
                  <div
                    key={action.id}
                    className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Badge
                          variant={action.impactLevel === 'High impact' ? 'amber' : 'indigo'}
                          className="text-[10px] font-bold py-0.5"
                        >
                          {action.impactLevel}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-kth-slate-900 leading-snug">
                        {action.title}
                      </h4>
                      <p className="text-[11px] text-kth-slate-600 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(action.actionUrl)}
                      className="w-full text-xs font-semibold justify-between bg-white text-kth-slate-800 hover:text-kth-primary-600"
                    >
                      <span>{action.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </CandidateShell>
  );
};
