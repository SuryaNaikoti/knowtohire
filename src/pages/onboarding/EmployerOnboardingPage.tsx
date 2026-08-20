import React, { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
import { OnboardingError } from '@/components/onboarding/OnboardingError';
import { EmployerOnboardingProgress } from '@/components/onboarding/EmployerOnboardingProgress';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';

import { Step1RecruiterInfo } from '@/components/onboarding/employer/Step1RecruiterInfo';
import { Step2CompanyIdentity } from '@/components/onboarding/employer/Step2CompanyIdentity';
import { Step3CompanyLocation } from '@/components/onboarding/employer/Step3CompanyLocation';
import { Step4CompanyDescription } from '@/components/onboarding/employer/Step4CompanyDescription';
import { Step5OnlinePresence } from '@/components/onboarding/employer/Step5OnlinePresence';
import { Step6ContactAdmin } from '@/components/onboarding/employer/Step6ContactAdmin';
import { Step7ReviewComplete } from '@/components/onboarding/employer/Step7ReviewComplete';

import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { EmployerOnboardingData } from '@/types/onboarding';

export interface EmployerOnboardingPageProps {
  onNavigate?: (path: string) => void;
}

const STEP_TITLES = [
  'Recruiter Information',
  'Company Identity',
  'Company Location',
  'Company Description',
  'Online Presence',
  'Contact & Admin',
  'Review & Complete',
];

export const EmployerOnboardingPage: React.FC<EmployerOnboardingPageProps> = ({
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
    if (role === 'candidate') {
      navigate(status === 'active' ? '/candidate' : '/onboarding/candidate');
      return;
    }
    if (status === 'active') {
      navigate('/employer');
    }
  }, [status, role]);

  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Draft state initialized with profile metadata
  const [formData, setFormData] = useState<EmployerOnboardingData>({
    fullName: profile?.full_name || '',
    jobTitle: '',
    workPhone: profile?.phone || '',

    companyName: (user?.user_metadata?.company_name as string) || '',
    legalName: '',
    websiteUrl: '',
    industry: 'Environmental & ESG Advisory',
    companySize: '51–200 Employees',

    headquartersLocation: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',

    description: '',
    mission: '',
    cultureBenefits: '',

    website: '',
    linkedinUrl: '',

    workEmail: profile?.email || user?.email || '',
    contactPhone: profile?.phone || '',
    isCompanyAdmin: true,
  });

  const handleUpdate = (updates: Partial<EmployerOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setServerError(null);
    setSaveSuccess(false);
  };

  const isValidUrl = (urlStr: string): boolean => {
    if (!urlStr.trim()) return false;
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return Boolean(parsed.hostname);
    } catch {
      return false;
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full Name is required (at least 2 characters).';
      }
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Professional Job Title is required.';
      }
      if (!formData.workPhone.trim() || formData.workPhone.trim().length < 7) {
        newErrors.workPhone = 'Please enter a valid work phone number.';
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim() || formData.companyName.trim().length < 2) {
        newErrors.companyName = 'Company display name is required.';
      }
      if (!formData.legalName.trim() || formData.legalName.trim().length < 2) {
        newErrors.legalName = 'Registered legal company name is required.';
      }
      if (!formData.websiteUrl.trim() || !isValidUrl(formData.websiteUrl)) {
        newErrors.websiteUrl = 'Please enter a valid corporate website URL.';
      }
      if (!formData.industry) {
        newErrors.industry = 'Please select your industry sector.';
      }
      if (!formData.companySize) {
        newErrors.companySize = 'Please select your employee scale.';
      }
    }

    if (step === 3) {
      if (!formData.headquartersLocation.trim()) {
        newErrors.headquartersLocation = 'Headquarters location address is required.';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required.';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required.';
      }
    }

    if (step === 4) {
      if (!formData.description.trim() || formData.description.trim().length < 50) {
        newErrors.description = 'Company description must be at least 50 characters.';
      }
      if (formData.description.trim().length > 1000) {
        newErrors.description = 'Company description cannot exceed 1000 characters.';
      }
    }

    if (step === 5) {
      const urlToCheck = formData.website || formData.websiteUrl;
      if (!urlToCheck.trim() || !isValidUrl(urlToCheck)) {
        newErrors.websiteUrl = 'Please enter a valid website URL.';
      }
      if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
        newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL.';
      }
    }

    if (step === 6) {
      const phoneToCheck = formData.contactPhone || formData.workPhone;
      if (!phoneToCheck.trim() || phoneToCheck.trim().length < 7) {
        newErrors.contactPhone = 'Please enter a valid contact phone number.';
      }
      if (!formData.isCompanyAdmin) {
        newErrors.isCompanyAdmin = 'You must acknowledge authorized representation of this company.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Progressive Persistence to Supabase
  const persistEmployerData = async (isFinal: boolean = false): Promise<boolean> => {
    if (!isSupabaseConfigured() || !user) {
      return true; // Local offline mode
    }

    try {
      setIsLoading(true);
      setServerError(null);

      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName.trim(),
          phone: formData.workPhone.trim() || null,
          ...(isFinal ? { status: 'active' } : {}),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[EmployerOnboarding] Profile update error:', profileError.message);
        setServerError("Your information couldn't be saved to profile. Please try again.");
        setIsLoading(false);
        return false;
      }

      // 2. Check if company profile already exists or insert new company profile
      let companyId: string | null = null;

      // Check if user already has an employer_profile linked to a company
      const { data: existingEmployerProfile } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', user.id)
        .maybeSingle();

      const companyNameCandidate = formData.companyName.trim() || 
        (user?.user_metadata?.company_name as string)?.trim() || 
        'My Enterprise';

      if (existingEmployerProfile?.company_id) {
        companyId = existingEmployerProfile.company_id;
        // Update existing company
        const { error: companyUpdateErr } = await supabase
          .from('company_profiles')
          .update({
            ...(formData.companyName.trim() ? { name: formData.companyName.trim() } : {}),
            legal_name: formData.legalName.trim() || null,
            website_url: (formData.websiteUrl || formData.website).trim() || null,
            industry: formData.industry || null,
            company_size: formData.companySize || null,
            headquarters_location: formData.headquartersLocation.trim() || null,
            description: formData.description.trim() || null,
            // Verification status remains unverified as required
            verification_status: 'unverified',
          })
          .eq('id', companyId);

        if (companyUpdateErr) {
          console.error('[EmployerOnboarding] Company update error:', companyUpdateErr.message);
        }
      } else {
        // Insert new company profile
        const { data: newCompany, error: companyInsertErr } = await supabase
          .from('company_profiles')
          .insert({
            name: companyNameCandidate,
            legal_name: formData.legalName.trim() || null,
            website_url: (formData.websiteUrl || formData.website).trim() || null,
            industry: formData.industry || null,
            company_size: formData.companySize || null,
            headquarters_location: formData.headquartersLocation.trim() || null,
            description: formData.description.trim() || null,
            verification_status: 'unverified',
          })
          .select('id')
          .single();

        if (companyInsertErr || !newCompany) {
          console.error('[EmployerOnboarding] Company insert error:', companyInsertErr?.message);
          setServerError("Failed to create company profile record. Please try again.");
          setIsLoading(false);
          return false;
        }

        companyId = newCompany.id;
      }

      // 3. Upsert employer_profiles linking profile_id to company_id
      if (companyId) {
        const { error: employerProfileErr } = await supabase
          .from('employer_profiles')
          .upsert(
            {
              profile_id: user.id,
              company_id: companyId,
              job_title: formData.jobTitle.trim() || null,
              work_phone: formData.workPhone.trim() || null,
              is_company_admin: true,
            },
            { onConflict: 'profile_id' }
          );

        if (employerProfileErr) {
          console.error('[EmployerOnboarding] Employer profile error:', employerProfileErr.message);
          setServerError("Failed to link employer profile. Please try again.");
          setIsLoading(false);
          return false;
        }
      }

      setIsLoading(false);
      setSaveSuccess(true);
      return true;
    } catch (err) {
      console.error('[EmployerOnboarding] Unexpected error during persist:', err);
      setServerError('An unexpected error occurred while saving. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const handleContinue = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 7) {
      const saveOk = await persistEmployerData(false);
      if (!saveOk) return;

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setHighestStepReached((prev) => Math.max(prev, nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final submission: validate all steps 1..6
      let allValid = true;
      for (let s = 1; s <= 6; s++) {
        if (!validateStep(s)) {
          allValid = false;
          setCurrentStep(s);
          setServerError(`Please complete required fields in Step ${s} (${STEP_TITLES[s - 1]}).`);
          break;
        }
      }

      if (!allValid) return;

      const finalSaveOk = await persistEmployerData(true);
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
      <OnboardingLayout roleTitle="Employer Setup Complete" stepCount={7} currentStep={7}>
        <OnboardingComplete
          title="Employer Account Activated!"
          subtitle="Your enterprise account has been configured. You can now publish verified job listings, manage ATS candidate pipelines, and review ESG candidate matches."
          role="employer"
          portalPath="/employer"
          onNavigateToPortal={() => navigate('/employer')}
          metrics={[
            { label: 'Company', value: formData.companyName },
            { label: 'Role', value: formData.jobTitle || 'Admin' },
            { label: 'Verification', value: 'Pending' },
          ]}
        />
      </OnboardingLayout>
    );
  }

  const completionPct = Math.round(((currentStep - 1) / 7) * 100);

  return (
    <OnboardingLayout
      roleTitle="Employer Account Setup"
      stepCount={7}
      currentStep={currentStep}
      sidebar={
        <EmployerOnboardingProgress
          currentStep={currentStep}
          highestStepReached={highestStepReached}
          onStepClick={handleJumpToStep}
        />
      }
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={7}
          stepTitle={STEP_TITLES[currentStep - 1]}
          completionPct={completionPct}
        />

        {/* Global Error Banner */}
        <OnboardingError error={serverError} />

        {/* Step Form Render */}
        {currentStep === 1 && (
          <Step1RecruiterInfo data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 2 && (
          <Step2CompanyIdentity data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 3 && (
          <Step3CompanyLocation data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 4 && (
          <Step4CompanyDescription data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 5 && (
          <Step5OnlinePresence data={formData} onChange={handleUpdate} errors={errors} />
        )}
        {currentStep === 6 && (
          <Step6ContactAdmin
            data={formData}
            onChange={handleUpdate}
            errors={errors}
            authEmail={formData.workEmail}
          />
        )}
        {currentStep === 7 && (
          <Step7ReviewComplete
            data={formData}
            authEmail={formData.workEmail}
            onJumpToStep={handleJumpToStep}
          />
        )}

        {/* Navigation Action Buttons */}
        <OnboardingNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === 7}
          isLoading={isLoading}
          isSaveSuccess={saveSuccess}
          continueText={currentStep === 7 ? 'Complete Employer Setup' : 'Save & Continue'}
        />
      </div>
    </OnboardingLayout>
  );
};
