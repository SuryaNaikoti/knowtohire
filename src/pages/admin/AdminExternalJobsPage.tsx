import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  ExternalJob,
  ExternalJobSection,
  ExternalJobStatus,
} from '@/types/externalJob';
import {
  externalJobService,
} from '@/services/externalJobService';
import {
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
} from 'lucide-react';

export interface AdminExternalJobsPageProps {
  onNavigate?: (route: string) => void;
}

export const AdminExternalJobsPage: React.FC<AdminExternalJobsPageProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const res = await externalJobService.getExternalJobs(
      {
        section: sectionFilter === 'all' ? 'all' : (sectionFilter as ExternalJobSection),
        status: statusFilter === 'all' ? 'all' : (statusFilter as ExternalJobStatus),
        search: searchTerm.trim() || undefined,
      },
      true // Admin view: show all statuses and expired items
    );
    if (res.data) {
      setJobs(res.data);
    }
    setIsLoading(false);
  }, [searchTerm, sectionFilter, statusFilter]);

  useEffect(() => {
    fetchJobs();
    const handleUpdate = () => fetchJobs();
    if (typeof window !== 'undefined') {
      window.addEventListener('kth_external_jobs_changed', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_external_jobs_changed', handleUpdate);
      }
    };
  }, [fetchJobs]);

  const handleOpenCreatePage = () => {
    if (onNavigate) {
      onNavigate('/admin/external-jobs/new');
    } else {
      window.location.href = '/admin/external-jobs/new';
    }
  };

  const handleOpenEditPage = (job: ExternalJob) => {
    if (onNavigate) {
      onNavigate(`/admin/external-jobs/${job.id}/edit`);
    } else {
      window.location.href = `/admin/external-jobs/${job.id}/edit`;
    }
  };

  const handleToggleStatus = async (job: ExternalJob) => {
    setActionLoadingId(job.id);
    const newStatus: ExternalJobStatus = job.status === 'published' ? 'draft' : 'published';
    await externalJobService.updateExternalJob(job.id, { status: newStatus });
    setActionLoadingId(null);
    fetchJobs();
  };

  const handleDeleteJob = async (job: ExternalJob) => {
    if (confirm(`Are you sure you want to delete "${job.title}"?`)) {
      setActionLoadingId(job.id);
      await externalJobService.deleteExternalJob(job.id);
      setActionLoadingId(null);
      fetchJobs();
    }
  };

  // Metrics
  const totalCount = jobs.length;
  const publishedCount = jobs.filter((j) => j.status === 'published').length;
  const latestCount = jobs.filter((j) => j.section === 'latest').length;
  const fresherCount = jobs.filter((j) => j.section === 'fresher').length;
  const walkInCount = jobs.filter((j) => j.section === 'walk_in').length;
  const totalClicks = jobs.reduce((acc, j) => acc + (j.click_count || 0), 0);

  const getSectionBadge = (section: ExternalJobSection) => {
    switch (section) {
      case 'latest':
        return <Badge variant="indigo">Latest Jobs</Badge>;
      case 'fresher':
        return <Badge variant="emerald">Fresher Jobs</Badge>;
      case 'walk_in':
        return <Badge variant="amber">Walk-In Interviews</Badge>;
      default:
        return <Badge variant="slate">{section}</Badge>;
    }
  };

  const isExpired = (job: ExternalJob) => {
    if (!job.published_until) return false;
    return new Date(job.published_until).getTime() < Date.now();
  };

  return (
    <AdminShell title="Curated External Jobs CMS" currentPath="/admin/external-jobs" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Top Header & New Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-kth-slate-900 tracking-tight">
              External & Curated Job Listings
            </h1>
            <p className="text-xs text-kth-slate-500 mt-1">
              Manage external job links displayed in the 3-column curated section on the homepage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreatePage}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold bg-kth-slate-900 hover:bg-kth-slate-800 text-white"
            >
              Add External Job
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-3.5 border-kth-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-kth-slate-500 uppercase tracking-wider block">
              Total Curated
            </span>
            <span className="text-xl font-bold text-kth-slate-900 mt-1 block">
              {totalCount}
            </span>
          </Card>

          <Card className="p-3.5 border-kth-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-kth-slate-500 uppercase tracking-wider block">
              Live Published
            </span>
            <span className="text-xl font-bold text-emerald-600 mt-1 block">
              {publishedCount}
            </span>
          </Card>

          <Card className="p-3.5 border-kth-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-kth-slate-500 uppercase tracking-wider block">
              Latest Jobs
            </span>
            <span className="text-xl font-bold text-kth-slate-900 mt-1 block">
              {latestCount}
            </span>
          </Card>

          <Card className="p-3.5 border-kth-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-kth-slate-500 uppercase tracking-wider block">
              Fresher Jobs
            </span>
            <span className="text-xl font-bold text-kth-slate-900 mt-1 block">
              {fresherCount}
            </span>
          </Card>

          <Card className="p-3.5 border-kth-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-kth-slate-500 uppercase tracking-wider block">
              Walk-Ins
            </span>
            <span className="text-xl font-bold text-kth-slate-900 mt-1 block">
              {walkInCount}
            </span>
          </Card>

          <Card className="p-3.5 border-kth-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-kth-slate-500 uppercase tracking-wider block">
              Total Clicks
            </span>
            <span className="text-xl font-bold text-kth-slate-900 mt-1 block">
              {totalClicks}
            </span>
          </Card>
        </div>

        {/* Filters Bar */}
        <Card className="p-4 border-kth-slate-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-kth-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <Select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Sections' },
                  { value: 'latest', label: 'Latest Jobs' },
                  { value: 'fresher', label: 'Fresher Jobs' },
                  { value: 'walk_in', label: 'Walk-In Interviews' },
                ]}
              />
            </div>

            <div className="md:col-span-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'published', label: 'Published Only' },
                  { value: 'draft', label: 'Draft Only' },
                ]}
              />
            </div>

            <div className="md:col-span-1 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSectionFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Listings Table */}
        <Card className="border-kth-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="w-full">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-[30%]">Job & Link</th>
                  <th className="py-3 px-2 w-[14%]">Section</th>
                  <th className="py-3 px-2 w-[18%]">Company</th>
                  <th className="py-3 px-2 text-center w-[7%]">Order</th>
                  <th className="py-3 px-2 text-center w-[10%]">Status</th>
                  <th className="py-3 px-2 text-center w-[7%]">Clicks</th>
                  <th className="py-3 px-3 text-right w-[14%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kth-slate-100 font-medium text-kth-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-kth-slate-400">
                      Loading curated external jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-kth-slate-400">
                      No external jobs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => {
                    const expired = isExpired(job);
                    return (
                      <tr key={job.id} className="hover:bg-kth-slate-50/60 transition-colors">
                        {/* Title & Link */}
                        <td className="py-2.5 px-3 truncate">
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-kth-slate-900 leading-tight truncate text-xs" title={job.title}>
                              {job.title}
                            </p>
                            <a
                              href={job.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-kth-primary-600 hover:text-kth-primary-800 truncate font-mono max-w-full"
                              title={job.redirect_url}
                            >
                              <span className="truncate">{job.redirect_url}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          </div>
                        </td>

                        {/* Section */}
                        <td className="py-2.5 px-2">
                          {getSectionBadge(job.section)}
                        </td>

                        {/* Company & Location */}
                        <td className="py-2.5 px-2 truncate">
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-kth-slate-800 truncate text-xs" title={job.company_name || '—'}>
                              {job.company_name || '—'}
                            </div>
                            <div className="text-[11px] text-kth-slate-400 truncate" title={job.location || ''}>
                              {job.location || '—'}
                            </div>
                          </div>
                        </td>

                        {/* Display Order */}
                        <td className="py-2.5 px-2 text-center">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 bg-kth-slate-100 rounded text-kth-slate-700 font-bold">
                            #{job.display_order}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <Badge
                              variant={job.status === 'published' ? 'emerald' : 'slate'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {job.status === 'published' ? 'Live' : 'Draft'}
                            </Badge>
                            {expired && (
                              <span className="text-[9px] text-amber-700 font-bold">
                                Expired
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Click count */}
                        <td className="py-2.5 px-2 text-center">
                          <span className="font-semibold text-kth-slate-700 text-xs font-mono">
                            {job.click_count || 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle Publish/Draft */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoadingId === job.id}
                              onClick={() => handleToggleStatus(job)}
                              title={job.status === 'published' ? 'Unpublish' : 'Publish'}
                              className={`h-7 px-1.5 text-[11px] font-semibold ${
                                job.status === 'published'
                                  ? 'text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {job.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>

                            {/* Edit */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditPage(job)}
                              title="Edit listing details"
                              className="h-7 w-7 p-0 text-kth-slate-600 hover:text-kth-slate-900"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoadingId === job.id}
                              onClick={() => handleDeleteJob(job)}
                              title="Delete listing"
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
};
