import React from 'react';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { EmployerOnboardingData } from '@/types/onboarding';
import { Edit3, User, Building2, MapPin, Globe, ShieldCheck, FileText } from 'lucide-react';

export interface Step7ReviewCompleteProps {
  data: EmployerOnboardingData;
  authEmail: string;
  onJumpToStep: (step: number) => void;
}

export const Step7ReviewComplete: React.FC<Step7ReviewCompleteProps> = ({
  data,
  authEmail,
  onJumpToStep,
}) => {
  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={7}
        title="Review & Complete Employer Setup"
        subtitle="Verify your company details before finalizing your employer account activation."
        tag="Final Verification"
      />

      <div className="space-y-3">
        {/* 1. Recruiter Information */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <User className="w-4 h-4 text-kth-primary-600" />
              <span>Primary Recruiter / Administrator</span>
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
            <p><strong className="text-kth-slate-800">Job Title:</strong> {data.jobTitle || 'Not provided'}</p>
            <p><strong className="text-kth-slate-800">Work Phone:</strong> {data.workPhone || 'Not provided'}</p>
            <p><strong className="text-kth-slate-800">Auth Email:</strong> {authEmail}</p>
          </div>
        </div>

        {/* 2. Company Identity */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <Building2 className="w-4 h-4 text-kth-primary-600" />
              <span>Company Identity & Scale</span>
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
          <div className="text-xs text-kth-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <p><strong className="text-kth-slate-800">Display Name:</strong> {data.companyName}</p>
            <p><strong className="text-kth-slate-800">Legal Entity:</strong> {data.legalName}</p>
            <p><strong className="text-kth-slate-800">Industry:</strong> {data.industry}</p>
            <p><strong className="text-kth-slate-800">Scale:</strong> {data.companySize}</p>
          </div>
        </div>

        {/* 3. Location */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <MapPin className="w-4 h-4 text-kth-primary-600" />
              <span>Headquarters Location</span>
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
          <div className="text-xs text-kth-slate-600 pt-1">
            <p><strong className="text-kth-slate-800">Headquarters:</strong> {data.headquartersLocation}</p>
            <p className="mt-0.5"><strong className="text-kth-slate-800">Region:</strong> {data.city}, {data.state}, {data.country || 'India'}</p>
          </div>
        </div>

        {/* 4. Description & Mission */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <FileText className="w-4 h-4 text-kth-primary-600" />
              <span>Company Description & Culture</span>
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
          <div className="text-xs text-kth-slate-600 space-y-1.5 pt-1">
            <p className="line-clamp-2 italic text-kth-slate-700">&ldquo;{data.description}&rdquo;</p>
            {data.mission && (
              <p><strong className="text-kth-slate-800">Mission:</strong> {data.mission}</p>
            )}
          </div>
        </div>

        {/* 5. Online Presence */}
        <div className="p-4 rounded-xl bg-white border border-kth-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-kth-slate-900">
              <Globe className="w-4 h-4 text-kth-primary-600" />
              <span>Online Presence & Links</span>
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
          <div className="text-xs text-kth-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <p className="truncate"><strong className="text-kth-slate-800">Website:</strong> {data.websiteUrl || data.website}</p>
            <p className="truncate"><strong className="text-kth-slate-800">LinkedIn:</strong> {data.linkedinUrl || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Employer Portal Ready</span>
        </div>
        <p className="text-emerald-800">
          Submitting will establish your company record, assign your administrator membership, activate your account, and navigate directly to the Employer ATS Portal.
        </p>
      </div>
    </div>
  );
};
