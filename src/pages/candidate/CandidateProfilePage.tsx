import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import {
  candidateProfileService,
  CandidateFullProfile,
} from '@/services';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Edit,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
  FileText,
} from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const { refreshProfile } = useAuth();

  // ─── Profile Data States ───────────────────────────────────────────────────
  const [profile, setProfile] = useState<CandidateFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ─── Edit Modal States ─────────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ─── Form Controlled States ────────────────────────────────────────────────
  const [formFullName, setFormFullName] = useState('');
  const [formHeadline, setFormHeadline] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});

  // ─── Load Candidate Profile from Supabase ──────────────────────────────────
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const res = await candidateProfileService.getMyCandidateProfile();

    if (res.error) {
      setLoadError(res.error.message);
      setProfile(null);
    } else if (res.data) {
      setProfile(res.data);
      // Pre-fill edit modal form states
      setFormFullName(res.data.fullName || '');
      setFormHeadline(res.data.headline || '');
      setFormLocation(res.data.location || '');
      setFormPhone(res.data.phone || '');
      setFormBio(res.data.bio || '');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Open Edit Modal with fresh synced data
  const handleOpenEdit = () => {
    if (profile) {
      setFormFullName(profile.fullName || '');
      setFormHeadline(profile.headline || '');
      setFormLocation(profile.location || '');
      setFormPhone(profile.phone || '');
      setFormBio(profile.bio || '');
    }
    setSaveError(null);
    setSaveSuccess(false);
    setFormFieldErrors({});
    setIsEditOpen(true);
  };

  // ─── Handle Form Submission & Supabase Persistence ────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-Side Field Validation
    const errors: Record<string, string> = {};
    if (!formFullName.trim() || formFullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }
    if (!formHeadline.trim() || formHeadline.trim().length < 3) {
      errors.headline = 'Professional Headline is required (e.g. ESG Specialist).';
    }
    if (!formLocation.trim()) {
      errors.location = 'Location is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormFieldErrors(errors);
      return;
    }

    setFormFieldErrors({});
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // 2. Persist directly to Supabase via candidateProfileService
    const res = await candidateProfileService.updateMyCandidateProfile({
      fullName: formFullName.trim(),
      headline: formHeadline.trim(),
      location: formLocation.trim(),
      phone: formPhone.trim() || null,
      bio: formBio.trim() || null,
    });

    if (res.error) {
      setSaveError(res.error.message || 'Failed to update profile. Please try again.');
      setIsSaving(false);
      return;
    }

    if (res.data) {
      // 3. Update local state and reconcile with AuthContext
      setProfile(res.data);
      await refreshProfile();
      setSaveSuccess(true);
      setIsSaving(false);

      // Auto-close modal smoothly after brief confirmation
      setTimeout(() => {
        setIsEditOpen(false);
        setSaveSuccess(false);
      }, 1200);
    }
  };

  // Helper for Initials
  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <CandidateShell title="My Candidate Profile" currentPath="/candidate/profile">
      <div className="space-y-6 font-sans">
        {/* ─── Loading State Skeletons ───────────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-kth-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-kth-slate-200" />
                <div className="space-y-2">
                  <div className="h-6 bg-kth-slate-200 rounded w-48" />
                  <div className="h-4 bg-kth-slate-100 rounded w-64" />
                </div>
              </div>
              <div className="h-9 bg-kth-slate-200 rounded w-28" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 space-y-3">
              <div className="h-5 bg-kth-slate-200 rounded w-40" />
              <div className="h-4 bg-kth-slate-100 rounded w-full" />
              <div className="h-4 bg-kth-slate-100 rounded w-3/4" />
            </div>
          </div>
        )}

        {/* ─── Error Alert with Retry ────────────────────────────────────────── */}
        {!isLoading && loadError && (
          <Alert variant="error" title="Unable to Load Candidate Profile">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProfile}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* ─── Real Profile Content ──────────────────────────────────────────── */}
        {!isLoading && profile && (
          <>
            {/* Profile Header Summary */}
            <Card className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
                    {getInitials(profile.fullName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h1 className="font-display text-2xl font-extrabold text-kth-slate-900">
                        {profile.fullName || 'Candidate'}
                      </h1>
                      <Badge variant="emerald" hasPulse>
                        {profile.employmentPreference || 'Available for Hire'}
                      </Badge>
                      {profile.profileCompletionPct !== undefined && (
                        <span className="text-xs font-mono font-bold text-kth-primary-700 bg-kth-primary-50 px-2 py-0.5 rounded border border-kth-primary-100">
                          {profile.profileCompletionPct}% Complete
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-kth-slate-700 mb-1">
                      {profile.headline || 'No professional headline added yet'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-kth-slate-500 flex-wrap">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-kth-slate-400" />
                          {profile.location}
                        </span>
                      )}
                      {profile.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-kth-slate-400" />
                          {profile.email}
                        </span>
                      )}
                      {profile.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-kth-slate-400" />
                          {profile.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={handleOpenEdit}
                  className="shrink-0"
                >
                  Edit Profile
                </Button>
              </div>
            </Card>

            {/* Professional Summary Section */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-bold text-base text-kth-slate-900">
                  Professional Summary
                </h3>
                {profile.domainSpecialization && (
                  <Badge variant="cyan" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    {profile.domainSpecialization}
                  </Badge>
                )}
              </div>
              {profile.bio ? (
                <p className="text-sm text-kth-slate-700 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              ) : (
                <div className="text-xs text-kth-slate-500 italic py-2 flex items-center justify-between">
                  <span>No professional summary provided yet. Click &quot;Edit Profile&quot; to add a summary.</span>
                  <Button variant="ghost" size="sm" onClick={handleOpenEdit}>
                    Add Summary
                  </Button>
                </div>
              )}
            </Card>

            {/* Work Experience Section */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-kth-primary-600" /> Work Experience
              </h3>
              {profile.experience && profile.experience.length > 0 ? (
                <div className="space-y-6">
                  {profile.experience.map((exp: any, idx: number) => {
                    const periodText =
                      exp.period ||
                      (exp.years ? `${exp.years} year${exp.years > 1 ? 's' : ''}` : '') ||
                      exp.total_experience_band ||
                      '';
                    return (
                      <div key={idx} className="border-l-2 border-kth-primary-600 pl-4 space-y-1">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <h4 className="font-bold text-sm text-kth-slate-900">
                            {exp.title || 'Role Title'}
                          </h4>
                          {periodText && (
                            <span className="text-xs font-mono text-kth-slate-500">
                              {periodText}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-kth-primary-600 block">
                          {exp.company || 'Organization'}
                          {exp.location ? ` • ${exp.location}` : ''}
                        </span>
                        {exp.description && (
                          <p className="text-xs text-kth-slate-600 leading-relaxed mt-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-center py-6">
                  <Briefcase className="w-8 h-8 text-kth-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-kth-slate-600">No work experience added yet.</p>
                  <p className="text-[11px] text-kth-slate-400 mt-0.5">
                    Your professional experience will appear here once added during onboarding.
                  </p>
                </div>
              )}
            </Card>

            {/* Education & Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education Card */}
              <Card className="p-6">
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-kth-accent-cyan" /> Education
                </h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu: any, idx: number) => {
                      const degreeTitle = edu.degree || edu.qualification || 'Degree / Qualification';
                      const yearVal = edu.graduation_year || edu.year;
                      const fieldVal = edu.field_of_study || edu.fieldOfStudy;
                      return (
                        <div
                          key={idx}
                          className="bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200"
                        >
                          <h4 className="font-bold text-xs text-kth-slate-900">{degreeTitle}</h4>
                          <span className="text-xs text-kth-slate-600 block">
                            {edu.institution || 'University / Institution'}
                            {fieldVal ? ` • ${fieldVal}` : ''}
                          </span>
                          {yearVal && (
                            <span className="text-[10px] text-kth-slate-400 font-mono">
                              Class of {yearVal}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-center py-6">
                    <GraduationCap className="w-8 h-8 text-kth-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-kth-slate-600">No education details added yet.</p>
                    <p className="text-[11px] text-kth-slate-400 mt-0.5">
                      Your degrees and qualifications will be listed here.
                    </p>
                  </div>
                )}
              </Card>

              {/* Skills & Certifications Card */}
              <Card className="p-6">
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-kth-accent-emerald" /> Skills & Certifications
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-kth-slate-500 uppercase block mb-2">
                      KEY SKILLS
                    </span>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {profile.skills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="indigo">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-kth-slate-400 italic">No skills listed yet.</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-kth-slate-100">
                    <span className="text-xs font-bold text-kth-slate-500 uppercase block mb-2">
                      CERTIFICATIONS
                    </span>
                    {profile.certifications && profile.certifications.length > 0 ? (
                      <ul className="space-y-2 text-xs text-kth-slate-700 list-none pl-0">
                        {profile.certifications.map((cert: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-kth-accent-emerald shrink-0" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-kth-slate-400 italic">No certifications added yet.</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Resume Reference if Available */}
            {profile.resumeUrl && (
              <Card className="p-5 bg-gradient-to-r from-white to-kth-slate-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm text-kth-slate-900 truncate">
                      {profile.resumeUrl.toLowerCase().endsWith('.pdf')
                        ? 'Verified Resume Document (PDF)'
                        : 'Uploaded Resume Document (DOCX)'}
                    </h4>
                    <p className="text-xs text-kth-slate-500">
                      {profile.resumeUrl.toLowerCase().endsWith('.pdf')
                        ? 'Your PDF resume is active and attached to job applications.'
                        : 'Word document attached. Upload a PDF in Resume & ATS to enable interactive preview.'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.history.pushState({}, '', '/candidate/resume');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="shrink-0"
                >
                  Manage Resume
                </Button>
              </Card>
            )}
          </>
        )}
      </div>

      {/* ─── Real Supabase-Backed Edit Profile Modal ──────────────────────────── */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => {
          if (!isSaving) {
            setIsEditOpen(false);
            setSaveError(null);
            setSaveSuccess(false);
          }
        }}
        title="Edit Profile Information"
        description="Update your candidate profile. All changes are saved directly to your account."
      >
        {saveSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-kth-accent-emerald mx-auto" />
            <h4 className="font-display font-bold text-base text-kth-slate-900">
              Profile Updated Successfully
            </h4>
            <p className="text-xs text-kth-slate-500">
              Your profile changes have been persisted to Supabase.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {saveError && (
              <Alert variant="error" title="Update Failed">
                {saveError}
              </Alert>
            )}

            <Input
              label="Full Name"
              value={formFullName}
              onChange={(e) => {
                setFormFullName(e.target.value);
                if (formFieldErrors.fullName) {
                  setFormFieldErrors((prev) => ({ ...prev, fullName: '' }));
                }
              }}
              error={formFieldErrors.fullName}
              disabled={isSaving}
              required
            />

            <Input
              label="Professional Headline"
              placeholder="e.g. Senior ESG & Sustainability Consultant"
              value={formHeadline}
              onChange={(e) => {
                setFormHeadline(e.target.value);
                if (formFieldErrors.headline) {
                  setFormFieldErrors((prev) => ({ ...prev, headline: '' }));
                }
              }}
              error={formFieldErrors.headline}
              disabled={isSaving}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location"
                placeholder="e.g. Hyderabad, Telangana"
                value={formLocation}
                onChange={(e) => {
                  setFormLocation(e.target.value);
                  if (formFieldErrors.location) {
                    setFormFieldErrors((prev) => ({ ...prev, location: '' }));
                  }
                }}
                error={formFieldErrors.location}
                disabled={isSaving}
                required
              />

              <Input
                label="Phone Number (Optional)"
                placeholder="e.g. +91 98765 43210"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <Textarea
              label="Professional Summary"
              placeholder="Provide an overview of your sustainability expertise, certifications, and career accomplishments..."
              rows={4}
              value={formBio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormBio(e.target.value)}
              disabled={isSaving}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-kth-slate-100">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </CandidateShell>
  );
};
