import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';
import { verifyEmailSchema, type VerifyEmailFormValues } from '../../lib/validation/authSchemas';
import { FormErrorSummary } from '../../components/auth/FormErrorSummary';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Mail, ArrowRight } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [verifyingToken, setVerifyingToken] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  // Resend Cooldown & Limits
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  const tokenHash = searchParams.get('token_hash');
  const typeParam = (searchParams.get('type') as any) || 'signup';
  const emailParam = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    mode: 'onChange',
    defaultValues: {
      email: emailParam,
      otp: '',
    },
  });

  const emailValue = useWatch({ control, name: 'email' });

  // Cooldown timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Automatic Magic Link Token Exchange if token_hash is in URL
  useEffect(() => {
    if (tokenHash) {
      const verifyTokenHash = async () => {
        setVerifyingToken(true);
        setServerError(null);
        setIsTokenExpired(false);

        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeParam,
          });

          if (error) {
            if (
              error.message.toLowerCase().includes('expired') ||
              error.message.toLowerCase().includes('invalid')
            ) {
              setIsTokenExpired(true);
              throw new Error('Verification link has expired or was already used. Please request a new verification email.');
            }
            throw error;
          }

          setVerificationSuccess(true);
          setTimeout(() => navigate('/role-selection', { replace: true }), 1500);
        } catch (err: any) {
          setServerError(err.message || 'Verification link processing failed.');
        } finally {
          setVerifyingToken(false);
        }
      };

      verifyTokenHash();
    }
  }, [tokenHash, typeParam, navigate]);

  const handleManualOtpVerify = async (values: VerifyEmailFormValues) => {
    setServerError(null);
    setIsTokenExpired(false);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: values.email,
        token: values.otp,
        type: 'signup',
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('expired') ||
          error.message.toLowerCase().includes('invalid')
        ) {
          setIsTokenExpired(true);
          throw new Error('Verification code is invalid or has expired. Please request a fresh OTP code.');
        }
        throw error;
      }

      setVerificationSuccess(true);
      setTimeout(() => navigate('/role-selection', { replace: true }), 1500);
    } catch (err: any) {
      setServerError(err.message || 'OTP verification failed.');
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS) return;

    if (!emailValue || !emailValue.includes('@')) {
      setServerError('Please enter a valid professional email address to resend link.');
      return;
    }

    setServerError(null);
    setResendSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailValue,
      });

      if (error) throw error;

      setResendAttempts((prev) => prev + 1);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setResendSuccessMsg(`Verification email dispatched to ${emailValue}. Please check your inbox.`);
      setIsTokenExpired(false);
    } catch (err: any) {
      setServerError(err.message || 'Failed to resend verification email.');
    }
  };

  return (
    <AuthLayout title="Verify Account" subtitle="Confirm your email to unlock your career intelligence dashboard.">
      {/* Token Verification Spinner */}
      {verifyingToken && (
        <div className="py-8 text-center space-y-3" role="status" aria-live="polite">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">Verifying secure confirmation token parameters...</p>
        </div>
      )}

      {/* Expired / Invalid Token Error Alert */}
      {isTokenExpired && !verifyingToken && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-3 animate-fadeIn"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-xs text-amber-950">Link Expired or Invalid</p>
              <p className="text-xs text-amber-800 font-medium">
                The verification token has expired or was already redeemed. Click below to resend a fresh link.
              </p>
            </div>
          </div>
          <Button
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS}
            className="w-full h-10 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? `Resend Available in ${resendCooldown}s`
                : 'Resend Verification Email'}
            </span>
          </Button>
        </div>
      )}

      {/* General Error Banner */}
      {serverError && !isTokenExpired && !verifyingToken && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs font-semibold leading-relaxed flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Accessible Form Error Summary Banner */}
      <FormErrorSummary errors={errors} />

      {/* Resend Success Announcement */}
      {resendSuccessMsg && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
        >
          <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{resendSuccessMsg}</span>
        </div>
      )}

      {/* Success View */}
      {verificationSuccess ? (
        <div className="space-y-4 py-6 text-center" role="status" aria-live="polite">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800">Email Verified Successfully!</h4>
            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
              Your account authentication is complete. Transitioning to role selection...
            </p>
          </div>
          <Button
            onClick={() => navigate('/role-selection', { replace: true })}
            className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        !verifyingToken && (
          <form onSubmit={handleSubmit(handleManualOtpVerify)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Account Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                error={errors.email?.message}
                {...register('email')}
                className="w-full text-xs font-semibold h-11"
              />
            </div>

            {/* OTP Code Field */}
            <div className="space-y-1">
              <label htmlFor="otp" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                6-Digit Verification Code (OTP) <span className="text-red-500">*</span>
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                error={errors.otp?.message}
                {...register('otp')}
                className="w-full text-sm font-bold tracking-widest text-center h-11"
              />
            </div>

            {/* Submit Verification Code Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Code...' : 'Verify Code & Access Account'}</span>
            </Button>

            {/* Resend Link with Cooldown & Attempt Limit */}
            <div className="pt-2 text-center space-y-1">
              <p className="text-xs text-slate-500 font-semibold">
                Didn't receive the email code?
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS}
                className="text-xs font-bold text-emerald-650 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
              >
                <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resendAttempts >= MAX_RESEND_ATTEMPTS
                    ? 'Resend Limit Reached'
                    : 'Resend Verification Email'}
                </span>
              </button>
            </div>
          </form>
        )
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
