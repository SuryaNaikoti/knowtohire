import React from 'react';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData, calculateCandidateCompletionPct } from '@/types/onboarding';
import { Progress } from '@/components/ui/Progress';
import { Edit3, CheckCircle2, User, Briefcase, GraduationCap, MapPin, IndianRupee, FileText } from 'lucide-react';

export interface Step10ReviewCompleteProps {
  data: CandidateOnboardingData;
  onJumpToStep: (step: number) => void;
}

export const Step10ReviewComplete: React.FC<Step10ReviewCompleteProps> = ({
  data,
  onJumpToStep,
}) => {
  const completionScore = calculateCandidateCompletionPct(data);

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={10}
        title="Review & Complete Profile"
        subtitle="Review your details below. You can jump back to edit any section before final submission."
        tag="Final Verification"
      />

      {/* Completion Score Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-kth-slate-900 via-kth-primary-950 to-kth-slate-900 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-kth-accent-cyan">
              Calculated Profile Strength
            </span>
            <h3 className="font-display text-xl font-extrabold text-white">
              {completionScore}% Profile Completeness
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 font-mono text-lg font-bold backdrop-blur-md">
            {completionScore}%
          </div>
        </div>
        <Progress value={completionScore} color="emerald" />
        <p className="text-[11px] text-kth-slate-300">
          Your profile includes verified identity, career preferences, skills, and resume metadata.
        </p>
      </div>

      {/* Summary Accordion / Cards */}
      <div className="space-y-3">
        {/* 1. Basic Info */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <User className="w-4 h-4 text-kth-primary-600" />
              <span>Basic Information</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-xs text-kth-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <p><strong className="text-kth-slate-800">Name:</strong> {data.fullName || 'Not provided'}</p>
            <p><strong className="text-kth-slate-800">Location:</strong> {data.location || 'Not provided'}</p>
            <p className="sm:col-span-2"><strong className="text-kth-slate-800">Headline:</strong> {data.headline || 'Not provided'}</p>
            {data.phone && <p><strong className="text-kth-slate-800">Phone:</strong> {data.phone}</p>}
          </div>
        </div>

        {/* 2. About & Domain */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <CheckCircle2 className="w-4 h-4 text-kth-primary-600" />
              <span>About & Specialization</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-xs text-kth-slate-600 space-y-1.5 pt-1">
            <p><strong className="text-kth-slate-800">Specialization:</strong> {data.domainSpecialization || 'None selected'}</p>
            <p className="line-clamp-2 text-kth-slate-700 italic">&ldquo;{data.bio}&rdquo;</p>
          </div>
        </div>

        {/* 3. Skills */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <CheckCircle2 className="w-4 h-4 text-kth-primary-600" />
              <span>Skills ({data.skills?.length || 0})</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.skills?.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-md bg-kth-slate-100 text-kth-slate-800 text-[11px] font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Experience & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
                <Briefcase className="w-4 h-4 text-kth-primary-600" />
                <span>Experience</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
            <div className="text-xs text-kth-slate-600 space-y-1 pt-1">
              <p><strong className="text-kth-slate-800">Seniority:</strong> {data.totalExperience || 'Not provided'}</p>
              {data.currentJobTitle && <p><strong className="text-kth-slate-800">Role:</strong> {data.currentJobTitle}</p>}
              {data.currentCompany && <p><strong className="text-kth-slate-800">Company:</strong> {data.currentCompany}</p>}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
                <GraduationCap className="w-4 h-4 text-kth-primary-600" />
                <span>Education</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(5)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
            <div className="text-xs text-kth-slate-600 space-y-1 pt-1">
              <p><strong className="text-kth-slate-800">Degree:</strong> {data.highestQualification || 'Not provided'}</p>
              <p><strong className="text-kth-slate-800">Field:</strong> {data.fieldOfStudy}</p>
              <p><strong className="text-kth-slate-800">Institute:</strong> {data.institution} ({data.graduationYear})</p>
            </div>
          </div>
        </div>

        {/* 5. Preferences & Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
                <MapPin className="w-4 h-4 text-kth-primary-600" />
                <span>Preferences</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(7)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
            <div className="text-xs text-kth-slate-600 space-y-1 pt-1">
              <p><strong className="text-kth-slate-800">Work Mode:</strong> {data.remotePreference}</p>
              <p><strong className="text-kth-slate-800">Type:</strong> {data.employmentType}</p>
              <p className="truncate"><strong className="text-kth-slate-800">Locations:</strong> {data.preferredLocations?.join(', ')}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
                <IndianRupee className="w-4 h-4 text-kth-primary-600" />
                <span>Compensation</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(8)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
            <div className="text-xs text-kth-slate-600 space-y-1 pt-1 font-mono">
              <p className="font-bold text-kth-slate-900">
                ₹{(data.minSalaryINR / 100000).toFixed(1)}L – ₹{(data.maxSalaryINR / 100000).toFixed(1)}L/yr
              </p>
              <p className="font-sans text-kth-slate-500">
                {data.isNegotiable ? 'Negotiable' : 'Fixed Range'}
              </p>
            </div>
          </div>
        </div>

        {/* 6. Resume Document */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <FileText className="w-4 h-4 text-kth-primary-600" />
              <span>Resume Document</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(9)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-xs text-kth-slate-600 pt-1">
            {data.resumeFileName ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {data.resumeFileName} ({((data.resumeFileSize || 0) / (1024 * 1024)).toFixed(1)} MB)
              </span>
            ) : (
              <span className="text-amber-600 italic">No resume attached (You can upload from your profile later).</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-kth-primary-50 border border-kth-primary-200 text-xs text-kth-primary-900">
        <p className="font-semibold">Ready to activate your Candidate profile?</p>
        <p className="text-kth-primary-700 mt-0.5">
          Clicking &quot;Complete My Profile&quot; will persist your data, activate your account, and unlock access to the Candidate Portal.
        </p>
      </div>
    </div>
  );
};
