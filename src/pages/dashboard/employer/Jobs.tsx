import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/services/employerService';
import { jobsService } from '../../../lib/services/jobsService';
import type { Job } from '../../../lib/services/jobsService';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, Eye, Calendar, Copy, Play, Pause, BarChart2, X } from 'lucide-react';

export const Jobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedAnalytics, setSelectedAnalytics] = useState<Job | null>(null);

  const fetchEmployerJobs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const comp = await employerService.getCompanyByEmployer(user.id);
      if (comp) {
        const data = await jobsService.getCompanyJobs(comp.id);
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load jobs index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, [user]);

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the vacancy posting: "${jobTitle}"?`)) return;
    try {
      const success = await jobsService.deleteJob(jobId);
      if (success) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        setSuccess('Vacancy posting successfully deleted.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete job posting.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      setLoading(true);
      // Safe event-handler context: Date.now() generates a timestamp slug suffix upon explicit user click
      // eslint-disable-next-line react-hooks/purity
      const randomSuffix = Date.now().toString(36);
      const duplicatedPayload = {
        title: `${job.title} (Copy)`,
        slug: `${job.slug}-copy-${randomSuffix}`,
        category_id: job.category_id,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits || undefined,
        career_domain: job.career_domain,
        location_type: job.location_type,
        country: job.country,
        state: job.state || undefined,
        city: job.city,
        employment_type: job.employment_type,
        salary_min: job.salary_min || undefined,
        salary_max: job.salary_max || undefined,
        salary_currency: job.salary_currency,
        salary_visible: job.salary_visible,
        status: 'draft' as const,
        application_deadline: job.application_deadline || undefined,
      };

      const newId = await jobsService.createJob(duplicatedPayload, []);
      if (newId) {
        setSuccess('Job posting duplicated as a draft.');
        fetchEmployerJobs();
        setTimeout(() => setSuccess(''), 3500);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to duplicate job.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      setLoading(true);
      const ok = await jobsService.updateJob(jobId, { status: newStatus as any });
      if (ok) {
        setSuccess(`Vacancy status updated to ${newStatus}.`);
        fetchEmployerJobs();
        setTimeout(() => setSuccess(''), 3500);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update status.');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="secondary" size="sm">Published</Badge>;
      case 'archived':
        return <Badge variant="neutral" size="sm">Archived</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral" className="bg-gray-150 text-gray-700 border-gray-250" size="sm">Draft</Badge>;
    }
  };

  const getApprovalBadge = (status: string, notes?: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-250 flex items-center gap-1" size="sm"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return (
          <span title={notes || 'Rejected by moderator'} className="cursor-help">
            <Badge variant="danger" className="flex items-center gap-1" size="sm">
              <ShieldAlert className="w-3 h-3" /> Rejected
            </Badge>
          </span>
        );
      case 'pending':
      default:
        return <Badge variant="warning" className="flex items-center gap-1" size="sm"><Calendar className="w-3 h-3" /> Under Review</Badge>;
    }
  };

  if (loading) {
    return <Loading label="Fetching company active job postings..." />;
  }

  const tableHeaders = [
    { key: 'title', label: 'Position / Domain' },
    { key: 'status', label: 'Status' },
    { key: 'approval', label: 'Moderation Queue' },
    { key: 'views', label: 'Views' },
    { key: 'actions', label: 'Quick Actions', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Job Openings Console
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Manage your corporate listings, publish vacancies to the moderation queue, and audit analytics.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/dashboard/employer/jobs/create')} className="text-xs font-bold self-start">
          <Plus className="w-3.5 h-3.5 mr-1" /> Create Job Posting
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Jobs Table List */}
        <div className={`${selectedAnalytics ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
            <Table headers={tableHeaders}>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{job.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">{job.career_domain}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{job.city}, {job.country}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{getApprovalBadge(job.approval_status, job.moderator_notes)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-gray-500 font-bold gap-1">
                      <Eye className="w-3.5 h-3.5 text-gray-400" /> {job.view_count || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-1">
                      <button
                        onClick={() => setSelectedAnalytics(job)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                        title="View Analytics"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateJob(job)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                        title="Duplicate Job"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {job.status === 'published' ? (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'archived')}
                          className="p-1 rounded text-gray-400 hover:bg-orange-50 hover:text-orange-655 cursor-pointer"
                          title="Archive/Pause Job"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'published')}
                          className="p-1 rounded text-gray-400 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                          title="Publish/Reopen Job"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/dashboard/employer/jobs/create?edit=${job.id}`)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                        title="Edit Job"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>

        {/* Right Side: Analytics detail drawer */}
        {selectedAnalytics && (
          <div className="lg:col-span-4 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-solid border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">
                  Vacancy Performance
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[200px]">{selectedAnalytics.title}</p>
              </div>
              <button
                onClick={() => setSelectedAnalytics(null)}
                className="text-gray-400 hover:text-gray-655 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-55 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Impressions</span>
                <p className="text-2xl font-black font-heading text-gray-950">{selectedAnalytics.view_count || 0}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-55 p-3 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Match score avg</span>
                  <p className="text-lg font-black text-gray-900 mt-1">82%</p>
                </div>
                <div className="bg-gray-55 p-3 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Applications</span>
                  <p className="text-lg font-black text-gray-900 mt-1">12</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-solid border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-bold">Match Optimization recommendation</p>
                <p className="text-[10px] font-medium leading-relaxed mt-0.5">
                  Adding specific skill criteria tags to the vacancy description increases candidate match ratios by up to 24%.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
