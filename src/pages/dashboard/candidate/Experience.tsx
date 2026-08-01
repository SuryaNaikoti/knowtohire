import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateExperience } from '../../../lib/services/candidateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Briefcase, Plus, Calendar, MapPin, Trash2, Edit2, Save, X } from 'lucide-react';
import { ProfileDraftService } from '../../../lib/services/ProfileDraftService';
import { analyticsService } from '../../../lib/services/analyticsService';

export const Experience: React.FC = () => {
  const { profile } = useAuth();
  const [experience, setExperience] = useState<CandidateExperience[]>([]);
  const [loading, setLoading] = useState(true);

  // Form split panel states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState<CandidateExperience | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const expData = await candidateService.getExperience(profile.id);
      setExperience(expData);
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
    const draft = ProfileDraftService.getDraft('experience', profile.id);
    if (draft) {
      setCompanyName(draft.companyName || '');
      setRoleTitle(draft.roleTitle || '');
      setLocation(draft.location || '');
      setStartDate(draft.startDate || '');
      setEndDate(draft.endDate || '');
      setIsCurrent(draft.isCurrent ?? false);
      setDescription(draft.description || '');
      setSelectedExp(draft.selectedExp || null);
      setIsFormOpen(true);
    }
  }, [profile]);

  // Centralized Autosave Trigger
  useEffect(() => {
    if (!profile || !isFormOpen) return;
    ProfileDraftService.saveDraft('experience', profile.id, {
      companyName,
      roleTitle,
      location,
      startDate,
      endDate,
      isCurrent,
      description,
      selectedExp
    });
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Autosave Triggered', moduleName: 'experience' }
    });
  }, [profile, isFormOpen, companyName, roleTitle, location, startDate, endDate, isCurrent, description, selectedExp]);

  const handleAddNewExp = () => {
    setSelectedExp(null);
    setCompanyName('');
    setRoleTitle('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleEditExp = (exp: CandidateExperience) => {
    setSelectedExp(exp);
    setCompanyName(exp.company_name);
    setRoleTitle(exp.role_title);
    setLocation(exp.location || '');
    setStartDate(exp.start_date);
    setEndDate(exp.end_date || '');
    setIsCurrent(exp.is_current);
    setDescription(exp.description || '');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    if (profile) {
      ProfileDraftService.clearDraft('experience', profile.id);
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience record? This action cannot be undone.')) {
      return;
    }
    setDeleting(id);
    setError('');
    setSuccess('');
    try {
      await candidateService.deleteExperience(profile!.id, id);
      setSuccess('Experience record removed successfully.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Experience Deleted', recordId: id }
      });
      if (selectedExp?.id === id) {
        setIsFormOpen(false);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Could not remove experience record.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validation checks
    if (!companyName.trim() || !roleTitle.trim() || !startDate) {
      setError('Please fill in all required fields.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Missing fields' }
      });
      return;
    }

    if (!isCurrent && !endDate) {
      setError('Please enter an end date or select "I currently work in this role".');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Missing end date' }
      });
      return;
    }

    if (endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date must precede the end date.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Validation Failed', reason: 'Invalid date sequence' }
      });
      return;
    }

    // Duplicate entries check
    const isDuplicate = experience.some(exp =>
      exp.id !== selectedExp?.id &&
      exp.company_name.toLowerCase().trim() === companyName.toLowerCase().trim() &&
      exp.role_title.toLowerCase().trim() === roleTitle.toLowerCase().trim() &&
      exp.start_date === startDate
    );
    if (isDuplicate) {
      setError('An experience record with this company, role, and start date already exists.');
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
        id: selectedExp?.id,
        candidate_id: profile.id,
        company_name: companyName.trim(),
        role_title: roleTitle.trim(),
        location: location.trim(),
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
        is_current: isCurrent,
        description: description.trim(),
      };

      const ok = await candidateService.upsertExperience(payload as any);
      if (ok) {
        setSuccess('Experience saved successfully.');
        setIsFormOpen(false);
        ProfileDraftService.clearDraft('experience', profile.id);

        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: selectedExp ? 'Experience Edited' : 'Experience Added' }
        });

        fetchData();
      } else {
        setError('Failed to write record to database.');
        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: 'Save Failed', reason: 'Database error' }
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not write experience details.');
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Save Failed', reason: err.message }
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && experience.length === 0) return <Loading label="Loading work experience..." />;

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen p-2 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors animate-fade-in">
      {/* Redesigned Executive Header Block */}
      <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Work Experience Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your verified employment history and technical role progression.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleAddNewExp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center px-4 py-2.5 rounded-xl shadow-xs">
            <Plus className="w-4 h-4" /> Add Experience
          </Button>
        )}
      </div>

      {error && <Alert type="error" title="Error Details">{error}</Alert>}
      {success && <Alert type="success" title="Action Completed">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Professional Timeline */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {experience.length === 0 ? (
            <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-bold text-gray-600">No work experience listed yet.</p>
              <p className="text-xs text-gray-400 font-medium">Add past roles to verify your skill competencies.</p>
              <Button onClick={handleAddNewExp} className="text-xs font-bold mx-auto">
                Add Professional Role
              </Button>
            </div>
          ) : (
            <div className="relative border-l-2 border-solid border-gray-100 pl-6 ml-3 space-y-8">
              {experience.map((exp) => (
                <div key={exp.id} className="relative">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-solid border-primary flex items-center justify-center z-10" />
                  
                  <Card className="bg-white hover:border-gray-300 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">
                            {exp.role_title}
                          </h3>
                          <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <span>{exp.company_name}</span>
                            {exp.is_current && (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                Current
                              </span>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-450 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} -{' '}
                              {exp.is_current
                                ? 'Present'
                                : exp.end_date
                                ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                : 'N/A'}
                            </span>
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {exp.location}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-650 font-medium mt-3 whitespace-pre-wrap leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditExp(exp)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                            aria-label="Edit experience"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExp(exp.id)}
                            disabled={deleting === exp.id}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                            aria-label="Delete experience"
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
                {selectedExp ? 'Modify Experience' : 'Create Experience'}
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
                label="Company Name"
                placeholder="e.g. Google India"
                required
                maxLength={255}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <Input
                label="Role Title"
                placeholder="e.g. Senior Frontend Architect"
                required
                maxLength={255}
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />

              <Input
                label="Location (City, Country / Remote)"
                placeholder="e.g. Hyderabad, India / Remote"
                maxLength={150}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                  label="End Date"
                  type="date"
                  disabled={isCurrent}
                  value={isCurrent ? '' : endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <label className="flex items-center space-x-2.5 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => {
                    setIsCurrent(e.target.checked);
                    if (e.target.checked) setEndDate('');
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">I currently work in this role</span>
              </label>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 tracking-wide">
                  Description & Achievements
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[100px] outline-none"
                  placeholder="Describe your achievements, technical tools, and highlights..."
                  maxLength={2000}
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

export default Experience;
