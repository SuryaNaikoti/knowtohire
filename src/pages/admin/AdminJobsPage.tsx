import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { adminService, AdminJobRecord } from '@/services/adminService';
import {
  Pause,
  Play,
  Archive,
  Loader2,
  Search,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MessageSquare,
  AlertCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

interface AdminJobsPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminJobsPage: React.FC<AdminJobsPageProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<AdminJobRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const res = await adminService.getJobs();
    if (res.data) {
      setJobs(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();

    const handleJobsChanged = () => {
      fetchJobs();
    };

    window.addEventListener('kth_jobs_changed', handleJobsChanged);
    return () => {
      window.removeEventListener('kth_jobs_changed', handleJobsChanged);
    };
  }, [fetchJobs]);

  const handleOpenInspect = (job: AdminJobRecord) => {
    const targetPath = `/admin/jobs/${job.id}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleQuickStatusUpdate = async (
    e: React.MouseEvent,
    jobId: string,
    status: 'published' | 'paused' | 'closed'
  ) => {
    e.stopPropagation();
    setActionLoadingId(jobId);
    const res = await adminService.updateJobStatus(jobId, status);
    setActionLoadingId(null);
    if (res.data) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status,
                moderation_status:
                  status === 'published' ? 'approved' : status === 'closed' ? 'rejected' : 'pending_review',
                moderated_at: new Date().toISOString(),
              }
            : j
        )
      );
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'changes_requested'
        ? j.moderation_status === 'changes_requested' || (j.status === 'paused' && Boolean(j.moderation_notes))
        : j.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Metrics Summary Counts
  const totalCount = jobs.length;
  const publishedCount = jobs.filter((j) => j.status === 'published').length;
  const pausedCount = jobs.filter((j) => j.status === 'paused').length;
  const changesRequestedCount = jobs.filter(
    (j) => j.moderation_status === 'changes_requested' || (j.status === 'paused' && Boolean(j.moderation_notes))
  ).length;
  const closedCount = jobs.filter((j) => j.status === 'closed').length;

  // Automated Compliance Fault Checker
  const getFaultAudit = (job: AdminJobRecord) => {
    const faults: string[] = [];

    if (!job.min_salary_inr || job.min_salary_inr <= 0 || !job.max_salary_inr || job.max_salary_inr <= 0) {
      faults.push('Salary Undisclosed');
    } else if (job.max_salary_inr < job.min_salary_inr) {
      faults.push('Invalid Salary Band');
    }

    if (job.company_verification_status === 'unverified' || job.company_verification_status === 'pending_review') {
      faults.push('Unverified Employer');
    }

    const descLength = (job.description || '').trim().split(/\s+/).filter(Boolean).length;
    if (descLength < 25) {
      faults.push('Sparse Overview');
    }

    if (!job.skills || job.skills.length === 0) {
      faults.push('No Skill Tags');
    }

    if (!job.requirements || job.requirements.length === 0) {
      faults.push('No Requirements');
    }

    if (job.application_deadline) {
      const deadlineDate = new Date(job.application_deadline).getTime();
      if (!isNaN(deadlineDate) && deadlineDate < Date.now()) {
        faults.push('Expired Deadline');
      }
    }

    return faults;
  };

  const getStatusBadge = (status: string, moderationStatus?: string, hasNotes?: boolean) => {
    if (moderationStatus === 'changes_requested' || (status === 'paused' && hasNotes)) {
      return (
        <Badge variant="amber" className="capitalize font-mono text-[10px]">
          Changes Requested
        </Badge>
      );
    }
    switch (status) {
      case 'published':
        return (
          <Badge variant="emerald" className="capitalize font-mono text-[10px]" hasPulse>
            Published
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="amber" className="capitalize font-mono text-[10px]">
            Paused
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="rose" className="capitalize font-mono text-[10px]">
            Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" className="capitalize font-mono text-[10px]">
            Draft
          </Badge>
        );
    }
  };

  return (
    <AdminShell title="Job Post Moderation" currentPath="/admin/jobs" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Listings</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Live & Published</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{publishedCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Changes Requested</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{changesRequestedCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Paused / Closed</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-600 mt-0.5">{pausedCount + closedCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-slate-100 text-kth-slate-600 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
            <Input
              placeholder="Search by job title, enterprise, location, or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />
            <div className="w-full sm:w-60">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Moderation Statuses' },
                  { value: 'published', label: 'Published (Live)' },
                  { value: 'changes_requested', label: 'Changes Requested' },
                  { value: 'paused', label: 'Paused / Inactive' },
                  { value: 'closed', label: 'Closed / Rejected' },
                  { value: 'draft', label: 'Unpublished Drafts' },
                ]}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-kth-slate-500 font-bold shrink-0">
            {filteredJobs.length} of {jobs.length} Listings
          </span>
        </div>

        {/* Job Moderation Table & Cards */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading platform requisitions for audit...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-16 text-center text-kth-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-kth-slate-400 mx-auto mb-1" />
              <p className="font-bold text-sm text-kth-slate-700">No Job Postings Match Filters</p>
              <p>Try refining your search keyword or clearing the status filter.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-kth-slate-100">
                {filteredJobs.map((j) => {
                  const faults = getFaultAudit(j);
                  return (
                    <div
                      key={j.id}
                      onClick={() => handleOpenInspect(j)}
                      className="p-4 space-y-3 cursor-pointer hover:bg-kth-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-kth-slate-900 leading-snug">{j.title}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-kth-primary-600 shrink-0" />
                            <span className="text-xs text-kth-primary-700 font-semibold">{j.company_name}</span>
                          </div>
                        </div>
                        {getStatusBadge(j.status, j.moderation_status, Boolean(j.moderation_notes))}
                      </div>

                      <div className="text-xs text-kth-slate-500 flex items-center justify-between bg-kth-slate-50 p-2.5 rounded-lg border border-kth-slate-100">
                        <span>
                          Category: <strong className="text-kth-slate-700">{j.category}</strong>
                        </span>
                        <span>{j.location}</span>
                      </div>

                      {faults.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{faults.length} Notice{faults.length > 1 ? 's' : ''}: {faults[0]}</span>
                        </div>
                      )}

                      {j.moderation_notes && (
                        <div className="text-[11px] text-kth-slate-600 bg-kth-slate-100/80 p-2 rounded border border-kth-slate-200 italic line-clamp-2">
                          &ldquo;{j.moderation_notes}&rdquo;
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 min-h-[38px] text-xs font-bold"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInspect(j);
                          }}
                        >
                          Inspect Requisition
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Position & Enterprise</th>
                      <th className="p-4">Category & Domain</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Auditing & Quality</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kth-slate-100">
                    {filteredJobs.map((j) => {
                      const faults = getFaultAudit(j);
                      return (
                        <tr
                          key={j.id}
                          onClick={() => handleOpenInspect(j)}
                          className="hover:bg-kth-slate-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="p-4">
                            <div className="font-bold text-kth-slate-900 group-hover:text-kth-primary-700 transition-colors flex items-center gap-1.5">
                              {j.title}
                              <ChevronRight className="w-3.5 h-3.5 text-kth-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-kth-slate-500 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-kth-slate-400" />
                              <span>{j.company_name}</span>
                              {j.is_verified && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                                  Verified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-kth-slate-600 font-medium">{j.category}</td>
                          <td className="p-4 text-kth-slate-600">
                            <div>{j.location}</div>
                            {j.is_remote && <span className="text-[10px] text-kth-primary-600 font-semibold">(Remote)</span>}
                          </td>
                          <td className="p-4">
                            {faults.length === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Clean
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> {faults.length} Notice{faults.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {j.moderation_notes && (
                              <div className="text-[10px] text-kth-slate-500 truncate max-w-[160px] mt-0.5 italic">
                                Note: {j.moderation_notes}
                              </div>
                            )}
                          </td>
                          <td className="p-4">{getStatusBadge(j.status, j.moderation_status, Boolean(j.moderation_notes))}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                                onClick={() => handleOpenInspect(j)}
                              >
                                Inspect
                              </Button>

                              {j.status !== 'published' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Play className="w-3.5 h-3.5" />}
                                  isLoading={actionLoadingId === j.id}
                                  onClick={(e) => handleQuickStatusUpdate(e, j.id, 'published')}
                                >
                                  Publish
                                </Button>
                              )}

                              {j.status === 'published' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  leftIcon={<Pause className="w-3.5 h-3.5" />}
                                  isLoading={actionLoadingId === j.id}
                                  onClick={(e) => handleQuickStatusUpdate(e, j.id, 'paused')}
                                >
                                  Pause
                                </Button>
                              )}

                              {j.status !== 'closed' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  leftIcon={<Archive className="w-3.5 h-3.5" />}
                                  isLoading={actionLoadingId === j.id}
                                  onClick={(e) => handleQuickStatusUpdate(e, j.id, 'closed')}
                                >
                                  Close
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>
    </AdminShell>
  );
};
