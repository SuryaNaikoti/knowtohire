import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth, resolveRole } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface VerifyEmailPageProps {
  onNavigate?: (path: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { user, role, status, isAuthenticated, isInitialized, isLoading, refreshProfile, logout } = useAuth();
  
  // Extract email from query parameter or current auth user
  const searchParams = new URLSearchParams(window.location.search);
  const emailFromUrl = searchParams.get('email');
  const targetEmail = user?.email || emailFromUrl || 'your registered email';

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // If user is already verified or active, forward them to their next required stage
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

    setResendStatus(null);
    setIsResending(true);

    if (!isSupabaseConfigured()) {
      setResendStatus({
        type: 'error',
        message: 'Supabase credentials are not configured in environment.',
      });
      setIsResending(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        setResendStatus({ type: 'error', message: error.message });
      } else {
        setResendStatus({
          type: 'success',
          message: `Verification link successfully resent to ${targetEmail}.`,
        });
        setCooldown(60); // 60s cooldown trigger
      }
    } catch {
      setResendStatus({ type: 'error', message: 'Failed to resend verification email.' });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setResendStatus(null);

    try {
      const updatedProfile = await refreshProfile();
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      const targetRole = resolveRole(freshUser || user, updatedProfile, role) || 'candidate';

      if (updatedProfile?.status === 'active') {
        const portalPath = targetRole === 'employer' ? '/employer' : '/candidate';
        navigate(portalPath);
      } else {
        const onboardingPath = targetRole === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
        navigate(onboardingPath);
      }
    } catch {
      navigate('/onboarding/candidate');
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
      subtitle="We've sent a verification link to your registered email address."
      badgeText="Email Verification Required"
    >
      <div className="space-y-6 text-center">
        {/* Verification Icon Presentation */}
        <div className="w-16 h-16 rounded-full bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center mx-auto border border-kth-primary-100 shadow-xs">
          <MailCheck className="w-8 h-8" />
        </div>

        {/* Informational Email Box */}
        <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 space-y-1">
          <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider block">
            Target Email Address
          </span>
          <strong className="font-mono text-sm text-kth-slate-900 break-all block">
            {targetEmail}
          </strong>
        </div>

        <p className="text-xs text-kth-slate-600 leading-relaxed max-w-sm mx-auto">
          Email confirmation has been bypassed. You can continue directly to complete your onboarding profile.
        </p>

        {/* Resend Status Alerts */}
        {resendStatus && (
          <Alert variant={resendStatus.type} title={resendStatus.type === 'success' ? 'Email Sent' : 'Verification Status'}>
            {resendStatus.message}
          </Alert>
        )}

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
            Continue to Account Onboarding
          </Button>

          <Button
            variant="outline"
            size="md"
            className="w-full"
            isLoading={isResending}
            disabled={cooldown > 0 || isResending}
            onClick={handleResend}
            leftIcon={<RefreshCw className="w-4 h-4" />}
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
