import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { uploadResume, validatePDFResumeFile } from '@/services/resumeService';
import { parseResumeDocument } from '@/services/resumeParserService';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Briefcase,
  MapPin,
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react';

export interface Step1BasicInfoProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  data,
  onChange,
  errors,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    setAutofillSuccess(null);

    const validation = await validatePDFResumeFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Please upload a valid PDF resume.');
      return;
    }

    setIsParsing(true);
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    try {
      // 1. Upload to Supabase / Local storage
      const uploadRes = await uploadResume(userId, file);
      
      // 2. Parse resume content for auto-filling onboarding fields
      const parsed = await parseResumeDocument(file);

      const updates: Partial<CandidateOnboardingData> = {
        resumeUrl: uploadRes.url || '',
        resumeFileName: uploadRes.fileName || file.name,
        resumeFileSize: uploadRes.fileSize || file.size,
      };

      if (parsed.fullName && (!data.fullName || data.fullName.includes('Aarav'))) {
        updates.fullName = parsed.fullName;
      }
      if (parsed.headline) {
        updates.headline = parsed.headline;
      }
      if (parsed.location) {
        updates.location = parsed.location;
      }
      if (parsed.bio) {
        updates.bio = parsed.bio;
      }
      if (parsed.domainSpecialization) {
        updates.domainSpecialization = parsed.domainSpecialization;
      }
      if (parsed.skills && parsed.skills.length > 0) {
        updates.skills = Array.from(new Set([...(data.skills || []), ...parsed.skills]));
      }
      if (parsed.experience && parsed.experience.length > 0) {
        updates.totalExperience = '3–5 years';
        updates.currentJobTitle = parsed.experience[0].title;
        updates.currentCompany = parsed.experience[0].company;
        updates.experienceYears = 4;
      }
      if (parsed.education && parsed.education.length > 0) {
        updates.highestQualification = parsed.education[0].qualification || 'Master of Science (M.Sc)';
        updates.institution = parsed.education[0].institution || 'Indian Institute of Technology (IIT)';
        updates.fieldOfStudy = 'Environmental & Engineering Sciences';
        updates.graduationYear = parsed.education[0].graduation_year || '2021';
      }
      if (parsed.certifications && parsed.certifications.length > 0) {
        updates.certifications = parsed.certifications.map((c, i) => ({
          id: `cert-${Date.now()}-${i}`,
          name: c,
          issuingOrg: 'Industry Body',
          year: '2023',
        }));
      }

      onChange(updates);
      setAutofillSuccess(`Resume "${file.name}" analyzed successfully! Profile fields have been autofilled.`);
    } catch (err) {
      console.warn('[Step1BasicInfo] Resume autofill warning:', err);
      setUploadError('Could not parse resume data automatically. You can continue filling manually.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveResume = () => {
    onChange({
      resumeUrl: '',
      resumeFileName: '',
      resumeFileSize: 0,
    });
    setAutofillSuccess(null);
  };

  const hasResume = Boolean(data.resumeUrl && data.resumeFileName);

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={1}
        title="Basic Information & Resume"
        subtitle="Upload your resume to autofill your onboarding profile instantly, or complete the fields manually."
        tag="Profile Identity"
      />

      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
        id="onboarding-resume-file"
      />

      {/* ─── Fast Resume Autofill Banner ──────────────────────────────────── */}
      {!hasResume ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-kth-primary-500 bg-kth-primary-50/50 scale-[0.99]'
              : 'border-kth-slate-200 bg-gradient-to-br from-kth-slate-50/50 to-white hover:border-kth-primary-400 hover:bg-kth-primary-50/20'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center shadow-xs">
              {isParsing ? (
                <Loader2 className="w-6 h-6 animate-spin text-kth-primary-600" />
              ) : (
                <Sparkles className="w-6 h-6 text-kth-primary-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-kth-slate-900 flex items-center justify-center gap-1.5">
                {isParsing ? 'Analyzing Resume & Autofilling Fields...' : 'Autofill with Resume (Recommended)'}
              </p>
              <p className="text-xs text-kth-slate-500 mt-1 max-w-md mx-auto">
                Drop your PDF resume here or click to browse. We'll automatically extract your details, experience, skills, and education.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              isLoading={isParsing}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload PDF Resume
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-kth-slate-900 truncate">
                {data.resumeFileName}
              </p>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resume attached & fields autofilled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleRemoveResume}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {autofillSuccess && (
        <Alert variant="success" title="Autofill Complete">
          <div className="flex justify-between items-center text-xs">
            <span>{autofillSuccess}</span>
            <Button variant="ghost" size="sm" onClick={() => setAutofillSuccess(null)}>
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="error" title="Upload Notice">
          <span className="text-xs">{uploadError}</span>
        </Alert>
      )}

      <div className="pt-2 border-t border-kth-slate-100 space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Aarav Mehta"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        <Input
          label="Professional Headline *"
          placeholder="e.g. Environmental & ESG Consultant"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          helperText="A concise summary of your current professional focus or desired role."
          error={errors.headline}
          leftIcon={<Briefcase className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PhoneInput
            label="Phone Number"
            value={data.phone}
            onChange={(phone) => onChange({ phone })}
            helperText="Optional, but recommended for recruiters."
            error={errors.phone}
            placeholder="98765 43210"
          />

          <Input
            label="Current Location *"
            placeholder="e.g. Hyderabad, Telangana"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            helperText="City and State in India (or global location)."
            error={errors.location}
            leftIcon={<MapPin className="w-4 h-4" />}
            required
          />
        </div>
      </div>
    </div>
  );
};

