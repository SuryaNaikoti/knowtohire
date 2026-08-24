import React, { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
import { OnboardingError } from '@/components/onboarding/OnboardingError';
import { CandidateOnboardingProgress } from '@/components/onboarding/CandidateOnboardingProgress';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';

import { Step1BasicInfo } from '@/components/onboarding/candidate/Step1BasicInfo';
import { Step2AboutYou } from '@/components/onboarding/candidate/Step2AboutYou';
import { Step3Skills } from '@/components/onboarding/candidate/Step3Skills';
import { Step4Experience } from '@/components/onboarding/candidate/Step4Experience';
import { Step5Education } from '@/components/onboarding/candidate/Step5Education';
import { Step6Certifications } from '@/components/onboarding/candidate/Step6Certifications';
import { Step7CareerPreferences } from '@/components/onboarding/candidate/Step7CareerPreferences';
import { Step8SalaryExpectations } from '@/components/onboarding/candidate/Step8SalaryExpectations';
import { Step9Resume } from '@/components/onboarding/candidate/Step9Resume';
import { Step10ReviewComplete } from '@/components/onboarding/candidate/Step10ReviewComplete';

import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  CandidateOnboardingData,
  calculateCandidateCompletionPct,
} from '@/types/onboarding';

export interface CandidateOnboardingPageProps {
  onNavigate?: (path: string) => void;
}

const STEP_TITLES = [
  'Basic Information',
  'About You',
  'Key Skills',
  'Work Experience',
  'Education',
  'Certifications',
  'Career Preferences',
  'Salary Expectations',
  'Resume Upload',
  'Review & Complete',
];

