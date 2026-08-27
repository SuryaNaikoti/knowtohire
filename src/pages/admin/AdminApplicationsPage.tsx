import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { adminService, AdminApplicationRecord } from '@/services/adminService';
import {
  Search,
  Loader2,
  FileCheck,
  UserCheck,
  Building2,
  Eye,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export interface AdminApplicationsPageProps {
  onNavigate?: (route: string) => void;
}

export const AdminApplicationsPage: React.FC<AdminApplicationsPageProps> = ({ onNavigate }) => {
  const [applications, setApplications] = useState<AdminApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    const res = await adminService.getApplications(searchTerm, stageFilter);
    if (res.data) {
      setApplications(res.data);
    }
    setIsLoading(false);
  }, [searchTerm, stageFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Real-time synchronization with cross-portal events
  useEffect(() => {
    const handleApplicationsChanged = () => {
      fetchApplications();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_applications_changed', handleApplicationsChanged);
      return () => {
        window.removeEventListener('kth_applications_changed', handleApplicationsChanged);
      };
    }
  }, [fetchApplications]);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'new':
        return <Badge variant="indigo">New Application</Badge>;
      case 'screening':
        return <Badge variant="cyan">Under Screening</Badge>;
      case 'shortlisted':
        return <Badge variant="cyan">Shortlisted</Badge>;
      case 'interview':
        return <Badge variant="amber">Interview Round</Badge>;
      case 'offer':
        return <Badge variant="emerald">Offer Extended</Badge>;
      case 'hired':
        return <Badge variant="emerald">Hired</Badge>;
      case 'rejected':
        return <Badge variant="rose">Declined</Badge>;
      case 'withdrawn':
        return <Badge variant="slate">Withdrawn</Badge>;
      default:
        return <Badge variant="slate">{stage}</Badge>;
    }
  };

  const totalCount = applications.length;
  const screeningCount = applications.filter((a) => a.stage === 'screening' || a.stage === 'shortlisted').length;
  const interviewCount = applications.filter((a) => a.stage === 'interview').length;
  const offerCount = applications.filter((a) => a.stage === 'offer' || a.stage === 'hired').length;

  return (
    <AdminShell title="Platform Application Management" currentPath="/admin/applications" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border-kth-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Applications</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-kth-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">In Screening</p>
                <h3 className="text-2xl font-extrabold text-cyan-600 mt-0.5">{screeningCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Filter className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-kth-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Interviewing</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{interviewCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-kth-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Offers & Hires</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{offerCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by candidate name, email, job title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />
          </div>
          <div className="w-full sm:w-60">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Application Stages' },
                { value: 'new', label: 'New Submissions' },
                { value: 'screening', label: 'Screening' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'interview', label: 'Interviewing' },
                { value: 'offer', label: 'Offer Extended' },
                { value: 'hired', label: 'Hired' },
                { value: 'rejected', label: 'Declined / Rejected' },
                { value: 'withdrawn', label: 'Withdrawn' },
              ]}
            />
          </div>
        </div>

        {/* Applications Directory Table */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading cross-platform applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">
              No applications match your filter criteria.
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-kth-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-kth-slate-900">{app.candidate_name || '—'}</h4>
                        <p className="text-xs text-kth-slate-500 font-mono break-all">{app.candidate_email || '—'}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {app.match_score > 0 ? `${app.match_score}% Match` : '—'}
                      </span>
                    </div>

                    <div className="bg-kth-slate-50 p-2.5 rounded-lg border border-kth-slate-100 space-y-1">
                      <div className="font-semibold text-xs text-kth-slate-900">{app.job_title || '—'}</div>
                      <div className="flex items-center justify-between text-[11px] text-kth-slate-600">
                        <span>{app.company_name || '—'}</span>
                        <span className="font-bold text-kth-primary-600 uppercase">{app.category || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>{getStageBadge(app.stage)}</div>
                      <span className="text-kth-slate-400 font-mono text-[11px]">
                        {new Date(app.applied_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full min-h-[38px]"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => {
                          if (onNavigate) onNavigate(`/admin/applications/${app.id}`);
                          else window.location.href = `/admin/applications/${app.id}`;
                        }}
                      >
                        Inspect & Moderate Stage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Requisition & Category</th>
                      <th className="p-4">Employer</th>
                      <th className="p-4">Semantic Fit</th>
                      <th className="p-4">Stage</th>
                      <th className="p-4">Applied Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kth-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-kth-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-kth-slate-900">{app.candidate_name || '—'}</div>
                          <div className="text-[11px] text-kth-slate-500 font-mono">{app.candidate_email || '—'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-kth-slate-900">{app.job_title || '—'}</div>
                          <div className="text-[10px] text-kth-primary-600 font-semibold uppercase">{app.category || '—'}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-kth-slate-800 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                            <span>{app.company_name || '—'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {app.match_score > 0 ? `${app.match_score}% Match` : '—'}
                          </span>
                        </td>
                        <td className="p-4">{getStageBadge(app.stage)}</td>
                        <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                          {new Date(app.applied_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => {
                              if (onNavigate) onNavigate(`/admin/applications/${app.id}`);
                              else window.location.href = `/admin/applications/${app.id}`;
                            }}
                          >
                            Inspect & Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
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
