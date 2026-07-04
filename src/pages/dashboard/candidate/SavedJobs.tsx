import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { jobsService } from '../../../lib/services/jobsService';
import type { Job, JobSkill } from '../../../lib/services/jobsService';
import { JobCard } from '../../../components/dashboard/JobCard';
import { Badge } from '../../../components/ui/Badge';
import { Loading } from '../../../components/ui/Loading';
import { Modal } from '../../../components/ui/Modal';
import { MapPin, DollarSign, Calendar, Bookmark } from 'lucide-react';

export const SavedJobs: React.FC = () => {
  const { profile } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Job details modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<JobSkill[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchSavedJobs = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await jobsService.getSavedJobs(profile.id);
      setSavedJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [profile]);

  const handleToggleRemove = async (jobId: string) => {
    if (!profile) return;
    try {
      // Toggle save (removes since it already exists)
      await jobsService.toggleSaveJob(profile.id, jobId);
      setSavedJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async (job: Job) => {
    setSelectedJob(job);
    setDetailModalOpen(true);
    setLoadingDetails(true);

    try {
      const result = await jobsService.getJobDetails(job.id);
      if (result) {
        setSelectedSkills(result.skills);
      }
      await jobsService.incrementViewCount(job.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-primary fill-blue-50" /> Bookmarked Careers
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Your saved vacancies, carbon/ESG compliance, patent writing openings, and consulting leads.
          </p>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading saved vacancies..." />
      ) : savedJobs.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
          <Bookmark className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-600">You haven't bookmarked any vacancies yet.</p>
          <p className="text-xs text-gray-400 font-medium">Browse active listings on the job board to save leads for application matching.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={true}
              onToggleSave={() => handleToggleRemove(job.id)}
              onViewDetails={() => handleViewDetails(job)}
              showSaveButton={true}
            />
          ))}
        </div>
      )}

      {/* Details modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedJob?.title || 'Vacancy Details'}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6 pr-1 animate-fade-in-up">
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

              {selectedJob.company_logo && (
                <img
                  src={selectedJob.company_logo}
                  alt={`${selectedJob.company_name} Logo`}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 border-solid shrink-0"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150 border-solid text-xs font-semibold text-gray-655">
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

            <div className="space-y-3 border-t border-gray-100 border-solid pt-4">
              <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">Required Skills</h4>
              {loadingDetails ? (
                <p className="text-xs text-gray-400 font-semibold italic">Loading required skills...</p>
              ) : selectedSkills.length === 0 ? (
                <p className="text-xs text-gray-400 font-semibold italic">No direct relational skills mapped.</p>
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

            <div className="border-t border-gray-150 border-solid pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[10px] text-gray-400 font-semibold">Listing reference: {selectedJob.slug}</span>
              <button
                onClick={() => alert('Applications module is scheduled for Sprint 5.')}
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
