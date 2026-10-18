import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MailCheck, RefreshCw, ArrowLeft, Mail } from 'lucide-react';

export interface VerifyEmailPageProps {
  onNavigate?: (path: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { user, role, status, isAuthenticated, isInitialized, isLoading, logout } = useAuth();

  // Extract candidate email from query parameter, current session, or sessionStorage
  const searchParams = new URLSearchParams(window.location.search);
  const emailFromUrl = searchParams.get('email');
  const emailFromStorage = typeof window !== 'undefined' && window.sessionStorage
    ? window.sessionStorage.getItem('kth_pending_verification_email')
    : null;

  const rawCandidateEmail = (user?.email || emailFromUrl || emailFromStorage || '').trim().toLowerCase();
  const isCandidateEmailValid = Boolean(rawCandidateEmail && EMAIL_REGEX.test(rawCandidateEmail));

  // Editable email state in case user arrived without state or made a typo
  const [emailInput, setEmailInput] = useState<string>(isCandidateEmailValid ? rawCandidateEmail : '');
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!isCandidateEmailValid);

  // Synchronize email state if auth user or URL changes
  useEffect(() => {
    if (rawCandidateEmail && EMAIL_REGEX.test(rawCandidateEmail)) {
      setEmailInput(rawCandidateEmail);
      setIsEditingEmail(false);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('kth_pending_verification_email', rawCandidateEmail);
      }
    }
  }, [rawCandidateEmail]);

  const activeTargetEmail = (emailInput || rawCandidateEmail).trim().toLowerCase();
  const isTargetEmailValid = Boolean(activeTargetEmail && EMAIL_REGEX.test(activeTargetEmail));

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [pageAlert, setPageAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // If user is already verified and active/pending onboarding, forward them forward
  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && role !== null) {
      if (status === 'pending_onboarding') {
        const onboardingPath =
          role === 'employer'
            ? '/onboarding/employer'
            : role === 'creator'
            ? '/creator'
            : '/onboarding/candidate';
        navigate(onboardingPath);
      } else if (status === 'active') {
        const portalPath =
          role === 'employer'
            ? '/employer'
            : role === 'creator'
            ? '/creator'
            : role === 'admin'
            ? '/admin'
            : '/candidate';
        navigate(portalPath);
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, status, role]);

  // Cooldown countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setPageAlert(null);

    const normalizedTargetEmail = activeTargetEmail.trim().toLowerCase();
    if (!normalizedTargetEmail || !EMAIL_REGEX.test(normalizedTargetEmail)) {
      setPageAlert({
        type: 'error',
        title: 'Invalid Email Address',
        message: 'Please provide a valid registered email address to resend the verification link.',
      });
      setIsEditingEmail(true);
      return;
    }

    if (!isSupabaseConfigured()) {
      setPageAlert({
        type: 'error',
        title: 'Configuration Error',
        message: 'Supabase credentials are not configured in environment.',
      });
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedTargetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const isRateLimit =
          error.status === 429 ||
          error.message.toLowerCase().includes('rate limit') ||
          error.message.toLowerCase().includes('too many requests') ||
          error.message.toLowerCase().includes('security purposes');

        if (isRateLimit) {
          setCooldown(60);
          setPageAlert({
            type: 'warning',
            title: 'Resend Cooldown Active',
            message: 'A verification email was recently dispatched. For security purposes, please wait 60 seconds before requesting another email.',
          });
        } else {
          setPageAlert({
            type: 'error',
            title: 'Resend Failed',
            message: error.message || 'Unable to dispatch verification email. Please check the address and try again.',
          });
        }
      } else {
        setPageAlert({
          type: 'success',
          title: 'Verification Link Dispatched',
          message: `A new confirmation link has been sent to ${normalizedTargetEmail}. Please open the email and click the confirmation link. If you requested multiple emails, make sure to use the link from the newest message.`,
        });
        setCooldown(60);
        setIsEditingEmail(false);
      }
    } catch {
      setPageAlert({
        type: 'error',
        title: 'Dispatch Error',
        message: 'An unexpected network error occurred while dispatching the verification email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = async () => {
    if (isAuthenticated) {
      await logout();
    }
    navigate('/login');
  };

  return (
    <AuthLayout
      brandTitle="Verify Your Email"
      brandSubtitle="Confirm your email address to activate your account and start your journey on KnowToHire."
      brandFeatures={[
        {
          title: "Account Security",
          description: "Protecting your profile and personal data",
        },
        {
          title: "Instant Verification",
          description: "One click to complete your onboarding",
        },
      ]}
    >
      <div className="space-y-6 text-center">
        {/* Verification Icon Presentation */}
        <div className="w-14 h-14 rounded-full bg-blue-50 text-[#5145F5] flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <MailCheck className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Verify your email
          </h2>
          <p className="text-xs text-slate-500">
            Click the confirmation link sent to your registered inbox to activate your account.
          </p>
        </div>

        {/* Informational Email Box or Editable Email Input */}
        {isEditingEmail ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2">
            <label className="text-xs font-semibold text-slate-800 block">
              Registered Email Address
            </label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. name@company.com"
              error={!isTargetEmailValid && emailInput ? 'Please enter a valid email format' : undefined}
            />
            <p className="text-[11px] text-slate-500">
              Ensure this matches the email address you used to register.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Target Email Address
            </span>
            <strong className="font-mono text-sm text-slate-900 break-all block">
              {activeTargetEmail}
            </strong>
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="text-xs text-[#5145F5] hover:text-[#4338CA] font-semibold underline pt-1 block mx-auto cursor-pointer"
            >
              Change email address
            </button>
          </div>
        )}

        <div className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto space-y-2 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-left">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-[#5145F5] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">
                Check your inbox for "Confirm your email address"
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Clicking the confirmation link inside the email will automatically verify your account and take you directly to your onboarding setup.
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] pt-1 border-t border-blue-100/70">
            Links are valid for 24 hours. Check your spam or promotions folder if the email doesn't appear within a few minutes.
          </p>
        </div>

        {/* Page Status Alerts */}
        {pageAlert && (
          <Alert variant={pageAlert.type} title={pageAlert.title}>
            {pageAlert.message}
          </Alert>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            size="md"
            className="w-full font-semibold"
            isLoading={isResending}
            disabled={cooldown > 0 || isResending}
            onClick={handleResend}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />}
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-600 hover:text-slate-900 cursor-pointer"
            onClick={handleBackToSignIn}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};
