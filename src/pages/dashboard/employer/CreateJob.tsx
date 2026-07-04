import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { jobsService } from '../../../lib/services/jobsService';
import type { Job, JobSkill } from '../../../lib/services/jobsService';
import { JobForm } from '../../../components/dashboard/JobForm';
import { Loading } from '../../../components/ui/Loading';

export const CreateJob: React.FC = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [skillsToEdit, setSkillsToEdit] = useState<JobSkill[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!editId) {
        setJobToEdit(null);
        setSkillsToEdit(null);
        return;
      }
      try {
        setLoading(true);
        const result = await jobsService.getJobDetails(editId);
        if (result) {
          setJobToEdit(result.job);
          setSkillsToEdit(result.skills);
        } else {
          // Job not found or not belonging to the company
          navigate('/dashboard/employer/jobs');
        }
      } catch (err) {
        console.error(err);
        navigate('/dashboard/employer/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [editId, navigate]);

  const handleSubmitSuccess = () => {
    navigate('/dashboard/employer/jobs');
  };

  const handleCancel = () => {
    navigate('/dashboard/employer/jobs');
  };

  if (loading) {
    return <Loading label="Loading vacancy configurations..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
          {editId ? 'Modify Vacancy Posting' : 'Post New Vacancy'}
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          {editId
            ? 'Update job descriptions, salary boundaries, deadlines, and skill matching constraints.'
            : 'Register a new vacancy on the dashboard, configure matching tags, and submit for moderation.'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 border-solid rounded-2xl p-6 shadow-sm">
        <JobForm
          jobToEdit={jobToEdit}
          skillsToEdit={skillsToEdit}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};
