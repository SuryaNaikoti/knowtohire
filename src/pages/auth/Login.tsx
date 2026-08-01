import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { rateLimiter } from '../../lib/security/rateLimiter';
import { auditLogger } from '../../lib/security/auditLogger';
import { loginSchema, type LoginFormValues } from '../../lib/validation/authSchemas';
import { getEmailDomainSuggestion } from '../../lib/validation/emailUtils';
import { useCapsLock } from '../../hooks/useCapsLock';
import { FormErrorSummary } from '../../components/auth/FormErrorSummary';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogIn, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const capsLockPassword = useCapsLock();
  const fromLocation = (location.state as any)?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = useWatch({ control, name: 'email' });
  const emailSuggestion = getEmailDomainSuggestion(emailValue || '');

  // Cooldown timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleApplyEmailSuggestion = (suggestion: string) => {
    setValue('email', suggestion, { shouldValidate: true });
  };

  const handleEmailLogin = async (values: LoginFormValues) => {
    const lockout = rateLimiter.getLockoutStatus(values.email);
    if (lockout.isLocked) {
      setCooldownRemaining(lockout.remainingSeconds);
      setServerError(`Account temporarily locked due to 5 failed login attempts. Try again in ${lockout.remainingSeconds}s.`);
      auditLogger.logSecurityEvent('ACCOUNT_LOCKED', { userEmail: values.email });
      return;
    }

    setServerError(null);
    auditLogger.logSecurityEvent('LOGIN_ATTEMPT', { userEmail: values.email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      rateLimiter.resetAttempts(values.email);
      authLogin(values.rememberMe);
      auditLogger.logSecurityEvent('LOGIN_SUCCESS', { userEmail: values.email, userId: data.user.id });

      if (fromLocation && fromLocation !== '/login' && fromLocation !== '/register') {
        navigate(fromLocation, { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || !profile.role) {
        navigate('/role-selection', { replace: true });
      } else {
        const roleRedirect =
          profile.role === 'candidate'
            ? '/dashboard/candidate'
            : profile.role === 'employer'
            ? '/dashboard/employer'
            : '/dashboard/admin';
        navigate(roleRedirect, { replace: true });
      }
    } catch (err: any) {
      const updatedLockout = rateLimiter.recordFailedAttempt(values.email);

      if (updatedLockout.isLocked) {
        setCooldownRemaining(updatedLockout.remainingSeconds);
        setServerError(`Account temporarily locked due to 5 consecutive failed attempts. Try again in ${updatedLockout.remainingSeconds}s.`);
        auditLogger.logSecurityEvent('ACCOUNT_LOCKED', { userEmail: values.email });
      } else {
        const sanitizedMsg = rateLimiter.getGenericAuthErrorMessage(err.message || 'Login failed.');
        setServerError(sanitizedMsg);
        auditLogger.logSecurityEvent('LOGIN_FAILED', { userEmail: values.email, details: { error: err.message } });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setServerError(err.message || 'Google OAuth authentication failed.');
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Access your career intelligence dashboard profile.">
      {/* Account Lockout Warning Banner */}
      {cooldownRemaining > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-fadeIn"
        >
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">Security Cooldown Active</p>
            <p>Multiple failed login attempts detected. Please wait <strong>{cooldownRemaining}s</strong> before retrying.</p>
          </div>
        </div>
      )}

      {/* General Server Error Alert */}
      {serverError && cooldownRemaining === 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-fadeIn"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Login Issue</p>
            <p>{serverError}</p>
          </div>
        </div>
      )}

      {/* Accessible Form Error Summary Banner */}
      <FormErrorSummary errors={errors} />

      <form onSubmit={handleSubmit(handleEmailLogin)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Professional Email <span className="text-red-500">*</span>
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

        {/* Password Field */}
        <div className="space-y-1 relative">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Password <span className="text-red-500">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-bold text-slate-600 hover:text-emerald-650 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              onKeyDown={capsLockPassword.onKeyDown}
              onKeyUp={capsLockPassword.onKeyUp}
              onFocus={capsLockPassword.onFocus}
              {...register('password', {
                onBlur: () => capsLockPassword.onBlur(),
              })}
              className="w-full text-xs font-semibold pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Caps Lock Detection Warning */}
          {capsLockPassword.capsLockActive && (
            <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
              <span>Caps Lock is ON ⇪</span>
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || cooldownRemaining > 0}
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <LogIn className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Authenticating...'
              : cooldownRemaining > 0
              ? `Locked (${cooldownRemaining}s)`
              : 'Login Profile'}
          </span>
        </Button>
      </form>

      {/* Social OAuth Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="bg-white px-3">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-11 border border-slate-250 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google Account</span>
      </button>

      {/* Register Link */}
      <p className="text-center text-xs font-semibold text-slate-500 pt-2">
        Don't have a profile yet?{' '}
        <Link to="/register" className="font-bold text-emerald-650 hover:underline">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
