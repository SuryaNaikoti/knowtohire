import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateEducation } from '../../../lib/services/candidateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { BookOpen, Plus, Trash2, Edit2, Calendar, Save, X } from 'lucide-react';
import { ProfileDraftService } from '../../../lib/services/ProfileDraftService';
import { analyticsService } from '../../../lib/services/analyticsService';

export const Education: React.FC = () => {
  const { profile } = useAuth();
  const [education, setEducation] = useState<CandidateEducation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar / split form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<CandidateEducation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form Fields State
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await candidateService.getEducation(profile.id);
      setEducation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  // Load draft from centralized ProfileDraftService
  useEffect(() => {
    if (!profile) return;
    const draft = ProfileDraftService.getDraft('education', profile.id);
    if (draft) {
      setInstitution(draft.institution || '');
      setDegree(draft.degree || '');
      setFieldOfStudy(draft.fieldOfStudy || '');
      setStartDate(draft.startDate || '');
      setEndDate(draft.endDate || '');
      setDescription(draft.description || '');
      setSelectedEdu(draft.selectedEdu || null);
      setIsFormOpen(true);
    }
  }, [profile]);

  // Centralized Autosave Trigger
  useEffect(() => {
    if (!profile || !isFormOpen) return;
    ProfileDraftService.saveDraft('education', profile.id, {
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      description,
      selectedEdu
    });
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Autosave Triggered', moduleName: 'education' }
    });
  }, [profile, isFormOpen, institution, degree, fieldOfStudy, startDate, endDate, description, selectedEdu]);

  const handleAdd = () => {
    setSelectedEdu(null);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleEdit = (edu: CandidateEducation) => {
    setSelectedEdu(edu);
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setFieldOfStudy(edu.field_of_study || '');
    setStartDate(edu.start_date || '');
    setEndDate(edu.end_date || '');
    setDescription(edu.description || '');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    if (profile) {
      ProfileDraftService.clearDraft('education', profile.id);
    }
  };

  const handleDelete = async (eduId: string) => {
    if (!profile || !window.confirm('Remove this education record?')) return;
    setDeleting(eduId);
    setError('');
    setSuccess('');
    try {
      await candidateService.deleteEducation(profile.id, eduId);
      setSuccess('Education record removed successfully.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Education Deleted', recordId: eduId }
      });
      if (selectedEdu?.id === eduId) {
        setIsFormOpen(false);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Could not remove education record.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Form validations
    if (!institution.trim() || !degree.trim() || !fieldOfStudy.trim() || !startDate) {
      setError('Please fill in all required fields.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Missing fields' }
      });
      return;
    }

    if (endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date must precede graduation date.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Invalid date sequence' }
      });
      return;
    }

    // Duplicate entries validation check
    const isDuplicate = education.some(edu => 
      edu.id !== selectedEdu?.id &&
      edu.institution.toLowerCase().trim() === institution.toLowerCase().trim() &&
      edu.degree.toLowerCase().trim() === degree.toLowerCase().trim() &&
      edu.field_of_study?.toLowerCase().trim() === fieldOfStudy.toLowerCase().trim()
    );
    if (isDuplicate) {
      setError('An education record with this institution, degree, and field of study already exists.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Duplicate entry' }
      });
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        id: selectedEdu?.id,
        candidate_id: profile.id,
        institution: institution.trim(),
        degree: degree.trim(),
        field_of_study: fieldOfStudy.trim(),
        start_date: startDate,
        end_date: endDate || null,
        description: description.trim(),
      };

      const ok = await candidateService.upsertEducation(payload as any);
      if (ok) {
        setSuccess('Education record updated successfully.');
        setIsFormOpen(false);
        ProfileDraftService.clearDraft('education', profile.id);
        
        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: selectedEdu ? 'Education Edited' : 'Education Added' }
        });
        
        fetchData();
      } else {
        setError('Failed to write record to DB.');
        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: 'Save Failed', reason: 'Database error' }
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not write education to Supabase.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Save Failed', reason: err.message }
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && education.length === 0) return <Loading label="Loading education..." />;

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen p-2 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors animate-fade-in">
      {/* Redesigned Executive Header Block */}
      <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Academic Qualifications & Education
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your verified degrees, diplomas, and academic credentials.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center px-4 py-2.5 rounded-xl shadow-xs">
            <Plus className="w-4 h-4" /> Add Education
          </Button>
        )}
      </div>

      {error && <Alert type="error" title="Error Details">{error}</Alert>}
      {success && <Alert type="success" title="Action Completed">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Education Timeline */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {education.length === 0 ? (
            <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-bold text-gray-600">No education history added yet.</p>
              <p className="text-xs text-gray-400 font-medium">Adding education increases profile credibility and matching indices with employers.</p>
              <Button onClick={handleAdd} className="text-xs font-bold mx-auto">
                Add First Education Record
              </Button>
            </div>
          ) : (
            <div className="relative border-l-2 border-solid border-gray-100 pl-6 ml-3 space-y-8">
              {education.map((edu) => (
                <div key={edu.id} className="relative">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-solid border-primary flex items-center justify-center z-10" />
                  
                  <Card className="bg-white hover:border-gray-300 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">
                            {edu.degree} in {edu.field_of_study}
                          </h3>
                          <p className="text-xs font-bold text-gray-700">{edu.institution}</p>
                          <p className="text-[11px] text-gray-450 font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {edu.start_date ? new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} -{' '}
                            {edu.end_date
                              ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                              : 'Present'}
                          </p>
                          {edu.description && (
                            <p className="text-xs text-gray-650 font-medium mt-3 whitespace-pre-wrap leading-relaxed">
                              {edu.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEdit(edu)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                            aria-label="Edit education"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(edu.id)}
                            disabled={deleting === edu.id}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                            aria-label="Delete education"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Split View Compact Form Panel */}
        {isFormOpen && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="font-heading font-black text-gray-900 text-sm">
                {selectedEdu ? 'Modify Education' : 'Create Education'}
              </h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <Input
                label="School / Institution Name"
                placeholder="e.g. Stanford University"
                required
                maxLength={255}
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />

              <Input
                label="Degree / Diploma"
                placeholder="e.g. Bachelor of Science"
                required
                maxLength={255}
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />

              <Input
                label="Field of Study"
                placeholder="e.g. Computer Science"
                required
                maxLength={255}
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Graduation Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 tracking-wide">
                  Description / Activities
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[100px] outline-none"
                  placeholder="Honors, relevant coursework, major projects..."
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-solid border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  disabled={saving}
                  size="sm"
                  className="text-xs font-bold bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  size="sm"
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
