import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsService } from '../../../lib/services/jobsService';
import type { Job } from '../../../lib/services/jobsService';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { Select } from '../../../components/ui/Select';
import { StaggerGrid, StaggerItem } from '../../../components/ui/Motion';
import { ShieldCheck, MapPin, CheckCircle2, Search, Filter, RotateCcw, ChevronRight, Building2, Clock } from 'lucide-react';

export const Moderation: React.FC = () => {
  const navigate = useNavigate();
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsService.getPendingApprovalJobs();
      setPendingJobs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...pendingJobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        (j.company_name && j.company_name.toLowerCase().includes(q)) ||
        (j.career_domain && j.career_domain.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(j => j.moderation_status === statusFilter);
    }
    return result;
  }, [pendingJobs, search, statusFilter]);

  if (loading) {
    return <Loading label="Loading moderation queue..." />;
  }

  const tableHeaders = [
    { key: 'vacancy', label: 'Vacancy / Employer' },
    { key: 'domain', label: 'Domain' },
    { key: 'location', label: 'Location' },
    { key: 'created', label: 'Submitted Date' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            Job Moderation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit pending vacancy submissions, flag compliance items, toggle featured statuses, and submit audit feedback.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Audit</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingJobs.length}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Vacancies Queued</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-2xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Average Turnaround</p>
            <h3 className="text-2xl font-black text-sky-600 mt-1">1.4 Hours</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">SLA Compliance</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending jobs by title, company, or domain..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3 shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900 font-heading">Moderation queue is clear</p>
          <p className="text-xs text-slate-500 font-medium">All active recruiter submissions have been audited and updated.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <Table headers={tableHeaders}>
              {filteredJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/admin/moderation/${job.id}`)}
                >
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm hover:text-emerald-600 transition-colors">{job.title}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{job.company_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">{job.career_domain || 'General'}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-semibold">
                    {job.city || 'Remote'}, {job.country || 'India'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-semibold">
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : '06 Aug 2026'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/admin/moderation/${job.id}`);
                      }}
                    >
                      Audit Listing <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;
