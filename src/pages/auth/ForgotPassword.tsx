import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../lib/validation/authSchemas';
import { getEmailDomainSuggestion } from '../../lib/validation/emailUtils';
import { FormErrorSummary } from '../../components/auth/FormErrorSummary';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowRight, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESET_ATTEMPTS = 3;

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetAttempts, setResetAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const emailValue = useWatch({ control, name: 'email' });
  const emailSuggestion = getEmailDomainSuggestion(emailValue || '');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleApplyEmailSuggestion = (suggestion: string) => {
    setValue('email', suggestion, { shouldValidate: true });
  };

  const handlePasswordReset = async (values: ForgotPasswordFormValues) => {
    if (resendCooldown > 0 || resetAttempts >= MAX_RESET_ATTEMPTS) return;

    setServerError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;

      setResetAttempts((prev) => prev + 1);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Failed to dispatch recovery link. Please try again.');
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive recovery parameters.">
      {serverError && (
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

      {success ? (
        <div className="space-y-4 py-4 text-center" role="status" aria-live="polite">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Check Your Inbox</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Password recovery link sent to <strong>{emailValue}</strong>. Click the link in your email to choose a new password.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setSuccess(false)}
              disabled={resendCooldown > 0 || resetAttempts >= MAX_RESET_ATTEMPTS}
              className="text-xs font-bold text-emerald-650 hover:underline inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend Email in ${resendCooldown}s`
                  : resetAttempts >= MAX_RESET_ATTEMPTS
                  ? 'Max Reset Attempts Reached'
                  : 'Resend Recovery Email'}
              </span>
            </button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handlePasswordReset)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Account Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register('email')}
              className="w-full text-xs font-semibold h-11"
            />

            {/* Email Domain Typo Suggestion */}
            {emailSuggestion && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between mt-1">
                <span>
                  Did you mean <strong>{emailSuggestion}</strong>?
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyEmailSuggestion(emailSuggestion)}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded cursor-pointer"
                >
                  Fix Email
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || resendCooldown > 0 || resetAttempts >= MAX_RESET_ATTEMPTS}
            className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span>
              {isSubmitting
                ? 'Sending Recovery Link...'
                : resendCooldown > 0
                ? `Wait ${resendCooldown}s Before Resending`
                : 'Send Recovery Email'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs font-semibold text-slate-500 pt-2">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-emerald-650 hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
