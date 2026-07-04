import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

export const CandidateOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);

    const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      // Update candidate profile record
      const { error: profileError } = await supabase
        .from('candidate_profiles')
        .update({
          headline,
          bio,
          location,
          resume_url: resumeUrl || null,
          experience_years: parseFloat(experienceYears) || 0,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Batch insert candidate skills
      if (skillsArray.length > 0) {
        const skillInserts = skillsArray.map((skill) => ({
          candidate_id: user.id,
          skill_name: skill
        }));
        const { error: skillsError } = await supabase
          .from('candidate_skills')
          .insert(skillInserts);
        if (skillsError) throw skillsError;
      }

      await refreshProfile();
      navigate('/candidate/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Candidate Profile Onboarding" subtitle={`Step ${step} of 4: Setup your career preferences.`}>
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Professional Headline</label>
            <Input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Location / City</label>
            <Input
              type="text"
              required
              placeholder="e.g. Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <Button onClick={handleNext} className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Brief Professional Bio</label>
            <textarea
              required
              rows={4}
              placeholder="Write a summary of your career milestones..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={handleNext} className="h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Resume URL link</label>
            <Input
              type="url"
              placeholder="https://drive.google.com/resume.pdf"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={handleNext} className="h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Skills Tags (Comma-separated)</label>
            <Input
              type="text"
              required
              placeholder="e.g. React, TypeScript, Node.js"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Years of Experience</label>
            <Input
              type="number"
              required
              min="0"
              placeholder="e.g. 5"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button type="submit" isLoading={loading} className="h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" />
              <span>Complete</span>
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default CandidateOnboarding;
