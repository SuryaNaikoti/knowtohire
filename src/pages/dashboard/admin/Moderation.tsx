import React, { useState, useEffect } from 'react';
import { jobsService } from '../../../lib/services/jobsService';
import type { Job } from '../../../lib/services/jobsService';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ModerationModal } from '../../../components/dashboard/ModerationModal';
import { ShieldCheck, MapPin } from 'lucide-react';

export const Moderation: React.FC = () => {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Moderation Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsService.getPendingApprovalJobs();
      setPendingJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const handleAudit = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  if (loading) {
    return <Loading label="Loading moderation queue..." />;
  }

  const tableHeaders = [
    { key: 'vacancy', label: 'Vacancy / Employer' },
    { key: 'domain', label: 'Domain' },
    { key: 'location', label: 'Location' },
    { key: 'created', label: 'Submitted Date' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Job Moderation Queue
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Audit pending vacancy submissions, flag compliance items, toggle featured statuses, and submit audit feedback.
          </p>
        </div>
      </div>

      {pendingJobs.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-gray-600">Moderation queue is empty.</p>
          <p className="text-xs text-gray-400 font-medium">All active recruiter submissions have been audited and updated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table headers={tableHeaders}>
              {pendingJobs.map((job) => {
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{job.title}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{job.company_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">{job.career_domain}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-semibold">
                      {job.city}, {job.country}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-semibold">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAudit(job)}
                        className="text-[10px] font-bold py-1.5"
                      >
                        Audit / Moderate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {pendingJobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 border-solid rounded-xl p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{job.company_name}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="primary" size="sm">{job.career_domain}</Badge>
                  <span className="text-[10px] text-gray-500 font-medium flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.city}, {job.country}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 border-solid">
                  <span className="text-[10px] text-gray-450 font-semibold">Submitted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAudit(job)}
                    className="text-[10px] font-bold py-1.5"
                  >
                    Audit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ModerationModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onModerationSuccess={fetchPendingJobs}
      />
    </div>
  );
};

// Simple icon wrapper fallback for CheckCircle2
const CheckCircle2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
