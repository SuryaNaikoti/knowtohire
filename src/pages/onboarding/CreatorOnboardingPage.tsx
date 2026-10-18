import React, { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
import { OnboardingError } from '@/components/onboarding/OnboardingError';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CreatorOnboardingProgress } from '@/components/onboarding/CreatorOnboardingProgress';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Sparkles,
  BookOpen,
  FileCheck2,
  FileText,
} from 'lucide-react';

export interface CreatorOnboardingPageProps {
  onNavigate?: (path: string) => void;
}

export interface CreatorOnboardingData {
  displayName: string;
  bio: string;
  websiteOrPortfolio: string;
  primaryDomain: string;
  specializations: string[];
  contentFormats: string[];
  payoutMethod: 'upi' | 'bank';
  payoutUpiId: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountHolder: string;
  agreedToTerms: boolean;
}

const STEP_TITLES = [
  'Creator Profile',
  'Domain Expertise',
  'Content Focus',
  'Payout Details',
  'Terms & Agreement',
];

const DOMAIN_OPTIONS = [
  'Environmental & ESG Law',
  'Patent & Intellectual Property',
  'Corporate Sustainability & BRSR',
  'Carbon Accounting & GHG Protocol',
  'Renewable Energy & Climate Tech',
  'Life Sciences & Biotechnology',
  'Technology & Software Engineering',
  'Finance, Risk & Compliance',
];

const CONTENT_FORMAT_OPTIONS = [
  { id: 'study_guide', label: 'E-Books & Comprehensive Study Guides', icon: BookOpen },
  { id: 'templates', label: 'Document & Compliance Templates (DOCX/XLSX)', icon: FileCheck2 },
  { id: 'interview_packs', label: 'Interview Preparation Packs', icon: FileText },
  { id: 'case_studies', label: 'Industry Case Studies & Real Audits', icon: Sparkles },
];

const STORAGE_KEY = 'kth_creator_onboarding_draft';

