import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuth, resolveRole } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export interface VerifyEmailPageProps {
  onNavigate?: (path: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { user, role, status, isAuthenticated, isInitialized, isLoading, refreshProfile, logout } = useAuth();

  // Extract candidate email from query parameter, current session, or sessionStorage
  const searchParams = new URLSearchParams(window.location.search);
  const emailFromUrl = searchParams.get('email');
  const emailFromStorage = typeof window !== 'undefined' && window.sessionStorage
    ? window.sessionStorage.getItem('kth_pending_verification_email')
    : null;

  const rawCandidateEmail = user?.email || emailFromUrl || emailFromStorage || '';
  const trimmedCandidateEmail = rawCandidateEmail.trim();
  const isCandidateEmailValid = Boolean(trimmedCandidateEmail && EMAIL_REGEX.test(trimmedCandidateEmail));

  // Editable email state in case user arrived without state or made a typo
  const [emailInput, setEmailInput] = useState<string>(isCandidateEmailValid ? trimmedCandidateEmail : '');
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!isCandidateEmailValid);

  // OTP input state for users receiving 6-digit verification code
  const [otpCode, setOtpCode] = useState<string>('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Synchronize email state if auth user or URL changes
  useEffect(() => {
    if (trimmedCandidateEmail && EMAIL_REGEX.test(trimmedCandidateEmail)) {
      setEmailInput(trimmedCandidateEmail);
      setIsEditingEmail(false);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('kth_pending_verification_email', trimmedCandidateEmail);
      }
    }
  }, [trimmedCandidateEmail]);

  const activeTargetEmail = (emailInput || trimmedCandidateEmail).trim();
  const isTargetEmailValid = Boolean(activeTargetEmail && EMAIL_REGEX.test(activeTargetEmail));

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
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
        const onboardingPath = role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
        navigate(onboardingPath);
      } else if (status === 'active') {
        const portalPath = role === 'employer' ? '/employer' : '/candidate';
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

    if (!isTargetEmailValid) {
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
        email: activeTargetEmail,
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
          message: `A fresh verification link has been sent to ${activeTargetEmail}. Please check your inbox and spam folder.`,
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setPageAlert({
        type: 'error',
        title: 'Code Required',
        message: 'Please enter the 6-digit confirmation code received in your email.',
      });
      return;
    }

    if (!isTargetEmailValid) {
      setPageAlert({
        type: 'error',
        title: 'Email Required',
        message: 'Please provide a valid email address matching the verification code.',
      });
      return;
    }

    setIsVerifyingOtp(true);
    setPageAlert(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: activeTargetEmail,
        token: otpCode.trim(),
        type: 'signup',
      });

      if (error) {
        setPageAlert({
          type: 'error',
          title: 'Verification Failed',
          message: error.message || 'Invalid or expired confirmation code. Please request a new one.',
        });
      } else if (data.user) {
        setPageAlert({
          type: 'success',
          title: 'Email Confirmed!',
          message: 'Your email address has been successfully confirmed. Directing to onboarding...',
        });
        const updatedProfile = await refreshProfile();
        const targetRole = resolveRole(data.user, updatedProfile, role) || 'candidate';
        const onboardingPath = targetRole === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
        navigate(onboardingPath);
      }
    } catch (err: any) {
      setPageAlert({
        type: 'error',
        title: 'Verification Error',
        message: err?.message || 'An error occurred while verifying the code.',
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setPageAlert(null);

    try {
      const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !freshUser) {
        setPageAlert({
          type: 'warning',
          title: 'Confirmation Pending',
          message: 'Your email confirmation link has not been activated yet. Please click the link in your verification email or sign in after confirming.',
        });
        return;
      }

      const isConfirmed = Boolean(freshUser.email_confirmed_at || (freshUser as any).confirmed_at);
      if (!isConfirmed) {
        setPageAlert({
          type: 'warning',
          title: 'Verification Incomplete',
          message: 'Your email address has not been confirmed in Supabase Auth yet. Please open the confirmation link sent to your inbox.',
        });
        return;
      }

      // Confirmed in Supabase! Refresh profile and proceed
      const updatedProfile = await refreshProfile();
      const targetRole = resolveRole(freshUser, updatedProfile, role) || 'candidate';

      if (updatedProfile?.status === 'active') {
        const portalPath = targetRole === 'employer' ? '/employer' : '/candidate';
        navigate(portalPath);
      } else {
        const onboardingPath = targetRole === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
        navigate(onboardingPath);
      }
    } catch {
      setPageAlert({
        type: 'error',
        title: 'Check Failed',
        message: 'Could not verify confirmation status. Please check your network connection.',
      });
    } finally {
      setIsCheckingStatus(false);
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
      title="Verify your email"
      subtitle="We've sent a verification link to your registered email address to secure your account."
      badgeText="Email Verification Required"
    >
      <div className="space-y-6 text-center">
        {/* Verification Icon Presentation */}
        <div className="w-16 h-16 rounded-full bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center mx-auto border border-kth-primary-100 shadow-xs">
          <MailCheck className="w-8 h-8" />
        </div>

        {/* Informational Email Box or Editable Email Input */}
        {isEditingEmail ? (
          <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-left space-y-2">
            <label className="text-xs font-semibold text-kth-slate-800 block">
              Registered Email Address
            </label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. name@company.com"
              error={!isTargetEmailValid && emailInput ? 'Please enter a valid email format' : undefined}
            />
            <p className="text-[11px] text-kth-slate-500">
              Ensure this matches the email address you used to register.
            </p>
          </div>
        ) : (
          <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider block">
              Target Email Address
            </span>
            <strong className="font-mono text-sm text-kth-slate-900 break-all block">
              {activeTargetEmail}
            </strong>
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="text-xs text-kth-primary-600 hover:text-kth-primary-700 font-semibold underline pt-1 block mx-auto cursor-pointer"
            >
              Change email address
            </button>
          </div>
        )}

        <div className="text-xs text-kth-slate-600 leading-relaxed max-w-sm mx-auto space-y-1">
          <p>
            Please check your inbox and click the verification link to activate your KnowToHire account.
          </p>
          <p className="text-kth-slate-400 text-[11px]">
            Links are valid for 24 hours. Check your spam or promotions folder if you do not see it immediately.
          </p>
        </div>

        {/* Page Status Alerts */}
        {pageAlert && (
          <Alert variant={pageAlert.type} title={pageAlert.title}>
            {pageAlert.message}
          </Alert>
        )}

        {/* Optional 6-digit Code verification section */}
        <div className="border-t border-kth-slate-100 pt-4 text-left">
          <details className="group cursor-pointer">
            <summary className="text-xs font-bold text-kth-slate-700 flex items-center justify-between list-none py-1">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-kth-primary-600" />
                Have a 6-digit confirmation code instead?
              </span>
              <span className="text-[11px] text-kth-primary-600 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <form onSubmit={handleVerifyOtp} className="mt-3 space-y-2.5">
              <Input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code (e.g. 123456)"
                className="tracking-widest font-mono text-center font-bold"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full font-semibold"
                isLoading={isVerifyingOtp}
                disabled={isVerifyingOtp || otpCode.trim().length < 6}
              >
                Submit Code
              </Button>
            </form>
          </details>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="emerald"
            size="md"
            className="w-full font-bold"
            isLoading={isCheckingStatus}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleCheckStatus}
          >
            I've Confirmed My Email
          </Button>

          <Button
            variant="outline"
            size="md"
            className="w-full"
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
            className="w-full"
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
