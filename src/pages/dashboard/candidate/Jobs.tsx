import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { jobsService } from '../../../lib/services/jobsService';
import type { Job, JobFilter, JobSkill } from '../../../lib/services/jobsService';
import { JobCard } from '../../../components/dashboard/JobCard';
import { JobFilterSidebar } from '../../../components/dashboard/JobFilterSidebar';
import { Badge } from '../../../components/ui/Badge';
import { Loading } from '../../../components/ui/Loading';
import { Modal } from '../../../components/ui/Modal';
import { MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react';

export const Jobs: React.FC = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilter>({});
  
  // Job detail modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<JobSkill[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchJobs = async (currentFilters: JobFilter) => {
    try {
      setLoading(true);
      const data = await jobsService.getPublishedJobs(currentFilters);
      setJobs(data);

      if (profile && profile.role === 'candidate') {
        const saves = await jobsService.getSavedJobs(profile.id);
        setSavedIds(saves.map(s => s.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filters);
  }, [filters, profile]);

  const handleFilterChange = (newFilters: JobFilter) => {
    setFilters(newFilters);
  };

  const handleToggleSave = async (jobId: string) => {
    if (!profile) {
      alert('Please log in to save job postings.');
      return;
    }
    try {
      const isSaved = await jobsService.toggleSaveJob(profile.id, jobId);
      if (isSaved) {
        setSavedIds([...savedIds, jobId]);
      } else {
        setSavedIds(savedIds.filter(id => id !== jobId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async (job: Job) => {
    setSelectedJob(job);
    setDetailModalOpen(true);
    setLoadingDetails(true);

    try {
      // 1. Fetch full details and relational skills
      const result = await jobsService.getJobDetails(job.id);
      if (result) {
        setSelectedSkills(result.skills);
      }

      // 2. Increment view count
      await jobsService.incrementViewCount(job.id);
      
      // Update local views count in state
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, view_count: j.view_count + 1 } : j));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="relative z-10 space-y-2">
          <Badge className="bg-white/20 text-white border-none py-0.5" size="sm">Explore Careers</Badge>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-tight">
            Discover Verified Career Vacancies
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-xl">
            Audit domains in Patent, ESG, Consulting, and Research to connect with corporate employers.
          </p>
        </div>
      </div>

      {/* Main Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Filter Sidebar */}
        <div className="lg:col-span-1">
          <JobFilterSidebar initialFilters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Right Side: Jobs List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">
              {loading ? 'Searching postings...' : `${jobs.length} jobs matching criteria`}
            </h2>
          </div>

          {loading ? (
            <Loading label="Filtering vacancy intelligence..." />
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No jobs match your search parameters.</p>
              <p className="text-xs text-gray-400 font-medium">Try resetting filters or adjusting salary minimums to broaden matching fields.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedIds.includes(job.id)}
                  onToggleSave={() => handleToggleSave(job.id)}
                  onViewDetails={() => handleViewDetails(job)}
                  showSaveButton={profile?.role === 'candidate'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedJob?.title || 'Vacancy Details'}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6 pr-1 animate-fade-in-up">
            {/* Header info card */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-100 border-solid">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="primary" size="sm">{selectedJob.career_domain} Domain</Badge>
                  <Badge variant="secondary" size="sm">{selectedJob.employment_type}</Badge>
                  <Badge variant="neutral" size="sm">{selectedJob.location_type}</Badge>
                </div>
                <h3 className="font-heading font-black text-gray-900 text-lg leading-tight">
                  {selectedJob.title}
                </h3>
                <p className="text-xs font-semibold text-gray-500">
                  Posted by <span className="font-bold text-gray-800">{selectedJob.company_name}</span>
                </p>
              </div>

              {/* Company Logo in Detail */}
              {selectedJob.company_logo && (
                <img
                  src={selectedJob.company_logo}
                  alt={`${selectedJob.company_name} Logo`}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 border-solid shrink-0"
                />
              )}
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150 border-solid text-xs font-semibold text-gray-650">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workplace</p>
                <div className="flex items-center gap-1 text-gray-850"><MapPin className="w-4 h-4 text-gray-400" /> {selectedJob.city}{selectedJob.state ? `, ${selectedJob.state}` : ''}, {selectedJob.country}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Salary Range</p>
                <div className="flex items-center gap-1 text-gray-850">
                  <DollarSign className="w-4 h-4 text-gray-400" /> 
                  <span>
                    {selectedJob.salary_visible
                      ? `${selectedJob.salary_currency} ${(selectedJob.salary_min || 0).toLocaleString()} - ${(selectedJob.salary_max || 0).toLocaleString()}`
                      : 'Undisclosed'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deadline</p>
                <div className="flex items-center gap-1 text-gray-850">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{selectedJob.application_deadline ? new Date(selectedJob.application_deadline).toLocaleDateString() : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">Job Description</h4>
                <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">Requirements</h4>
                <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedJob.requirements}
                </p>
              </div>

              {selectedJob.benefits && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">Benefits & Perks</h4>
                  <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
                    {selectedJob.benefits}
                  </p>
                </div>
              )}
            </div>

            {/* Relational Required Skills */}
            <div className="space-y-3 border-t border-gray-100 border-solid pt-4">
              <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">Relational Skills Requirements</h4>
              {loadingDetails ? (
                <p className="text-xs text-gray-400 font-semibold italic">Loading required skills...</p>
              ) : selectedSkills.length === 0 ? (
                <p className="text-xs text-gray-400 font-semibold italic">No direct relational skills mapped to this vacancy.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill.id} variant="primary" size="md">
                      {skill.skill_name} ({skill.years_experience_required}y+, {skill.required_level})
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Action bar */}
            <div className="border-t border-gray-150 border-solid pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[10px] text-gray-400 font-semibold">Listing reference: {selectedJob.slug}</span>
              <button
                onClick={() => alert('Applications module is scheduled for Sprint 5. Resume syncing and profile indices are ready for matching.')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Apply for Position
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
