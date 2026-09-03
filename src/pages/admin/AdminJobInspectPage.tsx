import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminJobRecord } from '@/services/adminService';
import { formatINR } from '@/design-system/tokens';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Briefcase,
  Layers,
  FileText,
  Play,
  Pause,
  Archive,
  Loader2,
  DollarSign,
  Clock,
} from 'lucide-react';

export interface AdminJobInspectPageProps {
  jobId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminJobInspectPage: React.FC<AdminJobInspectPageProps> = ({
  jobId: propJobId,
  onNavigate,
}) => {
  const resolvedJobId = propJobId || window.location.pathname.replace('/admin/jobs/', '').split('/')[0] || '';

  const [job, setJob] = useState<AdminJobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Moderation form state
  const [targetStatus, setTargetStatus] = useState<'published' | 'paused' | 'closed' | 'draft'>('published');
  const [moderationNotes, setModerationNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredDurationDays, setFeaturedDurationDays] = useState(7);
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  const loadJob = useCallback(async () => {
    if (!resolvedJobId) {
      setIsLoading(false);
      setErrorMessage('Invalid Job ID specified.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await adminService.getJobs();
    if (res.data) {
      const match = res.data.find((j) => j.id === resolvedJobId);
      if (match) {
        setJob(match);
        setTargetStatus(match.status);
        setModerationNotes(match.moderation_notes || '');
        setIsFeatured(Boolean(match.is_featured));
        setFeaturedDurationDays(match.featured_duration_days || 7);
      } else {
        setErrorMessage('Job requisition not found.');
      }
    } else {
      setErrorMessage(res.error?.message || 'Failed to load job details.');
    }
    setIsLoading(false);
  }, [resolvedJobId]);

  useEffect(() => {
    loadJob();

    const handleJobsChanged = () => {
      loadJob();
    };

    window.addEventListener('kth_jobs_changed', handleJobsChanged);
    return () => {
      window.removeEventListener('kth_jobs_changed', handleJobsChanged);
    };
  }, [loadJob]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleSaveModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmittingModeration(true);
    setSuccessToast(null);

    let modStatus: 'approved' | 'rejected' | 'changes_requested' | 'pending_review' = 'approved';
    if (targetStatus === 'published') {
      modStatus = 'approved';
    } else if (targetStatus === 'closed') {
      modStatus = 'rejected';
    } else if (targetStatus === 'paused') {
      modStatus = moderationNotes.trim() ? 'changes_requested' : 'pending_review';
    }

    const featuredStartDate = isFeatured ? (job.featured_start_date || new Date().toISOString()) : null;
    let featuredEndDate = null;
    if (isFeatured && featuredStartDate) {
      const endD = new Date(featuredStartDate);
      endD.setDate(endD.getDate() + (featuredDurationDays || 7));
      featuredEndDate = endD.toISOString();
    }

    const res = await adminService.moderateJob(job.id, {
      status: targetStatus,
      moderation_status: modStatus,
      moderation_notes: moderationNotes.trim() || null,
      is_featured: isFeatured,
      featured_start_date: featuredStartDate,
      featured_end_date: featuredEndDate,
      featured_duration_days: isFeatured ? featuredDurationDays : null,
    } as any);

    setIsSubmittingModeration(false);

    if (res.data) {
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: targetStatus,
              moderation_status: modStatus,
              moderation_notes: moderationNotes.trim() || null,
              is_featured: isFeatured,
              featured_start_date: featuredStartDate,
              featured_end_date: featuredEndDate,
              featured_duration_days: isFeatured ? featuredDurationDays : null,
              moderated_at: new Date().toISOString(),
            }
          : prev
      );
      setSuccessToast(`Job moderation applied: Status updated to "${targetStatus}".`);
      setTimeout(() => setSuccessToast(null), 4000);
    } else if (res.error) {
      setErrorMessage(res.error.message);
    }
  };

  // Automated Compliance Fault Checker
  const getFaultAudit = (j: AdminJobRecord) => {
    const faults: { id: string; label: string; severity: 'critical' | 'warning' | 'info'; note: string }[] = [];

    // 1. Salary Check
    if (!j.min_salary_inr || j.min_salary_inr <= 0 || !j.max_salary_inr || j.max_salary_inr <= 0) {
      faults.push({
        id: 'missing_salary',
        label: 'Salary Undisclosed',
        severity: 'warning',
        note: 'Compensation range is not transparently stated.',
      });
    } else if (j.max_salary_inr < j.min_salary_inr) {
      faults.push({
        id: 'invalid_salary_range',
        label: 'Invalid Salary Band',
        severity: 'critical',
        note: 'Maximum salary is lower than minimum salary.',
      });
    }

    // 2. Company Verification Check
    if (j.company_verification_status === 'unverified' || j.company_verification_status === 'pending_review') {
      faults.push({
        id: 'unverified_employer',
        label: 'Unverified Employer',
        severity: 'critical',
        note: 'The employer has not completed platform corporate verification.',
      });
    }

    // 3. Description Depth Check
    const descLength = (j.description || '').trim().split(/\s+/).filter(Boolean).length;
    if (descLength < 25) {
      faults.push({
        id: 'vague_description',
        label: 'Sparse Role Overview',
        severity: 'warning',
        note: 'Job description is brief and may lack crucial candidate context.',
      });
    }

    // 4. Skills & Requirements Check
    if (!j.skills || j.skills.length === 0) {
      faults.push({
        id: 'missing_skills',
        label: 'No Skill Tags',
        severity: 'warning',
        note: 'No technical or domain skill keywords defined for match-scoring.',
      });
    }

    if (!j.requirements || j.requirements.length === 0) {
      faults.push({
        id: 'missing_requirements',
        label: 'No Requirements Specified',
        severity: 'warning',
        note: 'Requisition lacks explicit candidate requirements / qualifications.',
      });
    }

    // 5. Deadline Check
    if (j.application_deadline) {
      const deadlineDate = new Date(j.application_deadline).getTime();
      if (!isNaN(deadlineDate) && deadlineDate < Date.now()) {
        faults.push({
          id: 'expired_deadline',
          label: 'Application Deadline Expired',
          severity: 'critical',
          note: 'The application deadline is set in the past.',
        });
      }
    }

    return faults;
  };

  const getStatusBadge = (status: string, moderationStatus?: string, hasNotes?: boolean) => {
    if (moderationStatus === 'changes_requested' || (status === 'paused' && hasNotes)) {
      return (
        <Badge variant="amber" className="capitalize font-mono text-xs">
          Changes Requested
        </Badge>
      );
    }
    switch (status) {
      case 'published':
        return (
          <Badge variant="emerald" className="capitalize font-mono text-xs" hasPulse>
            Published
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="amber" className="capitalize font-mono text-xs">
            Paused
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="rose" className="capitalize font-mono text-xs">
            Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" className="capitalize font-mono text-xs">
            Draft
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Job Moderation & Inspection" currentPath="/admin/jobs" onNavigate={onNavigate}>
        <div className="py-24 flex flex-col items-center justify-center space-y-3 font-sans">
          <Loader2 className="w-9 h-9 text-kth-primary-600 animate-spin" />
          <p className="text-sm font-medium text-kth-slate-500">Loading complete job requisition data...</p>
        </div>
      </AdminShell>
    );
  }

  if (errorMessage || !job) {
    return (
      <AdminShell title="Job Not Found" currentPath="/admin/jobs" onNavigate={onNavigate}>
        <div className="bg-white p-12 rounded-2xl border border-kth-slate-200 text-center max-w-lg mx-auto my-8 space-y-4 font-sans">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-lg text-kth-slate-900">Job Requisition Not Found</h3>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            {errorMessage || 'This requisition does not exist or has been removed from the platform.'}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNavigate('/admin/jobs')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Job Moderation
            </Button>
          </div>
        </div>
      </AdminShell>
    );
  }

  const faults = getFaultAudit(job);

  return (
    <AdminShell title={`Moderate — ${job.title}`} currentPath="/admin/jobs" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => handleNavigate('/admin/jobs')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors p-1.5 -ml-1 rounded-lg hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Moderation Queue</span>
          </button>

          <a
            href={`/jobs/${job.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-kth-slate-200 hover:bg-kth-slate-50 text-xs font-semibold text-kth-slate-700 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-kth-primary-600" />
            <span>Public Board View</span>
          </a>
        </div>

        {/* Success Toast / Notification */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Requisition Hero Header */}
        <div className="bg-white rounded-2xl border border-kth-slate-200/90 shadow-xs p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(job.status, job.moderation_status, Boolean(job.moderation_notes))}
                <Badge variant="indigo" className="capitalize text-xs">
                  {job.employment_type?.replace('_', '-')}
                </Badge>
                <Badge variant="slate" className="capitalize text-xs">
                  {job.work_mode?.replace('_', '-')}
                </Badge>
                <Badge variant="cyan" className="text-xs">
                  {job.category}
                </Badge>
                {job.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enterprise Verified
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
                {job.title}
              </h1>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-kth-slate-600 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-kth-slate-800">
                  <Building2 className="w-4 h-4 text-kth-primary-600 shrink-0" />
                  <span>{job.company_name}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-kth-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                  <span>{job.location}</span>
                  {job.is_remote && <span className="text-kth-primary-600 font-semibold ml-0.5">(Remote)</span>}
                </div>
                <span>•</span>
                <div className="text-kth-slate-400">
                  Posted: {new Date(job.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Column (8 cols): Specifications, Description, Responsibilities, Requirements */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Enterprise & Submitter Intel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Enterprise Profile Card */}
              <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-kth-slate-100">
                  <span className="text-[10px] font-bold text-kth-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-kth-primary-600" /> Enterprise Organization
                  </span>
                  <Badge
                    variant={
                      job.company_verification_status === 'verified'
                        ? 'emerald'
                        : job.company_verification_status === 'rejected'
                        ? 'rose'
                        : 'amber'
                    }
                    className="text-[9px] capitalize"
                  >
                    {job.company_verification_status?.replace('_', ' ') || 'Verified'}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm text-kth-slate-900">{job.company_name}</div>
                  <div className="text-kth-slate-600">{job.company_industry || 'Enterprise & Technology'}</div>
                  <div className="text-kth-slate-500">{job.company_location || job.location}</div>
                  {job.company_website && (
                    <div className="pt-1">
                      <a
                        href={job.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-kth-primary-600 hover:underline font-mono"
                      >
                        {job.company_website}
                      </a>
                    </div>
                  )}
                  {job.company_description && (
                    <p className="text-[11px] text-kth-slate-500 leading-relaxed pt-1.5 border-t border-kth-slate-100">
                      {job.company_description}
                    </p>
                  )}
                </div>
              </Card>

              {/* Submitter / Poster Card */}
              <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-kth-slate-100">
                  <span className="text-[10px] font-bold text-kth-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-kth-primary-600" /> Submitted By (Employer)
                  </span>
                  <Badge variant="indigo" className="text-[9px] uppercase">
                    {job.poster_role || 'Employer'}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-sm text-kth-slate-900">{job.poster_name || 'Enterprise Recruiter'}</div>
                  <div className="flex items-center gap-1.5 text-kth-slate-600 font-mono text-[11px]">
                    <Mail className="w-3 h-3 text-kth-slate-400" />
                    <span>{job.poster_email || 'hiring@enterprise.com'}</span>
                  </div>
                  {job.poster_phone && (
                    <div className="flex items-center gap-1.5 text-kth-slate-600 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-kth-slate-400" />
                      <span>{job.poster_phone}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-kth-slate-400 pt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Submitted: {new Date(job.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Complete Role Overview & Description */}
            <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-kth-slate-100">
                <FileText className="w-4 h-4 text-kth-primary-600" /> Role Overview & Description
              </h3>
              <div className="text-xs sm:text-sm text-kth-slate-700 whitespace-pre-line leading-relaxed font-normal">
                {job.description || 'No description provided.'}
              </div>
            </Card>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-kth-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Responsibilities ({job.responsibilities.length})
                </h3>
                <ul className="space-y-2 list-none pl-0">
                  {job.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Candidate Requirements & Qualifications */}
            {job.requirements && job.requirements.length > 0 && (
              <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-kth-slate-100">
                  <Layers className="w-4 h-4 text-kth-primary-600" /> Candidate Requirements & Qualifications ({job.requirements.length})
                </h3>
                <ul className="space-y-2 list-none pl-0">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Required Skills & Domain Tags */}
            {job.skills && job.skills.length > 0 && (
              <Card className="p-6 bg-white border-kth-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider pb-2 border-b border-kth-slate-100">
                  Required Technical & Domain Skills
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {job.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md bg-kth-slate-100 text-kth-slate-800 text-xs font-semibold border border-kth-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Benefits & Perks */}
            {job.benefits && job.benefits.length > 0 && (
              <Card className="p-6 bg-white border-kth-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider pb-2 border-b border-kth-slate-100">
                  Employee Benefits & Perks
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {job.benefits.map((b, idx) => (
                    <Badge key={idx} variant="slate" className="normal-case text-xs font-medium py-1 px-3">
                      {b}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Column (4 cols): Summary Specs, Compliance Audit & Moderation Console */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Requisition Specification Card */}
            <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
              <h3 className="font-display font-bold text-sm text-kth-slate-900 uppercase tracking-wider pb-2 border-b border-kth-slate-100">
                Requisition Specs
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-kth-slate-50">
                  <span className="text-kth-slate-500 font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-kth-primary-600" /> Salary Band:
                  </span>
                  <span className="font-mono font-bold text-kth-primary-700">
                    {job.min_salary_inr && job.min_salary_inr > 0
                      ? `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr || 0, true)}`
                      : 'Undisclosed'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-kth-slate-50">
                  <span className="text-kth-slate-500 font-medium">Experience Level:</span>
                  <span className="font-semibold text-kth-slate-900 capitalize">
                    {job.experience_level?.replace('_', ' ') || 'Mid-Level'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-kth-slate-50">
                  <span className="text-kth-slate-500 font-medium">Work Arrangement:</span>
                  <span className="font-semibold text-kth-slate-900 capitalize">
                    {job.work_mode?.replace('_', ' ') || 'Hybrid'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-kth-slate-50">
                  <span className="text-kth-slate-500 font-medium">Location / State:</span>
                  <span className="font-semibold text-kth-slate-900 text-right">
                    {job.location} {job.state_code ? `(${job.state_code})` : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-kth-slate-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-kth-slate-400" /> Deadline:
                  </span>
                  <span className="font-semibold text-kth-slate-800">
                    {job.application_deadline
                      ? new Date(job.application_deadline).toLocaleDateString('en-US', { dateStyle: 'medium' })
                      : 'Open Ongoing'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Automated Compliance & Quality Auditor */}
            <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-kth-slate-100">
                <h3 className="font-display font-bold text-xs text-kth-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-kth-primary-600" /> Compliance Audit
                </h3>
                {faults.length === 0 ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {faults.length} Item{faults.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {faults.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Salary band disclosed, employer verified, and requirements specified.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {faults.map((f) => (
                    <div
                      key={f.id}
                      className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                        f.severity === 'critical'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <AlertCircle
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            f.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        />
                        <div>
                          <strong className="font-bold block leading-tight">{f.label}</strong>
                          <span className="text-[11px] leading-tight">{f.note}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStatus('paused');
                          setModerationNotes((prev) =>
                            prev ? `${prev}\n• [${f.label}] ${f.note}` : `• [${f.label}] ${f.note}`
                          );
                        }}
                        className="self-end px-2 py-0.5 rounded bg-white border text-[10px] font-bold text-kth-slate-700 hover:bg-kth-slate-50 transition-colors shadow-2xs"
                      >
                        + Add to Change Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Moderation Decision & Change Request Console */}
            <Card className="p-5 bg-white border-kth-slate-200 space-y-4">
              <h3 className="font-display font-bold text-xs text-kth-slate-900 uppercase tracking-wider pb-2 border-b border-kth-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-kth-primary-600" /> Moderation Action Console
              </h3>

              <form onSubmit={handleSaveModeration} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-kth-slate-700 uppercase tracking-wider block mb-2">
                    Decision State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetStatus('published')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'published'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('paused')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'paused' && !moderationNotes.trim()
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:border-amber-500 hover:bg-amber-50/30'
                      }`}
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTargetStatus('paused');
                        if (!moderationNotes.trim()) {
                          setModerationNotes('Please update the compensation band and clarify key candidate qualifications.');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'paused' && Boolean(moderationNotes.trim())
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:border-amber-600 hover:bg-amber-50/40'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Changes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('closed')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'closed'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:border-rose-500 hover:bg-rose-50/30'
                      }`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Reject & Close</span>
                    </button>
                  </div>
                </div>

                {/* Featured Duration Control */}
                <div className="p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-kth-slate-900 block">Featured Job Spotlight</span>
                      <span className="text-[11px] text-kth-slate-500">Highlight this opening at the top of candidate and public discovery feeds</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-kth-primary-600 rounded border-kth-slate-300 focus:ring-kth-primary-500 cursor-pointer"
                    />
                  </div>

                  {isFeatured && (
                    <div className="pt-2 border-t border-kth-slate-200 flex items-center justify-between gap-4">
                      <span className="text-xs font-medium text-kth-slate-700">Duration Active:</span>
                      <select
                        value={featuredDurationDays}
                        onChange={(e) => setFeaturedDurationDays(parseInt(e.target.value, 10))}
                        className="bg-white border border-kth-slate-200 rounded-lg px-2.5 py-1 text-xs text-kth-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-kth-primary-500"
                      >
                        <option value={7}>7 Days (1 Week)</option>
                        <option value={14}>14 Days (2 Weeks)</option>
                        <option value={30}>30 Days (1 Month)</option>
                        <option value={60}>60 Days (2 Months)</option>
                      </select>
                    </div>
                  )}

                  {job.featured_end_date && (
                    <div className="text-[10px] text-kth-slate-500 font-mono">
                      Current Expiry: {new Date(job.featured_end_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      {new Date(job.featured_end_date) < new Date() && ' (Expired)'}
                    </div>
                  )}
                </div>

                {/* Change Request / Feedback Notes */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-kth-slate-700 uppercase tracking-wider block">
                      Change Request / Feedback Notes
                    </label>
                    <span className="text-[10px] text-kth-slate-400">Visible in Employer ATS</span>
                  </div>
                  <textarea
                    rows={4}
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Enter instructions for the employer (e.g. 'Please provide valid minimum salary in INR and specify domain certifications')..."
                    className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-800 focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent outline-hidden bg-white"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setModerationNotes((prev) => (prev ? `${prev} • Needs verified salary band.` : '• Needs verified salary band.'))
                      }
                      className="px-2 py-0.5 rounded bg-kth-slate-50 text-[10px] text-kth-slate-600 border border-kth-slate-200 hover:bg-kth-slate-100"
                    >
                      + Salary Transparency
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModerationNotes((prev) =>
                          prev ? `${prev} • Vague requirements, please detail.` : '• Vague requirements, please detail.'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-kth-slate-50 text-[10px] text-kth-slate-600 border border-kth-slate-200 hover:bg-kth-slate-100"
                    >
                      + Detail Requirements
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModerationNotes((prev) =>
                          prev ? `${prev} • Clarify work mode and location.` : '• Clarify work mode and location.'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-kth-slate-50 text-[10px] text-kth-slate-600 border border-kth-slate-200 hover:bg-kth-slate-100"
                    >
                      + Work Mode
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full font-bold h-10 shadow-xs"
                    isLoading={isSubmittingModeration}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Save & Apply Decision
                  </Button>
                </div>

                {job.moderated_at && (
                  <div className="text-[10px] text-kth-slate-400 text-center pt-1 border-t border-kth-slate-100">
                    Last moderated:{' '}
                    {new Date(job.moderated_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