export const CreatorOnboardingPage: React.FC<CreatorOnboardingPageProps> = ({ onNavigate }) => {
  const { user, profile, role, status, refreshProfile } = useAuth();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Role and status safety guards: Only creators belong here
  useEffect(() => {
    if (role === 'candidate') {
      navigate(status === 'active' ? '/candidate' : '/onboarding/candidate');
      return;
    }
    if (role === 'employer') {
      navigate(status === 'active' ? '/employer' : '/onboarding/employer');
      return;
    }
    if (status === 'active') {
      navigate('/creator');
    }
  }, [status, role]);

  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize draft data
  const [formData, setFormData] = useState<CreatorOnboardingData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      displayName: profile?.full_name || user?.user_metadata?.full_name || '',
      bio: '',
      websiteOrPortfolio: '',
      primaryDomain: 'Environmental & ESG Law',
      specializations: ['SEBI BRSR Core', 'Corporate Governance'],
      contentFormats: ['study_guide', 'templates'],
      payoutMethod: 'upi',
      payoutUpiId: '',
      bankAccountNumber: '',
      bankIfscCode: '',
      bankAccountHolder: profile?.full_name || user?.user_metadata?.full_name || '',
      agreedToTerms: false,
    };
  });

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.displayName.trim() || formData.displayName.trim().length < 2) {
        newErrors.displayName = 'Display or Author name must be at least 2 characters.';
      }
      if (!formData.bio.trim() || formData.bio.trim().length < 20) {
        newErrors.bio = 'Please provide a short creator bio (at least 20 characters).';
      }
    }

    if (step === 2) {
      if (!formData.primaryDomain) {
        newErrors.primaryDomain = 'Please select your primary domain of expertise.';
      }
    }

    if (step === 3) {
      if (!formData.contentFormats || formData.contentFormats.length === 0) {
        newErrors.contentFormats = 'Please select at least one format of content you plan to publish.';
      }
    }

    if (step === 4) {
      if (formData.payoutMethod === 'upi') {
        if (!formData.payoutUpiId.trim() || !formData.payoutUpiId.includes('@')) {
          newErrors.payoutUpiId = 'Please enter a valid UPI VPA ID (e.g. yourname@okhdfcbank).';
        }
      } else {
        if (!formData.bankAccountNumber.trim() || formData.bankAccountNumber.length < 8) {
          newErrors.bankAccountNumber = 'Please enter a valid bank account number.';
        }
        if (!formData.bankIfscCode.trim() || formData.bankIfscCode.length < 5) {
          newErrors.bankIfscCode = 'Please enter a valid bank IFSC code.';
        }
      }
    }

    if (step === 5) {
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'You must accept the Creator Royalty Terms to activate your Creator Studio.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setHighestStepReached((prev) => Math.max(prev, nextStep));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalSubmission();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (step: number) => {
    if (step <= highestStepReached) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmission = async () => {
    setIsLoading(true);
    setServerError(null);

    const userId = user?.id;
    if (!userId) {
      setServerError('User authentication session could not be resolved.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Update public.profiles status to 'active'
      if (isSupabaseConfigured()) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            full_name: formData.displayName,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileErr) {
          console.warn('[CreatorOnboarding] profile update notice:', profileErr);
        }
      }

      // 2. Persist creator preferences in localStorage
      localStorage.setItem(`kth_creator_profile_${userId}`, JSON.stringify(formData));
      localStorage.removeItem(STORAGE_KEY);

      // 3. Refresh Auth Profile
      await refreshProfile();

      setIsLoading(false);
      setIsCompleted(true);
    } catch (err: any) {
      setIsLoading(false);
      setServerError(err.message || 'An unexpected error occurred during creator onboarding activation.');
    }
  };

  if (isCompleted) {
    return (
      <OnboardingLayout
        roleTitle="Content Creator"
        stepCount={5}
        currentStep={5}
      >
        <OnboardingComplete
          title="Creator Studio Ready!"
          subtitle="Your verified Creator profile is now activated. You can publish professional templates, research guides, and earn 70% royalties."
          role="creator"
          portalPath="/creator"
          onNavigateToPortal={() => navigate('/creator')}
          metrics={[
            { label: 'Royalty Share', value: '70%' },
            { label: 'Primary Domain', value: formData.primaryDomain.split('&')[0] },
            { label: 'Payout Method', value: formData.payoutMethod.toUpperCase() },
          ]}
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      roleTitle="Content Creator Onboarding"
      stepCount={5}
      currentStep={currentStep}
      sidebar={
        <div className="space-y-4">
          <CreatorOnboardingProgress
            currentStep={currentStep}
            highestStepReached={highestStepReached}
            onStepClick={handleJumpToStep}
          />
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-left">
            <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>70% Direct Creator Royalties</span>
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Creators retain 70% of every template and resource purchase with transparent automated accounting and zero subscription fees.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={5}
          stepTitle={STEP_TITLES[currentStep - 1]}
        />

        {serverError && <OnboardingError error={serverError} onClear={() => setServerError(null)} />}

        {/* STEP 1: Creator Profile */}
        {currentStep === 1 && (
          <div className="space-y-5 text-left">
            <OnboardingStepHeader
              stepNumber={1}
              title="Creator Identity & Author Profile"
              subtitle="Introduce yourself to professionals and students who will learn from your published materials."
              tag="Identity"
            />

            <div className="space-y-4">
              <Input
                label="Author / Creator Display Name"
                placeholder="e.g. Dr. Priya Raman / ESG Advisory Practice"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                error={errors.displayName}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Creator Bio & Professional Summary *</label>
                <Textarea
                  placeholder="Summarize your background, certifications, and what learners will gain from your resources..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  error={errors.bio}
                />
                <span className="text-[10px] text-slate-400">Min. 20 characters describing your subject matter expertise.</span>
              </div>

              <Input
                label="Portfolio, LinkedIn or Research URL (Optional)"
                placeholder="https://linkedin.com/in/yourprofile or https://yourdomain.com"
                value={formData.websiteOrPortfolio}
                onChange={(e) => setFormData({ ...formData, websiteOrPortfolio: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Domain Expertise */}
        {currentStep === 2 && (
          <div className="space-y-5 text-left">
            <OnboardingStepHeader
              stepNumber={2}
              title="Domain Specialization"
              subtitle="Choose the primary discipline under which your research documents and study packs will be cataloged."
              tag="Discipline"
            />

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700">Primary Domain *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DOMAIN_OPTIONS.map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryDomain: dom })}
                    className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      formData.primaryDomain === dom
                        ? 'border-kth-primary-600 bg-kth-primary-50 text-kth-primary-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
              {errors.primaryDomain && <p className="text-xs text-red-600">{errors.primaryDomain}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: Content Focus */}
        {currentStep === 3 && (
          <div className="space-y-5 text-left">
            <OnboardingStepHeader
              stepNumber={3}
              title="What Formats Do You Plan to Publish?"
              subtitle="Select all formats of career materials, guides, or document kits you intend to upload."
              tag="Format Selection"
            />

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTENT_FORMAT_OPTIONS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = formData.contentFormats.includes(fmt.id);

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => {
                        const updated = isSelected
                          ? formData.contentFormats.filter((id) => id !== fmt.id)
                          : [...formData.contentFormats, fmt.id];
                        setFormData({ ...formData, contentFormats: updated });
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-kth-primary-600 bg-kth-primary-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-kth-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-xs text-slate-900 block">{fmt.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {isSelected ? '✓ Format included in your studio' : 'Click to include format'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.contentFormats && <p className="text-xs text-red-600">{errors.contentFormats}</p>}
            </div>
          </div>
        )}

        {/* STEP 4: Payout Details */}
        {currentStep === 4 && (
          <div className="space-y-5 text-left">
            <OnboardingStepHeader
              stepNumber={4}
              title="Royalty Payout Account"
              subtitle="Configure where your 70% royalties will be deposited once you cross the ₹1,500 payout threshold."
              tag="Earnings & Banking"
            />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payoutMethod: 'upi' })}
                  className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.payoutMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  ⚡ Direct UPI (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payoutMethod: 'bank' })}
                  className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.payoutMethod === 'bank'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  🏛️ NEFT / IMPS Bank Transfer
                </button>
              </div>

              {formData.payoutMethod === 'upi' ? (
                <Input
                  label="UPI VPA ID"
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  value={formData.payoutUpiId}
                  onChange={(e) => setFormData({ ...formData, payoutUpiId: e.target.value })}
                  error={errors.payoutUpiId}
                  required
                />
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Account Holder Full Name"
                    placeholder="As printed on bank passbook"
                    value={formData.bankAccountHolder}
                    onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Bank Account Number"
                      placeholder="Account number"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      error={errors.bankAccountNumber}
                      required
                    />
                    <Input
                      label="IFSC Code"
                      placeholder="e.g. HDFC0001234"
                      value={formData.bankIfscCode}
                      onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value.toUpperCase() })}
                      error={errors.bankIfscCode}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Terms & Agreement */}
        {currentStep === 5 && (
          <div className="space-y-5 text-left">
            <OnboardingStepHeader
              stepNumber={5}
              title="Creator Royalty & Quality Agreement"
              subtitle="Review KnowToHire's clear royalty policy and quality commitment before publishing."
              tag="Agreement"
            />

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto">
              <h4 className="font-bold text-slate-900">Key Terms of the KnowToHire Creator Program:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>70% Net Commission:</strong> You receive 70% of the sale price in INR for every purchased guide, document, or template.
                </li>
                <li>
                  <strong>Zero Subscription Fee:</strong> Creators are never charged monthly or annual fees to publish or earn on KnowToHire.
                </li>
                <li>
                  <strong>Moderation & Integrity:</strong> Every document submitted undergoes admin quality indexing to prevent plagiarized or unlawful content.
                </li>
                <li>
                  <strong>Withdrawal Threshold:</strong> You can trigger withdrawal payouts once your accumulated commissions reach ₹1,500.
                </li>
                <li>
                  <strong>IP Ownership:</strong> You retain intellectual property copyright over your original authored material.
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-kth-primary-600 rounded border-slate-300 focus:ring-kth-primary-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  I accept the KnowToHire Creator Terms & Conditions, agree to the 70% royalty model, and confirm that all uploaded resources are my original work.
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-xs text-red-600 mt-1">{errors.agreedToTerms}</p>}
            </div>
          </div>
        )}

        <OnboardingNavigation
          onBack={handleBack}
          onContinue={handleNext}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === 5}
          isLoading={isLoading}
          continueText={currentStep === 5 ? 'Activate Creator Studio' : 'Save & Continue'}
          isSaveSuccess={saveSuccess}
        />
      </div>
    </OnboardingLayout>
  );
};
