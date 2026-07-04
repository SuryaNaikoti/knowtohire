import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateProfile } from '../../../lib/services/candidateService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { Loading } from '../../../components/ui/Loading';
import { ResumeUploader } from '../../../components/dashboard/ResumeUploader';
import { UserCog, Sparkles } from 'lucide-react';

export const Portfolio: React.FC = () => {
  const { profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [salary, setSalary] = useState(0);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'employers-only'>('public');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authProfile) return;
      try {
        setLoading(true);
        const data = await candidateService.getProfile(authProfile.id);
        if (data) {
          setProfile(data);
          setTitle(data.title || '');
          setBio(data.bio || '');
          setSalary(data.desired_salary || 0);
          setVisibility(data.profile_visibility || 'public');
        }
      } catch (err) {
        console.error(err);
        setError('Could not load profile. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authProfile) return;

    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const payload: Partial<CandidateProfile> = {
        title,
        bio,
        desired_salary: salary,
        profile_visibility: visibility,
      };

      const ok = await candidateService.updateProfile(authProfile.id, payload);
      if (ok) {
        setSuccess(true);
        const updatedProfile = await candidateService.getProfile(authProfile.id);
        if (updatedProfile) setProfile(updatedProfile);
      } else {
        setError('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeSuccess = (newUrl: string) => {
    if (profile) {
      setProfile({ ...profile, resume_url: newUrl });
    }
  };

  if (loading) {
    return <Loading label="Loading profile configuration..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            My Portfolio Hub
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Configure your professional branding summary and upload your master resume document.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Profile Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <UserCog className="w-4 h-4 text-primary" /> General Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {error && <Alert type="error" className="text-xs" title="Profile Alert">{error}</Alert>}
                {success && <Alert type="success" className="text-xs" title="Profile Saved">Your changes were successfully stored.</Alert>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Professional Headline / Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior React Developer"
                  />
                  <Input
                    label="Desired Annual Salary ($)"
                    type="number"
                    min={0}
                    required
                    value={salary}
                    onChange={(e) => setSalary(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 120000"
                  />
                </div>

                <Select
                  label="Profile Directory Visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                >
                  <option value="public">Public (Visible to all recruiters)</option>
                  <option value="employers-only">Employers Only (Visible to logged-in vetting staff)</option>
                  <option value="private">Private (Only visible to you)</option>
                </Select>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">
                    Professional Biography / Summary
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[140px] outline-none"
                    placeholder="Provide a summary of your technical highlights, industry experience, and target roles..."
                    value={bio}
                    required
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={saving} className="font-bold text-xs">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right CV Uploader Box */}
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-secondary" /> Resume Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Upload your master curriculum vitae document. Our parser indexes your resume to compute tech stack matching indexes.
              </p>
              {authProfile && (
                <ResumeUploader
                  candidateId={authProfile.id}
                  currentResumeUrl={profile?.resume_url || ''}
                  onUploadSuccess={handleResumeSuccess}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
