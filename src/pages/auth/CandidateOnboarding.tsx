import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { analyticsService } from '../../lib/services/analytics/AnalyticsService';
import { ResumeParserManager } from '../../lib/services/resume/ResumeParser';
import { candidateService } from '../../lib/services/candidateService';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  UploadCloud,
  X,
  CheckCircle2,
  Loader2,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

interface LocalSkill {
  id: string;
  name: string;
  years: number;
  competency: 'Beginner' | 'Intermediate' | 'Expert';
}

export const CandidateOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track onboarding start time for analytics duration
  const [onboardingStartTime] = useState(() => Date.now());

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Skills state
  const [skillsList, setSkillsList] = useState<LocalSkill[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillYearsInput, setSkillYearsInput] = useState('1');
  const [skillCompetency, setSkillCompetency] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Parser state
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [parsingProgress, setParsingProgress] = useState(0);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!user) return;
    const savedDraft = localStorage.getItem(`kth_onboarding_draft_${user.id}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.headline) setHeadline(draft.headline);
        if (draft.bio) setBio(draft.bio);
        if (draft.location) setLocation(draft.location);
        if (draft.experienceYears) setExperienceYears(draft.experienceYears);
        if (draft.resumeUrl) setResumeUrl(draft.resumeUrl);
        if (draft.uploadedFileName) setUploadedFileName(draft.uploadedFileName);
        if (draft.skillsList) setSkillsList(draft.skillsList);

        analyticsService.track('auth', 'Onboarding Resumed', { hasResume: !!draft.resumeUrl });
      } catch (e) {
        console.error('Failed to parse draft onboarding state', e);
      }
    }
  }, [user]);

  // Track abandonment on unload
  useEffect(() => {
    return () => {
      // Check if not fully submitted
      const isCompleted = localStorage.getItem(`kth_onboarding_completed_${user?.id}`) === 'true';
      if (user && !isCompleted) {
        analyticsService.track('auth', 'Onboarding Abandoned', { lastStep: step });
      }
    };
  }, [user, step]);

  // Save draft to localStorage on state change
  const saveDraftToStorage = useCallback((updatedFields: Record<string, any>) => {
    if (!user) return;
    const currentDraft = {
      headline,
      bio,
      location,
      experienceYears,
      resumeUrl,
      uploadedFileName,
      skillsList,
      ...updatedFields
    };
    localStorage.setItem(`kth_onboarding_draft_${user.id}`, JSON.stringify(currentDraft));
  }, [user, headline, bio, location, experienceYears, resumeUrl, uploadedFileName, skillsList]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleResumeFile(e.target.files[0]);
    }
  };

  const handleResumeFile = async (file: File) => {
    setErrorMsg(null);

    // Validation
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && fileExtension !== 'pdf' && fileExtension !== 'docx') {
      setErrorMsg('Unsupported file type. Please upload a PDF or DOCX file.');
      analyticsService.track('auth', 'Resume Upload Failed', { reason: 'invalid_file_type', fileName: file.name });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5 MB limit.');
      analyticsService.track('auth', 'Resume Upload Failed', { reason: 'file_size_exceeded', fileName: file.name });
      return;
    }

    if (!user) return;

    if (resumeUrl) {
      analyticsService.track('auth', 'Resume Replaced', { oldFileName: uploadedFileName, newFileName: file.name });
    }

    analyticsService.track('auth', 'Resume Uploaded', { fileName: file.name, fileSize: file.size });
    analyticsService.track('auth', 'Resume Parsing Started');

    const parseStartTime = Date.now();
    setIsParsing(true);
    setParsingStep('Uploading Resume...');
    setParsingProgress(10);

    try {
      // 1. Upload to Supabase Storage
      const uploadedUrl = await candidateService.uploadResume(user.id, file);
      if (!uploadedUrl) throw new Error('Failed to upload file to storage.');

      setResumeUrl(uploadedUrl);
      setUploadedFileName(file.name);
      saveDraftToStorage({ resumeUrl: uploadedUrl, uploadedFileName: file.name });

      // 1b. Save metadata log to database
      await supabase
        .from('candidate_resumes')
        .insert({
          candidate_id: user.id,
          storage_path: uploadedUrl,
          file_name: file.name,
          storage_provider: 'supabase',
          parser_provider: 'mock',
          parser_version: 'v1',
          status: 'uploaded'
        });

      // 2. Parse using pluggable architecture
      const parser = ResumeParserManager.getParser();
      const parsedData = await parser.parse(file, (stepName, progress) => {
        setParsingStep(stepName);
        setParsingProgress(progress);
      });

      const parsedFields = parsedData.data;

      // 3. Populate state fields
      if (parsedFields.headline) setHeadline(parsedFields.headline);
      if (parsedFields.summary) setBio(parsedFields.summary);
      if (parsedFields.location) setLocation(parsedFields.location);
      if (parsedFields.experienceYears) setExperienceYears(String(parsedFields.experienceYears));
      
      let parsedSkills: LocalSkill[] = [];
      if (parsedFields.skills) {
        parsedSkills = parsedFields.skills.map((s, idx) => ({
          id: `parsed-${idx}-${Date.now()}`,
          name: s.skill_name,
          years: s.years_of_experience,
          competency: s.competency_level
        }));
        setSkillsList(parsedSkills);
      }

      saveDraftToStorage({
        headline: parsedFields.headline || headline,
        bio: parsedFields.summary || bio,
        location: parsedFields.location || location,
        experienceYears: parsedFields.experienceYears ? String(parsedFields.experienceYears) : experienceYears,
        skillsList: parsedSkills.length > 0 ? parsedSkills : skillsList
      });

      const parseDuration = Date.now() - parseStartTime;

      // Update resume metadata log in db to parsed
      await supabase
        .from('candidate_resumes')
        .update({
          status: 'parsed',
          parsed_at: new Date().toISOString(),
          confidence_score: parsedData.confidenceScores.headline || 90
        })
        .eq('candidate_id', user.id)
        .eq('storage_path', uploadedUrl);

      analyticsService.track('auth', 'Resume Parsing Completed', { durationMs: parseDuration });
      setStep(1); // Return to step 1 so they can review populated data
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse resume. You can still enter your details manually.');
      analyticsService.track('auth', 'Resume Parsing Failed', { error: err.message });
      
      // Update db status to failed
      if (resumeUrl) {
        await supabase
          .from('candidate_resumes')
          .update({ status: 'failed' })
          .eq('candidate_id', user.id)
          .eq('storage_path', resumeUrl);
      }
    } finally {
      setIsParsing(false);
      setParsingProgress(0);
      setParsingStep('');
    }
  };

  const handleClearResume = () => {
    analyticsService.track('auth', 'Resume Upload Cancelled', { fileName: uploadedFileName });
    setResumeUrl('');
    setUploadedFileName('');
    saveDraftToStorage({ resumeUrl: '', uploadedFileName: '' });
  };

  // Structured Skills Handlers
  const handleAddOrUpdateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;

    const yearsNum = parseInt(skillYearsInput) || 1;

    if (editingSkillId) {
      // Update
      const updated = skillsList.map((s) =>
        s.id === editingSkillId
          ? { ...s, name: skillInput.trim(), years: yearsNum, competency: skillCompetency }
          : s
      );
      setSkillsList(updated);
      saveDraftToStorage({ skillsList: updated });
      analyticsService.track('auth', 'Skill Edited', { name: skillInput.trim(), years: yearsNum });
      setEditingSkillId(null);
    } else {
      // Add
      const isDuplicate = skillsList.some(
        (s) => s.name.toLowerCase() === skillInput.trim().toLowerCase()
      );
      if (isDuplicate) {
        setErrorMsg(`"${skillInput.trim()}" is already added.`);
        return;
      }
      const newSkill: LocalSkill = {
        id: `local-${Date.now()}`,
        name: skillInput.trim(),
        years: yearsNum,
        competency: skillCompetency
      };
      const updated = [...skillsList, newSkill];
      setSkillsList(updated);
      saveDraftToStorage({ skillsList: updated });
      analyticsService.track('auth', 'Skill Added', { name: skillInput.trim(), years: yearsNum });
    }

    setSkillInput('');
    setSkillYearsInput('1');
    setSkillCompetency('Intermediate');
    setErrorMsg(null);
  };

  const handleEditSkillClick = (skill: LocalSkill) => {
    setEditingSkillId(skill.id);
    setSkillInput(skill.name);
    setSkillYearsInput(String(skill.years));
    setSkillCompetency(skill.competency);
  };

  const handleDeleteSkill = (skillId: string, skillName: string) => {
    const updated = skillsList.filter((s) => s.id !== skillId);
    setSkillsList(updated);
    saveDraftToStorage({ skillsList: updated });
    analyticsService.track('auth', 'Skill Deleted', { name: skillName });
    if (editingSkillId === skillId) {
      setEditingSkillId(null);
      setSkillInput('');
      setSkillYearsInput('1');
      setSkillCompetency('Intermediate');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Update candidate profile record
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

      // 2. Clear existing skills in DB to match transaction state
      const { error: clearSkillsError } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('candidate_id', user.id);

      if (clearSkillsError) throw clearSkillsError;

      // 3. Batch insert skills from localState
      if (skillsList.length > 0) {
        for (const skill of skillsList) {
          await candidateService.addSkill({
            candidate_id: user.id,
            skill_name: skill.name,
            years_of_experience: skill.years,
            competency_level: skill.competency
          });
        }
      }

      // Set completed flag in localStorage to prevent abandoned trigger on unmount
      localStorage.setItem(`kth_onboarding_completed_${user.id}`, 'true');

      // Track completion with duration
      const totalDuration = Date.now() - onboardingStartTime;
      analyticsService.track('auth', 'Onboarding Completed', {
        skillsCount: skillsList.length,
        durationMs: totalDuration
      });

      // Clear draft localStorage
      localStorage.removeItem(`kth_onboarding_draft_${user.id}`);

      await refreshProfile();
      navigate('/dashboard/candidate');
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Candidate Onboarding" subtitle={`Step ${step} of 4: Setup your career preferences.`}>
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {isParsing && (
        <div className="space-y-4 py-8 text-center animate-pulse" role="status" aria-live="polite">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">{parsingStep}</h4>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="bg-emerald-650 h-full transition-all duration-300"
                style={{ width: `${parsingProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-bold">{parsingProgress}% completed</p>
          </div>
        </div>
      )}

      {!isParsing && (
        <>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Professional Headline</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    saveDraftToStorage({ headline: e.target.value });
                  }}
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
                  onChange={(e) => {
                    setLocation(e.target.value);
                    saveDraftToStorage({ location: e.target.value });
                  }}
                  className="w-full text-xs font-semibold h-11"
                />
              </div>
              <Button onClick={handleNext} className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
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
                  onChange={(e) => {
                    setBio(e.target.value);
                    saveDraftToStorage({ bio: e.target.value });
                  }}
                  className="w-full p-3.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button onClick={handleNext} className="h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Upload Resume</label>
                
                {resumeUrl ? (
                  <div className="p-4 border border-emerald-150 bg-emerald-50/30 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                          {uploadedFileName || 'Resume.pdf'}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold">Successfully Verified & Parsed</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearResume}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      aria-label="Remove uploaded resume"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-3 transition-all ${
                      dragActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        Drag & Drop Resume here
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        PDF or DOCX (Max. 5 MB)
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        id="resume-file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume-file"
                        className="inline-flex h-9 px-4 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Browse Files
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button onClick={handleNext} className="h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              {/* Structured Skills Form */}
              <form onSubmit={handleAddOrUpdateSkill} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
                  {editingSkillId ? 'Edit Skill Capability' : 'Add Skill Capability'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="e.g. React, Figma"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="h-10 text-xs font-semibold"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="40"
                      placeholder="Years"
                      value={skillYearsInput}
                      onChange={(e) => setSkillYearsInput(e.target.value)}
                      className="h-10 text-xs font-semibold w-16"
                    />
                    <select
                      value={skillCompetency}
                      onChange={(e) => setSkillCompetency(e.target.value as any)}
                      className="h-10 text-xs font-semibold border border-slate-200 rounded-xl px-2 bg-white flex-grow focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="h-8 text-[11px] font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingSkillId ? 'Update Skill' : 'Add Skill'}</span>
                  </Button>
                </div>
              </form>

              {/* Added Skills List */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Skills Inventory ({skillsList.length})
                </label>

                {skillsList.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-bold text-center py-4 border border-dashed border-slate-200 rounded-xl">
                    No skills added yet. Add skills or upload a resume to auto-populate.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-xs hover:border-slate-350 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{skill.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            {skill.years} year{skill.years !== 1 && 's'} • {skill.competency}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2">
                          <button
                            type="button"
                            onClick={() => handleEditSkillClick(skill)}
                            className="p-1 text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
                            aria-label={`Edit skill ${skill.name}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill.id, skill.name)}
                            className="p-1 text-slate-450 hover:text-red-500 transition-colors cursor-pointer"
                            aria-label={`Delete skill ${skill.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Years of Experience */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Years of Experience</label>
                <Input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 5"
                  value={experienceYears}
                  onChange={(e) => {
                    setExperienceYears(e.target.value);
                    saveDraftToStorage({ experienceYears: e.target.value });
                  }}
                  className="w-full text-xs font-semibold h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button type="button" onClick={handlePrev} variant="outline" className="h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button type="button" onClick={handleSubmit} isLoading={loading} className="h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                  <Save className="w-4 h-4" />
                  <span>Complete</span>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
};

export default CandidateOnboarding;
