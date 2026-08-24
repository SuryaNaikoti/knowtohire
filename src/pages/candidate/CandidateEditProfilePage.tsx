import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { candidateProfileService } from '@/services/candidateProfileService';
import { useAuth } from '@/context/AuthContext';
import { CandidateFullProfile, CandidateExperienceItem, CandidateEducationItem } from '@/services/types';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface CandidateEditProfilePageProps {
  onNavigate?: (path: string) => void;
}

export function CandidateEditProfilePage({ onNavigate }: CandidateEditProfilePageProps) {
  const { refreshProfile } = useAuth();
  const [, setProfile] = useState<CandidateFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'education' | 'skills'>('basic');

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formHeadline, setFormHeadline] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSkillsText, setFormSkillsText] = useState('');
  const [formCertificationsText, setFormCertificationsText] = useState('');
  const [formExperience, setFormExperience] = useState<CandidateExperienceItem[]>([]);
  const [formEducation, setFormEducation] = useState<CandidateEducationItem[]>([]);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const res = await candidateProfileService.getMyCandidateProfile();
    if (res.data) {
      setProfile(res.data);
      setFormFullName(res.data.fullName || '');
      setFormHeadline(res.data.headline || '');
      setFormLocation(res.data.location || '');
      setFormPhone(res.data.phone || '');
      setFormBio(res.data.bio || '');
      setFormSkillsText((res.data.skills || []).join(', '));
      setFormCertificationsText((res.data.certifications || []).join('\n'));
      setFormExperience(res.data.experience ? JSON.parse(JSON.stringify(res.data.experience)) : []);
      setFormEducation(res.data.education ? JSON.parse(JSON.stringify(res.data.education)) : []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/candidate/profile');
    } else {
      window.history.pushState({}, '', '/candidate/profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    setFormExperience(prev => [
      ...prev,
      {
        title: '',
        company: '',
        period: '2020 – Present',
        location: formLocation || 'Hyderabad, India',
        description: '',
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setFormExperience(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExperience = (index: number, field: keyof CandidateExperienceItem, value: string) => {
    setFormExperience(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  // Education handlers
  const handleAddEducation = () => {
    setFormEducation(prev => [
      ...prev,
      {
        degree: '',
        qualification: '',
        institution: '',
        graduation_year: 'Completed',
        year: 'Completed',
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setFormEducation(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEducation = (index: number, field: keyof CandidateEducationItem, value: string) => {
    setFormEducation(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'degree') updated.qualification = value;
      if (field === 'graduation_year') updated.year = value;
      return updated;
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formFullName.trim() || formFullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }
    if (!formHeadline.trim() || formHeadline.trim().length < 3) {
      errors.headline = 'Professional Headline is required.';
    }
    if (!formLocation.trim()) {
      errors.location = 'Location is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormFieldErrors(errors);
      setActiveTab('basic');
      return;
    }

    const parsedSkills = formSkillsText
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const parsedCerts = formCertificationsText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const cleanedExperience = formExperience.filter(e => e.title.trim() || e.company.trim());
    const cleanedEducation = formEducation.filter(e => (e.degree && e.degree.trim()) || e.institution.trim());

    setFormFieldErrors({});
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const res = await candidateProfileService.updateMyCandidateProfile({
      fullName: formFullName.trim(),
      headline: formHeadline.trim(),
      location: formLocation.trim(),
      phone: formPhone.trim() || null,
      bio: formBio.trim() || null,
      skills: parsedSkills,
      certifications: parsedCerts,
      experience: cleanedExperience,
      education: cleanedEducation,
    });

    if (res.error) {
      setSaveError(res.error.message || 'Failed to update profile. Please try again.');
      setIsSaving(false);
      return;
    }

    if (res.data) {
      setProfile(res.data);
      await refreshProfile();
      setSaveSuccess(true);
      setIsSaving(false);

      setTimeout(() => {
        handleBack();
      }, 1000);
    }
  };

  return (
    <CandidateShell title="Edit Candidate Profile" currentPath="/candidate/profile">
      <div className="max-w-5xl mx-auto space-y-6 font-sans">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2.5 rounded-xl border border-kth-slate-200 bg-white text-kth-slate-600 hover:text-kth-slate-900 hover:border-kth-slate-300 transition shadow-sm"
              title="Return to My Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-kth-slate-900">
                Edit Candidate Profile
              </h1>
              <p className="text-sm text-kth-slate-500">
                Update your professional profile information, experience, education, and skills.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-profile-form"
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              className="flex-1 sm:flex-none bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-semibold"
            >
              {isSaving ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </div>
        </div>

        {saveSuccess && (
          <Alert variant="success" title="Profile Saved Successfully!">
            Your candidate profile has been updated and synchronized with your account. Returning to profile...
          </Alert>
        )}

        {saveError && (
          <Alert variant="error" title="Failed to Save Profile">
            {saveError}
          </Alert>
        )}

        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-kth-primary-600 mx-auto mb-3" />
            <p className="text-kth-slate-500 font-medium">Loading profile information...</p>
          </Card>
        ) : (
          <form id="edit-profile-form" onSubmit={handleSave} className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-kth-slate-200 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 ${
                  activeTab === 'basic'
                    ? 'bg-kth-primary-50 text-kth-primary-700 shadow-sm border border-kth-primary-200'
                    : 'text-kth-slate-600 hover:bg-kth-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 ${
                  activeTab === 'experience'
                    ? 'bg-kth-primary-50 text-kth-primary-700 shadow-sm border border-kth-primary-200'
                    : 'text-kth-slate-600 hover:bg-kth-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Work Experience ({formExperience.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 ${
                  activeTab === 'education'
                    ? 'bg-kth-primary-50 text-kth-primary-700 shadow-sm border border-kth-primary-200'
                    : 'text-kth-slate-600 hover:bg-kth-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Education ({formEducation.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 ${
                  activeTab === 'skills'
                    ? 'bg-kth-primary-50 text-kth-primary-700 shadow-sm border border-kth-primary-200'
                    : 'text-kth-slate-600 hover:bg-kth-slate-100'
                }`}
              >
                <Award className="w-4 h-4" />
                Skills & Certifications
              </button>
            </div>

            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <Card className="p-6 md:p-8 space-y-6">
                <div className="border-b border-kth-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-kth-slate-900">Personal & Contact Details</h2>
                  <p className="text-xs text-kth-slate-500">Your core contact information and professional headline.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formFullName}
                      onChange={e => {
                        setFormFullName(e.target.value);
                        if (formFieldErrors.fullName) setFormFieldErrors(prev => ({ ...prev, fullName: '' }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition ${
                        formFieldErrors.fullName ? 'border-red-500 bg-red-50/20' : 'border-kth-slate-300'
                      }`}
                      placeholder="e.g. Surya Naikoti"
                    />
                    {formFieldErrors.fullName && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formFieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700 mb-2">
                      Professional Headline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formHeadline}
                      onChange={e => {
                        setFormHeadline(e.target.value);
                        if (formFieldErrors.headline) setFormFieldErrors(prev => ({ ...prev, headline: '' }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition ${
                        formFieldErrors.headline ? 'border-red-500 bg-red-50/20' : 'border-kth-slate-300'
                      }`}
                      placeholder="e.g. Freelance Web Developer & UI/UX Designer"
                    />
                    {formFieldErrors.headline && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formFieldErrors.headline}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={e => {
                        setFormLocation(e.target.value);
                        if (formFieldErrors.location) setFormFieldErrors(prev => ({ ...prev, location: '' }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition ${
                        formFieldErrors.location ? 'border-red-500 bg-red-50/20' : 'border-kth-slate-300'
                      }`}
                      placeholder="e.g. Hyderabad, Telangana"
                    />
                    {formFieldErrors.location && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formFieldErrors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700 mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    rows={4}
                    value={formBio}
                    onChange={e => setFormBio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition"
                    placeholder="Provide a brief summary of your core competencies, technical background, and achievements..."
                  />
                </div>
              </Card>
            )}

            {/* TAB 2: WORK EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-kth-slate-900">Work Experience</h2>
                    <p className="text-xs text-kth-slate-500">Add or modify your employment and project history.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddExperience}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="border-kth-primary-600 text-kth-primary-600 hover:bg-kth-primary-50"
                  >
                    Add Experience
                  </Button>
                </div>

                {formExperience.length === 0 ? (
                  <Card className="p-8 text-center border-dashed border-2 border-kth-slate-200">
                    <Briefcase className="w-10 h-10 text-kth-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-kth-slate-700">No work experience entries added.</p>
                    <p className="text-xs text-kth-slate-400 mb-4">Click below to add your first work experience record.</p>
                    <Button type="button" size="sm" onClick={handleAddExperience} leftIcon={<Plus className="w-4 h-4" />}>
                      Add Work Experience
                    </Button>
                  </Card>
                ) : (
                  formExperience.map((exp, idx) => (
                    <Card key={idx} className="p-6 space-y-4 relative border-l-4 border-l-kth-primary-600">
                      <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                        <span className="font-bold text-sm text-kth-slate-800 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-kth-primary-600" />
                          Experience #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Remove this experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Job Title / Role</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={e => handleUpdateExperience(idx, 'title', e.target.value)}
                            placeholder="e.g. Freelance Web Developer & UI/UX Designer"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Company / Organization</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={e => handleUpdateExperience(idx, 'company', e.target.value)}
                            placeholder="e.g. Self-Employed / Client Engagements"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Time Period</label>
                          <input
                            type="text"
                            value={exp.period || ''}
                            onChange={e => handleUpdateExperience(idx, 'period', e.target.value)}
                            placeholder="e.g. 2020 – Present"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location || ''}
                            onChange={e => handleUpdateExperience(idx, 'location', e.target.value)}
                            placeholder="e.g. Hyderabad, India"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Description & Deliverables</label>
                        <textarea
                          rows={3}
                          value={exp.description || ''}
                          onChange={e => handleUpdateExperience(idx, 'description', e.target.value)}
                          placeholder="Describe your key achievements, deliverables, and responsibilities..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-kth-slate-900">Education & Qualifications</h2>
                    <p className="text-xs text-kth-slate-500">Add or modify your degrees and academic credentials.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEducation}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="border-kth-primary-600 text-kth-primary-600 hover:bg-kth-primary-50"
                  >
                    Add Education
                  </Button>
                </div>

                {formEducation.length === 0 ? (
                  <Card className="p-8 text-center border-dashed border-2 border-kth-slate-200">
                    <GraduationCap className="w-10 h-10 text-kth-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-kth-slate-700">No education entries added.</p>
                    <p className="text-xs text-kth-slate-400 mb-4">Click below to add your academic credentials.</p>
                    <Button type="button" size="sm" onClick={handleAddEducation} leftIcon={<Plus className="w-4 h-4" />}>
                      Add Education
                    </Button>
                  </Card>
                ) : (
                  formEducation.map((edu, idx) => (
                    <Card key={idx} className="p-6 space-y-4 relative border-l-4 border-l-kth-accent-cyan">
                      <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                        <span className="font-bold text-sm text-kth-slate-800 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-kth-accent-cyan" />
                          Qualification #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Remove this education entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Degree / Course</label>
                          <input
                            type="text"
                            value={edu.degree || edu.qualification || ''}
                            onChange={e => handleUpdateEducation(idx, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science (Computer Science)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">Graduation Year / Status</label>
                          <input
                            type="text"
                            value={edu.graduation_year || edu.year || ''}
                            onChange={e => handleUpdateEducation(idx, 'graduation_year', e.target.value)}
                            placeholder="e.g. Completed / 2022"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-kth-slate-700 mb-1">University / Board / Institution</label>
                          <input
                            type="text"
                            value={edu.institution || ''}
                            onChange={e => handleUpdateEducation(idx, 'institution', e.target.value)}
                            placeholder="e.g. Acharya Nagarjuna University"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: SKILLS & CERTS */}
            {activeTab === 'skills' && (
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700">
                      Key Technical & Professional Skills
                    </label>
                    <span className="text-xs text-kth-slate-400">Separate skills with commas or newlines</span>
                  </div>
                  <textarea
                    rows={4}
                    value={formSkillsText}
                    onChange={e => setFormSkillsText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition font-mono"
                    placeholder="e.g. React.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, UI/UX Design, Figma, Project Delivery, Client Communication"
                  />
                  {formSkillsText.trim() && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formSkillsText
                        .split(/[,;\n]/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0)
                        .map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-kth-primary-50 text-kth-primary-700 text-xs font-semibold rounded-lg border border-kth-primary-200"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-kth-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-kth-slate-700">
                      Professional Certifications
                    </label>
                    <span className="text-xs text-kth-slate-400">Enter one certification per line</span>
                  </div>
                  <textarea
                    rows={3}
                    value={formCertificationsText}
                    onChange={e => setFormCertificationsText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-kth-slate-300 text-sm focus:ring-2 focus:ring-kth-primary-500 focus:outline-none transition"
                    placeholder="e.g. AWS Certified Solutions Architect&#10;Certified Kubernetes Administrator"
                  />
                </div>
              </Card>
            )}

            {/* Bottom Save Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-kth-slate-200">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-semibold"
              >
                {isSaving ? 'Saving Changes...' : 'Save All Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </CandidateShell>
  );
}