export const CandidateOnboardingPage: React.FC<CandidateOnboardingPageProps> = ({
  onNavigate,
}) => {
  const { user, profile, role, status, refreshProfile } = useAuth();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Role and status safety guards
  useEffect(() => {
    if (role === 'employer') {
      navigate(status === 'active' ? '/employer' : '/onboarding/employer');
      return;
    }
    if (status === 'active') {
      navigate('/candidate');
    }
  }, [status, role]);

  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Draft state initialized with profile metadata where available
  const [formData, setFormData] = useState<CandidateOnboardingData>({
    fullName: profile?.full_name || '',
    headline: '',
    phone: profile?.phone || '',
    location: '',

    bio: '',
    domainSpecialization: '',
    customDomainSpecialization: '',

    skills: [],

    totalExperience: '',
    currentJobTitle: '',
    currentCompany: '',
    experienceYears: 0,

    highestQualification: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: new Date().getFullYear().toString(),

    certifications: [],

    preferredJobTitles: [],
    preferredLocations: ['Hyderabad, TS', 'Bengaluru, KA'],
    remotePreference: 'Hybrid',
    employmentType: 'Full-time',
    preferredIndustries: ['Sustainability & ESG', 'CleanTech'],
    careerInterests: '',

    minSalaryINR: 1800000,
    maxSalaryINR: 2600000,
    currency: 'INR',
    isNegotiable: true,

    resumeUrl: '',
    resumeFileName: '',
    resumeFileSize: 0,
  });

  // Sync initial form data if profile is loaded after mount
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        phone: prev.phone || profile.phone || '',
      }));
    }
  }, [profile]);

  const handleUpdate = (updates: Partial<CandidateOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setServerError(null);
    setSaveSuccess(false);
  };

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full Name is required (at least 2 characters).';
      }
      if (!formData.headline.trim() || formData.headline.trim().length < 3) {
        newErrors.headline = 'Professional Headline is required (e.g. ESG Consultant).';
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Current Location is required.';
      }
      if (formData.phone && formData.phone.trim().length < 7) {
        newErrors.phone = 'Please enter a valid phone number.';
      }
    }

    if (step === 2) {
      if (!formData.domainSpecialization) {
        newErrors.domainSpecialization = 'Please select your primary domain specialization.';
      }
      if (formData.domainSpecialization === 'Other' && !formData.customDomainSpecialization?.trim()) {
        newErrors.customDomainSpecialization = 'Please specify your specialization domain.';
      }
      if (!formData.bio.trim() || formData.bio.trim().length < 50) {
        newErrors.bio = 'Bio must be at least 50 characters long to provide sufficient detail.';
      }
      if (formData.bio.trim().length > 1000) {
        newErrors.bio = 'Bio cannot exceed 1000 characters.';
      }
    }

    if (step === 3) {
      if (!formData.skills || formData.skills.length < 3) {
        newErrors.skills = `Please add at least 3 skills (Currently: ${formData.skills?.length || 0}).`;
      }
    }

    if (step === 4) {
      if (!formData.totalExperience) {
        newErrors.totalExperience = 'Please select your total professional experience.';
      }
      if (formData.totalExperience !== 'Fresher') {
        if (!formData.currentJobTitle.trim()) {
          newErrors.currentJobTitle = 'Current or most recent job title is required.';
        }
        if (!formData.currentCompany.trim()) {
          newErrors.currentCompany = 'Current or most recent company is required.';
        }
      }
    }

    if (step === 5) {
      if (!formData.highestQualification) {
        newErrors.highestQualification = 'Please select your highest educational qualification.';
      }
      if (!formData.institution.trim()) {
        newErrors.institution = 'University or Institution name is required.';
      }
      if (!formData.fieldOfStudy.trim()) {
        newErrors.fieldOfStudy = 'Field of study or degree discipline is required.';
      }
      if (!formData.graduationYear || isNaN(Number(formData.graduationYear))) {
        newErrors.graduationYear = 'Please provide a valid graduation year.';
      }
    }

    // Step 6: Certifications optional
    if (step === 7) {
      if (!formData.preferredJobTitles || formData.preferredJobTitles.length === 0) {
        newErrors.preferredJobTitles = 'Please add at least 1 desired job title.';
      }
      if (!formData.preferredLocations || formData.preferredLocations.length === 0) {
        newErrors.preferredLocations = 'Please select at least 1 preferred job location.';
      }
      if (!formData.remotePreference) {
        newErrors.remotePreference = 'Please select your remote / workplace preference.';
      }
      if (!formData.employmentType) {
        newErrors.employmentType = 'Please select your preferred employment type.';
      }
    }

    if (step === 8) {
      if (!formData.minSalaryINR || formData.minSalaryINR <= 0) {
        newErrors.minSalaryINR = 'Please enter a valid minimum salary.';
      }
      if (!formData.maxSalaryINR || formData.maxSalaryINR <= 0) {
        newErrors.maxSalaryINR = 'Please enter a valid maximum salary.';
      }
      if (formData.minSalaryINR > formData.maxSalaryINR) {
        newErrors.salaryMismatch = 'Minimum expected salary cannot exceed maximum salary.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Progressive Supabase Persistence
  const persistStepData = async (isFinal: boolean = false): Promise<boolean> => {
    if (!isSupabaseConfigured() || !user) {
      // In local offline mode: draft is safely preserved in state
      return true;
    }

    try {
      setIsLoading(true);
      setServerError(null);

      const completionPct = calculateCandidateCompletionPct(formData);
      const domainVal =
        formData.domainSpecialization === 'Other' && formData.customDomainSpecialization
          ? formData.customDomainSpecialization
          : formData.domainSpecialization;

      // 1. Update public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          ...(isFinal ? { status: 'active' } : {}),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[CandidateOnboarding] Profiles update error:', profileError.message);
        setServerError("Your information couldn't be saved to profile. Please try again.");
        setIsLoading(false);
        return false;
      }

      // 2. Format Structured JSON payloads
      const experiencePayload =
        formData.totalExperience === 'Fresher'
          ? []
          : [
              {
                title: formData.currentJobTitle,
                company: formData.currentCompany,
                total_experience_band: formData.totalExperience,
                years: formData.experienceYears,
              },
            ];

      const educationPayload = [
        {
          qualification: formData.highestQualification,
          institution: formData.institution,
          field_of_study: formData.fieldOfStudy,
          graduation_year: formData.graduationYear,
        },
      ];

      const certificationsArray = (formData.certifications || []).map(
        (c) => `${c.name} (${c.issuingOrg}, ${c.year})`
      );

      const careerPreferencesPayload = {
        preferred_job_titles: formData.preferredJobTitles,
        preferred_locations: formData.preferredLocations,
        remote_preference: formData.remotePreference,
        employment_type: formData.employmentType,
        is_negotiable: formData.isNegotiable,
      };

      // 3. Upsert candidate_profiles
      const { error: candidateError } = await supabase
        .from('candidate_profiles')
        .upsert(
          {
            profile_id: user.id,
            headline: formData.headline.trim() || null,
            bio: formData.bio.trim() || null,
            location: formData.location.trim() || null,
            domain_specialization: domainVal || null,
            skills: formData.skills || [],
            experience: experiencePayload,
            education: educationPayload,
            certifications: certificationsArray,
            career_preferences: careerPreferencesPayload,
            preferred_salary_min: formData.minSalaryINR || null,
            preferred_salary_max: formData.maxSalaryINR || null,
            employment_preference: formData.remotePreference || null,
            resume_url: formData.resumeUrl || null,
            profile_completion_pct: completionPct,
          },
          { onConflict: 'profile_id' }
        );

      if (candidateError) {
        console.error('[CandidateOnboarding] Candidate profile error:', candidateError.message);
        setServerError("Your information couldn't be saved to candidate profile. Please try again.");
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      setSaveSuccess(true);
      return true;
    } catch (err) {
      console.error('[CandidateOnboarding] Unexpected error during persist:', err);
      setServerError('An unexpected error occurred while saving. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Next Step Advance
  const handleContinue = async () => {
    if (!validateStep(currentStep)) return;

    // If candidate has uploaded a resume on Step 1, or is on the final review step, allow direct activation to dashboard
    if (currentStep === 1 && formData.resumeUrl) {
      const saveOk = await persistStepData(true);
      if (!saveOk) return;

      await refreshProfile();
      navigate('/candidate');
      return;
    }

    if (currentStep < 10) {
      const saveOk = await persistStepData(false);
      if (!saveOk) return;

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setHighestStepReached((prev) => Math.max(prev, nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step: validate all previous steps
      let allValid = true;
      for (let s = 1; s <= 9; s++) {
        if (!validateStep(s)) {
          allValid = false;
          setCurrentStep(s);
          setServerError(`Please review and complete Step ${s} (${STEP_TITLES[s - 1]}).`);
          break;
        }
      }

      if (!allValid) return;

      const finalSaveOk = await persistStepData(true);
      if (!finalSaveOk) return;

      await refreshProfile();
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setServerError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (step: number) => {
    if (step <= highestStepReached || step <= currentStep) {
      setCurrentStep(step);
      setServerError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isCompleted) {
    return (
      <OnboardingLayout roleTitle="Candidate Setup Complete" stepCount={10} currentStep={10}>
        <OnboardingComplete
          title="Candidate Profile Activated!"
          subtitle="Your KnowToHire candidate profile is live. You can now explore verified ESG roles, submit applications, and access ATS resume diagnostics."
          role="candidate"
          portalPath="/candidate"
          onNavigateToPortal={() => navigate('/candidate')}
          metrics={[
            { label: 'Profile Score', value: `${calculateCandidateCompletionPct(formData)}%` },
            { label: 'Skills Added', value: `${formData.skills.length}` },
            { label: 'Status', value: 'Active' },
          ]}
        />
      </OnboardingLayout>
    );
  }

  const completionPct = calculateCandidateCompletionPct(formData);

  return (
    <OnboardingLayout
      roleTitle="Candidate Profile Setup"
      stepCount={10}
      currentStep={currentStep}
      sidebar={
        <CandidateOnboardingProgress
          currentStep={currentStep}
          highestStepReached={highestStepReached}
          onStepClick={handleJumpToStep}
        />
      }
    >
      <div className="space-y-6">
        {/* Progress Meter */}
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={10}
          stepTitle={STEP_TITLES[currentStep - 1]}
          completionPct={completionPct}
        />

        {/* Global Server / Save Error */}
        <OnboardingError error={serverError} />

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1BasicInfo data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 2 && (
          <Step2AboutYou data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 3 && (
          <Step3Skills data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 4 && (
          <Step4Experience data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 5 && (
          <Step5Education data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 6 && (
          <Step6Certifications data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 7 && (
          <Step7CareerPreferences data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 8 && (
          <Step8SalaryExpectations data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 9 && (
          <Step9Resume data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 10 && (
          <Step10ReviewComplete data={formData} onJumpToStep={handleJumpToStep} />
        )}

        {/* Bottom Navigation Actions */}
        <OnboardingNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === 10}
          isLoading={isLoading}
          isSaveSuccess={saveSuccess}
          continueText={
            currentStep === 1 && formData.resumeUrl
              ? 'Continue to Dashboard'
              : currentStep === 10
              ? 'Complete My Profile'
              : 'Save & Continue'
          }
        />
      </div>
    </OnboardingLayout>
  );
};
