import React, { useState, useEffect } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { ProfileCompletionCard } from '@/components/candidate/ProfileCompletionCard';
import { CandidateKPIGrid } from '@/components/candidate/CandidateKPIGrid';
import { UpcomingInterviewCard } from '@/components/candidate/UpcomingInterviewCard';
import { ApplicationPipelineCard } from '@/components/candidate/ApplicationPipelineCard';
import { ApplicationTracker } from '@/components/data-display/ProgressTimeline';
import { JobCard } from '@/components/cards/JobCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  jobService,
  applicationService,
  savedJobService,
  interviewService,
  candidateProfileService,
  Job,
  JobApplication,
  Interview,
  CandidateFullProfile,
} from '@/services';
import {
  ArrowRight,
  Sparkles,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { formatINR } from '@/design-system/tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return 'Recently posted';
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Posted today';
  if (diffDays === 1) return 'Posted 1 day ago';
  if (diffDays < 30) return `Posted ${diffDays} days ago`;
  return `Posted on ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
}

/**
 * Derives a specific, data-driven profile completion tip by inspecting which
 * fields the candidate's profile is actually missing.
 */
function deriveProfileTip(cp: CandidateFullProfile | null, strength: number): string | undefined {
  if (!cp || strength >= 100) return undefined;
  if (!cp.resumeUrl) return 'Upload your resume so employers can evaluate your background immediately.';
  if (!cp.headline) return 'Add a professional headline — it\'s the first thing employers see.';
  if (!cp.experience || cp.experience.length === 0)
    return 'Add at least one work experience entry to showcase your career path.';
  if (!cp.education || cp.education.length === 0)
    return 'Add your education history to build a complete academic record.';
  if (!cp.skills || cp.skills.length < 3)
    return 'Add 3 or more relevant skills to improve your job match accuracy.';
  if (!cp.certifications || cp.certifications.length === 0)
    return 'Add certifications to strengthen your professional credibility.';
  if (!cp.bio)
    return 'Write a short professional bio to help employers know who you are.';
  return undefined;
}

function getApplicationSteps(
  app: JobApplication
): Array<{ title: string; date?: string; status: 'completed' | 'current' | 'upcoming' }> {
  const stageOrder = ['new', 'screening', 'interview', 'offer', 'hired'];
  const idx = stageOrder.indexOf(app.stage);
  return [
    {
      title: 'Applied',
      date: new Date(app.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      status: idx >= 0 ? (idx === 0 ? 'current' : 'completed') : 'completed',
    },
    { title: 'Screening', status: idx > 1 ? 'completed' : idx === 1 ? 'current' : 'upcoming' },
    { title: 'Interview', status: idx > 2 ? 'completed' : idx === 2 ? 'current' : 'upcoming' },
    { title: 'Offer',     status: idx > 3 ? 'completed' : idx === 3 ? 'current' : 'upcoming' },
    { title: 'Hired',     status: idx === 4 ? 'completed' : 'upcoming' },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CandidateDashboardPage: React.FC = () => {
  const { profile } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      const [jobsRes, appsRes, savedRes, intRes, cpRes] = await Promise.all([
        jobService.getPublishedJobs({ pageSize: 4, sort_by: 'latest' }),
        applicationService.getMyApplications(),
        savedJobService.getMySavedJobs(),
        interviewService.getMyInterviews(),
        candidateProfileService.getMyCandidateProfile(),
      ]);

      if (jobsRes.data) setRecommendedJobs(jobsRes.data.data);
      if (appsRes.data) setApplications(appsRes.data);
      if (savedRes.data) setSavedCount(savedRes.data.length);
      if (intRes.data) setInterviews(intRes.data);
      if (cpRes.data) setCandidateProfile(cpRes.data);

      setIsLoading(false);
    };

    loadDashboardData();

    const handleSync = () => {
      loadDashboardData();
    };

    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('kth_saved_jobs_changed', handleSync);
    window.addEventListener('kth_jobs_changed', handleSync);
    window.addEventListener('kth_profile_updated', handleSync);
    window.addEventListener('kth_interviews_changed', handleSync);

    return () => {
      window.removeEventListener('kth_applications_changed', handleSync);
      window.removeEventListener('kth_saved_jobs_changed', handleSync);
      window.removeEventListener('kth_jobs_changed', handleSync);
      window.removeEventListener('kth_profile_updated', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
    };
  }, [profile?.id]);

  // ── Derived Data ───────────────────────────────────────────────────────────
  const now = new Date();
  const upcomingInterviews = interviews
    .filter(i => i.status === 'scheduled' && new Date(i.scheduled_start) > now)
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime());

  const nextInterview = upcomingInterviews[0] ?? null;
  const latestApplication = applications.length > 0 ? applications[0] : null;
  const profileStrength = candidateProfile?.profileCompletionPct ?? 0;
  const profileTip = deriveProfileTip(candidateProfile, profileStrength);
  const candidateFirstName = profile?.full_name?.split(' ')[0] || 'Candidate';
  const greeting = getTimeGreeting();

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────
  const SkeletonPulse = ({ className = '' }: { className?: string }) => (
    <div className={`skeleton-shimmer rounded ${className}`} />
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <CandidateShell title="Candidate Overview" currentPath="/candidate">
      <div className="space-y-6 font-sans">

        {/* ── 1. Welcome Area ─────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-kth-slate-900 leading-tight">
              {greeting}, {candidateFirstName}.
            </h1>
            <p className="text-xs text-kth-slate-500 mt-1">
              {applications.length > 0
                ? `You have ${applications.length} active application${applications.length !== 1 ? 's' : ''}. Here's your current career overview.`
                : "Here's the current status of your sustainability applications and opportunities."}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNavigate('/candidate/jobs')}
            className="shrink-0"
          >
            Find Matching Jobs <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {/* ── 2. KPI Cards (clickable) ─────────────────────────────────────── */}
        <CandidateKPIGrid
          applicationsCount={applications.length}
          interviewsCount={upcomingInterviews.length}
          savedJobsCount={savedCount}
          profileStrength={profileStrength}
          isLoading={isLoading}
          onApplicationsClick={() => handleNavigate('/candidate/applications')}
          onInterviewsClick={() => handleNavigate('/candidate/interviews')}
          onSavedJobsClick={() => handleNavigate('/candidate/saved-jobs')}
          onProfileClick={() => handleNavigate('/candidate/profile')}
        />

        {/* ── 3. Profile Completion Bar (only when < 100%) ─────────────────── */}
        {!isLoading && profileStrength < 100 && (
          <ProfileCompletionCard
            strength={profileStrength}
            tip={profileTip}
          />
        )}

        {/* ── 4. Application Tracker / Smart Empty-State Banner ────────────── */}
        {isLoading ? (
          <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs">
            <SkeletonPulse className="h-4 w-48 mb-3" />
            <SkeletonPulse className="h-5 w-full mb-2" />
            <SkeletonPulse className="h-14 w-full" />
          </div>
        ) : latestApplication ? (
          /* Application progress tracker for latest active application */
          <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-kth-slate-100">
              <div>
                <span className="text-[10px] font-bold text-kth-slate-400 uppercase tracking-wider block">
                  LATEST ACTIVE APPLICATION
                </span>
                <h2 className="font-display font-bold text-sm text-kth-slate-900 mt-0.5">
                  {latestApplication.job?.title || 'Job Position'}&nbsp;—&nbsp;
                  {latestApplication.job?.company?.name || 'Company'}&nbsp;
                  <span className="text-kth-slate-500 font-normal">
                    ({formatINR(latestApplication.job?.min_salary_inr || 0)} – {formatINR(latestApplication.job?.max_salary_inr || 0, true)})
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate(`/candidate/applications/${latestApplication.id}`)}
                className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 transition-colors whitespace-nowrap"
              >
                View Timeline →
              </button>
            </div>
            <ApplicationTracker steps={getApplicationSteps(latestApplication)} />
          </div>
        ) : (
          /* Smart empty-state: profile-driven CTA */
          <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                {profileStrength >= 80 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Briefcase className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-kth-slate-900">
                  {profileStrength >= 80
                    ? 'Your profile is ready — start applying!'
                    : 'Complete your profile to unlock better matches'}
                </h2>
                <p className="text-xs text-kth-slate-500 mt-0.5">
                  {profileStrength >= 80
                    ? 'Discover verified ESG and environmental roles across India.'
                    : `Your profile is ${profileStrength}% complete. A stronger profile attracts more employers.`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {profileStrength < 80 && (
                <Button variant="secondary" size="sm" onClick={() => handleNavigate('/candidate/profile')}>
                  Complete Profile
                </Button>
              )}
              <Button variant={profileStrength >= 80 ? 'primary' : 'outline'} size="sm" onClick={() => handleNavigate('/candidate/jobs')}>
                Browse Jobs
              </Button>
            </div>
          </div>
        )}

        {/* ── 5. Upcoming Activity (live — only rendered if interviews exist) ── */}
        {!isLoading && upcomingInterviews.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-kth-primary-600" />
                <h2 className="font-display font-bold text-base text-kth-slate-900">
                  Upcoming Activity
                </h2>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-kth-primary-600 text-white text-[10px] font-bold">
                  {upcomingInterviews.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/candidate/interviews')}
                className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 transition-colors"
              >
                View Calendar →
              </button>
            </div>

            <div className="divide-y divide-kth-slate-100">
              {upcomingInterviews.slice(0, 3).map((interview) => {
                const startDate = new Date(interview.scheduled_start);
                const companyName = (interview as any).company?.name;
                return (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-kth-primary-50 text-kth-primary-700 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold uppercase leading-none">
                          {startDate.toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                        <span className="text-sm font-extrabold leading-none">
                          {startDate.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-kth-slate-900 truncate">
                          {interview.title}
                        </p>
                        <p className="text-xs text-kth-slate-500 truncate">
                          {interview.job?.title || 'Interview'}
                          {companyName ? ` · ${companyName}` : ''}
                          {' · '}
                          {startDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigate('/candidate/interviews')}
                      className="ml-3 text-kth-slate-400 hover:text-kth-primary-600 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 6. Recommended Jobs + Career Intelligence ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Recommended Jobs — 8/12 cols (~67%) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-base text-kth-slate-900">
                Recommended For You
              </h2>
              <button
                type="button"
                onClick={() => handleNavigate('/candidate/jobs')}
                className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 transition-colors"
              >
                Explore All →
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-kth-slate-200 p-5 space-y-3">
                    <SkeletonPulse className="h-4 w-32" />
                    <SkeletonPulse className="h-5 w-full" />
                    <SkeletonPulse className="h-3 w-24" />
                    <SkeletonPulse className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : recommendedJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.company?.name || 'Verified Enterprise'}
                    companyLogo={job.company?.logo_url || undefined}
                    location={job.location}
                    isRemote={job.is_remote}
                    isVerified={job.is_verified || job.company?.verification_status === 'verified'}
                    employmentType={job.employment_type}
                    minSalaryINR={job.min_salary_inr}
                    maxSalaryINR={job.max_salary_inr}
                    skills={job.skills || []}
                    postedDate={formatRelativeDate(job.published_at || job.created_at)}
                    onApply={() => handleNavigate(`/candidate/jobs/${job.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-kth-slate-200 p-10 text-center">
                <Briefcase className="w-8 h-8 text-kth-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-kth-slate-600">No open positions yet</p>
                <p className="text-xs text-kth-slate-400 mt-1">
                  Check back soon — new verified roles are added regularly.
                </p>
              </div>
            )}
          </div>

          {/* Career Intelligence — 4/12 cols (~33%) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-kth-accent-cyan" /> Career Intelligence
            </h2>

            {isLoading ? (
              <div className="bg-white rounded-xl border border-kth-slate-200 p-5 space-y-3">
                <SkeletonPulse className="h-4 w-28" />
                <SkeletonPulse className="h-3 w-full" />
                <SkeletonPulse className="h-3 w-3/4" />
                <SkeletonPulse className="h-8 w-full" />
              </div>
            ) : nextInterview ? (
              /* Show next upcoming interview */
              <UpcomingInterviewCard
                interview={nextInterview}
                onViewAll={() => handleNavigate('/candidate/interviews')}
              />
            ) : applications.length > 0 ? (
              /* Show application pipeline distribution */
              <ApplicationPipelineCard
                applications={applications}
                onViewAll={() => handleNavigate('/candidate/applications')}
              />
            ) : (
              /* No data yet — show a non-fabricated prompt */
              <div className="bg-white rounded-xl border border-kth-slate-200 p-5 text-center space-y-2">
                <Sparkles className="w-7 h-7 text-kth-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-kth-slate-700">No insights yet</p>
                <p className="text-xs text-kth-slate-400 leading-relaxed">
                  Career intelligence will appear once you start applying to verified roles.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs mt-2"
                  onClick={() => handleNavigate('/candidate/jobs')}
                >
                  Browse Jobs <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </CandidateShell>
  );
};
