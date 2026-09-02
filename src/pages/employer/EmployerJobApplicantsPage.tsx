import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CandidateQuickView } from '@/components/employer/CandidateQuickView';
import { applicationService, jobService, JobApplication, ApplicationStage, Job } from '@/services';
import { navigateTo } from '@/utils/navigation';
import { Search, ArrowLeft, RefreshCw, Users, Star } from 'lucide-react';

export interface EmployerJobApplicantsPageProps {
  jobId?: string;
}

export const EmployerJobApplicantsPage: React.FC<EmployerJobApplicantsPageProps> = ({ jobId: propJobId }) => {
  const resolvedJobId = propJobId || window.location.pathname.split('/employer/jobs/')[1]?.split('/applicants')[0] || '';

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadApplicants = useCallback(async () => {
    if (!resolvedJobId) {
      setIsLoading(false);
      setErrorMessage('Invalid Job ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const [jobRes, appsRes] = await Promise.all([
      jobService.getEmployerJobById(resolvedJobId),
      applicationService.getJobApplicants(resolvedJobId, {
        stage: selectedStage !== 'all' ? (selectedStage as ApplicationStage) : undefined,
      }),
    ]);

    if (jobRes.data) setJob(jobRes.data);

    if (appsRes.error) {
      setErrorMessage(appsRes.error.message);
      setApplications([]);
    } else if (appsRes.data) {
      setApplications(appsRes.data.data);
    }

    setIsLoading(false);
  }, [resolvedJobId, selectedStage]);

  useEffect(() => {
    loadApplicants();

    const handleSync = () => {
      loadApplicants();
    };

    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('focus', handleSync);
    const interval = setInterval(loadApplicants, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('kth_applications_changed', handleSync);
    };
  }, [loadApplicants]);

  const filteredApplications = applications.filter((app) => {
    const snapshot = (app.candidate_snapshot || {}) as Record<string, any>;
    const name = (app.candidate?.full_name || snapshot.full_name || '').toLowerCase();
    const headline = (snapshot.headline || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || headline.includes(term);
  });

  const handleNavigate = (path: string) => {
    navigateTo(path);
  };

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case 'new': return <Badge variant="indigo">New Applicant</Badge>;
      case 'screening': return <Badge variant="cyan">Screening</Badge>;
      case 'shortlisted': return <Badge variant="emerald">Shortlisted</Badge>;
      case 'interview': return <Badge variant="indigo">Interview</Badge>;
      case 'offer': return <Badge variant="emerald">Offer Stage</Badge>;
      case 'hired': return <Badge variant="emerald">Hired</Badge>;
      case 'rejected': return <Badge variant="slate">Archived</Badge>;
      case 'withdrawn': return <Badge variant="slate">Withdrawn</Badge>;
      default: return <Badge variant="slate">{stage}</Badge>;
    }
  };

  return (
    <EmployerShell title={`Applicants — ${job?.title || 'Requisition'}`} currentPath="/employer/jobs">
      <div className="space-y-6 font-sans">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavigate('/employer/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Openings</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate('/employer/pipeline')}
          >
            Open Full ATS Kanban
          </Button>
        </div>

        {/* Load Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Applicants">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadApplicants} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search candidate name, headline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              options={[
                { value: 'all', label: 'All Application Stages' },
                { value: 'new', label: 'New' },
                { value: 'screening', label: 'Screening' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'interview', label: 'Interview' },
                { value: 'offer', label: 'Offer' },
                { value: 'hired', label: 'Hired' },
                { value: 'rejected', label: 'Archived' },
              ]}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 space-y-4 animate-pulse">
            <div className="h-6 bg-kth-slate-200 rounded w-1/4" />
            <div className="h-10 bg-kth-slate-100 rounded" />
            <div className="h-10 bg-kth-slate-100 rounded" />
            <div className="h-10 bg-kth-slate-100 rounded" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && filteredApplications.length === 0 && (
          <EmptyState
            title="No Applicants in this View"
            description="No candidate applications currently match your search or stage criteria for this job opening."
            actionText="Clear Search Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedStage('all');
            }}
            icon={<Users className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Desktop Enterprise Applicants Table */}
        {!isLoading && !errorMessage && filteredApplications.length > 0 && (
          <div className="bg-white rounded-2xl border border-kth-slate-200 overflow-hidden hidden md:block shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Recruiter Rating</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => {
                  const snapshot = (app.candidate_snapshot || {}) as Record<string, any>;
                  const name = app.candidate?.full_name || snapshot.full_name || 'Candidate';
                  const headline = snapshot.headline || 'Sustainability Professional';
                  const location = snapshot.location || 'India';

                  return (
                    <TableRow
                      key={app.id}
                      onClick={() => setSelectedApplication(app)}
                      className="cursor-pointer hover:bg-kth-slate-50/80 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <strong className="font-bold text-xs text-kth-slate-900 block">{name}</strong>
                            <span className="text-[11px] text-kth-slate-500 line-clamp-1">{headline}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-kth-slate-600">{location.split(',')[0]}</TableCell>
                      <TableCell>{getStageBadge(app.stage)}</TableCell>
                      <TableCell>
                        {app.employer_rating && app.employer_rating > 0 ? (
                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-mono font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{app.employer_rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-kth-slate-400">Unrated</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-kth-slate-500">
                        {new Date(app.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            Quick View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigate(`/employer/applications/${app.id}`)}
                          >
                            Full Profile
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Mobile Applicants Card Stack */}
        {!isLoading && !errorMessage && filteredApplications.length > 0 && (
          <div className="space-y-3 md:hidden">
            {filteredApplications.map((app) => {
              const snapshot = (app.candidate_snapshot || {}) as Record<string, any>;
              const name = app.candidate?.full_name || snapshot.full_name || 'Candidate';
              const headline = snapshot.headline || 'Sustainability Specialist';
              const location = snapshot.location || 'India';

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className="bg-white p-4 rounded-xl border border-kth-slate-200 space-y-2 cursor-pointer shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-kth-slate-900">{name}</h4>
                      <span className="text-xs text-kth-slate-500 line-clamp-1">{headline}</span>
                    </div>
                    {getStageBadge(app.stage)}
                  </div>
                  <div className="flex justify-between items-center text-xs text-kth-slate-600 border-t border-kth-slate-100 pt-2">
                    <span>{location.split(',')[0]}</span>
                    <span>{new Date(app.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Quick View Drawer */}
      <CandidateQuickView
        application={selectedApplication}
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        onApplicationUpdated={(updated) => {
          setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }}
      />
    </EmployerShell>
  );
};
