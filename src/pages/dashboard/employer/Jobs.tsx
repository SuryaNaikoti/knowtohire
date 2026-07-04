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
import { Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, Eye, Calendar } from 'lucide-react';

export const Jobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
      } else {
        alert('Failed to delete job posting.');
      }
    } catch (err) {
      console.error(err);
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
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
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

      {jobs.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
          <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-600">No active job listings found.</p>
          <p className="text-xs text-gray-400 font-medium">Create your first vacancy to begin matching with vetted candidates.</p>
          <Button size="sm" onClick={() => navigate('/dashboard/employer/jobs/create')} className="text-xs font-bold mt-2">
            Post First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table headers={tableHeaders}>
              {jobs.map((job) => {
                return (
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
                    <TableCell className="text-xs text-gray-600 font-semibold">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/dashboard/employer/jobs/create?edit=${job.id}`)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit job posting"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                          aria-label="Delete job posting"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 border-solid rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">{job.career_domain}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{job.city}, {job.country}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => navigate(`/dashboard/employer/jobs/create?edit=${job.id}`)}
                      className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 border-solid text-xs">
                  <div className="flex space-x-1.5">
                    {getStatusBadge(job.status)}
                    {getApprovalBadge(job.approval_status, job.moderator_notes)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 font-bold gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" /> {job.view_count || 0} views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
