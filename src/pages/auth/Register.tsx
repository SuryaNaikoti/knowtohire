import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';
import { registerSchema, type RegisterFormValues } from '../../lib/validation/authSchemas';
import { getEmailDomainSuggestion, isDisposableEmail } from '../../lib/validation/emailUtils';
import { generateStrongPassword } from '../../lib/validation/passwordGenerator';
import { useCapsLock } from '../../hooks/useCapsLock';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { FormErrorSummary } from '../../components/auth/FormErrorSummary';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { analyticsService } from '../../lib/services/analytics/AnalyticsService';
import {
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building,
  ChevronRight,
} from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const capsLockPassword = useCapsLock();
  const capsLockConfirm = useCapsLock();

  // Track registration page loaded
  useEffect(() => {
    analyticsService.track('auth', 'Registration Started');
  }, []);

  const handleSelectRole = (role: 'candidate' | 'employer') => {
    setSelectedRole(role);
    analyticsService.track('auth', 'Role Selected', { role });
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const emailValue = useWatch({ control, name: 'email' });
  const passwordValue = useWatch({ control, name: 'password' });

  // Email Domain Typo & Disposable Checks
  const emailSuggestion = getEmailDomainSuggestion(emailValue || '');
  const disposableEmailDetected = isDisposableEmail(emailValue || '');

  // Auto-focus first invalid field on submission errors
  useEffect(() => {
    const errorKeys = Object.keys(errors) as (keyof RegisterFormValues)[];
    if (errorKeys.length > 0) {
      setFocus(errorKeys[0]);
    }
  }, [errors, setFocus]);

  const handleApplyEmailSuggestion = (suggestion: string) => {
    setValue('email', suggestion, { shouldValidate: true });
  };

  const handleGeneratePassword = () => {
    const strongPassword = generateStrongPassword(16);
    setValue('password', strongPassword, { shouldValidate: true });
    setValue('confirmPassword', strongPassword, { shouldValidate: true });
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    if (!selectedRole) {
      setServerError('Please select a role before registering.');
      return;
    }
    setServerError(null);
    setIsDuplicateEmail(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            role: selectedRole,
          },
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user already exists') ||
          error.status === 422
        ) {
          setIsDuplicateEmail(true);
          throw new Error('An account already exists for this professional email address.');
        }
        throw error;
      }

      setRegistrationSuccess(true);

      if (data.session) {
        setTimeout(() => navigate(`/onboarding/${selectedRole}`), 1500);
      } else {
        setTimeout(() => navigate('/verify-email'), 1500);
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please verify your details.');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setServerError(err.message || 'Failed to connect with Google Account.');
    }
  };

  return (
    <AuthLayout
      title={selectedRole === null ? "Create Account" : `Register as ${selectedRole === 'candidate' ? 'Candidate' : 'Employer'}`}
      subtitle={selectedRole === null ? "Select your profile type to begin your journey." : "Join thousands of professionals across 15+ industries."}
    >
      {selectedRole === null ? (
        <div className="space-y-6 py-2">
          {/* Candidate Card */}
          <button
            type="button"
            onClick={() => handleSelectRole('candidate')}
            className="w-full text-left p-5 border border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 rounded-2xl flex items-start gap-4 transition-all duration-350 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex-grow space-y-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
                <span>Register as Candidate</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Find jobs, build your professional profile, receive AI career guidance and apply for opportunities.
              </p>
            </div>
          </button>

          {/* Employer Card */}
          <button
            type="button"
            onClick={() => handleSelectRole('employer')}
            className="w-full text-left p-5 border border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 rounded-2xl flex items-start gap-4 transition-all duration-350 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="p-3 bg-teal-50 text-teal-650 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-grow space-y-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
                <span>Register as Employer</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Post jobs, manage applicants, build your company profile and hire talent.
              </p>
            </div>
          </button>
        </div>
      ) : (
        <>
          {/* Back to selector */}
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Role Selection</span>
          </button>

          {/* Enhanced Duplicate Email Error Card */}
          {isDuplicateEmail && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2.5 animate-fadeIn"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs text-amber-950">Account Already Exists</p>
                  <p className="text-xs text-amber-800 font-medium">
                    An account with <strong className="text-amber-950">{emailValue}</strong> is already registered.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/login"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  Login Profile Now
                </Link>
                <Link
                  to="/forgot-password"
                  className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition-colors"
                >
                  Reset Password
                </Link>
              </div>
            </div>
          )}

          {/* General Backend Error Alert */}
          {serverError && !isDuplicateEmail && (
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

          {/* Dedicated Success Card */}
          {registrationSuccess ? (
            <div className="space-y-4 py-6 text-center" role="status" aria-live="polite">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">Account Created Successfully!</h4>
                <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
                  Your professional profile has been initialized. Redirecting to onboard preferences...
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => navigate(`/onboarding/${selectedRole}`)}
                  className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>Continue Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4" noValidate>
              {/* First & Last Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Alex"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                    className="w-full text-xs font-semibold h-11"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Johnson"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                    className="w-full text-xs font-semibold h-11"
                  />
                </div>
              </div>

              {/* Email Field with Typo & Disposable Warnings */}
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

                {/* Disposable Email Warning */}
                {disposableEmailDetected && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Temporary/disposable email domains are not recommended for enterprise accounts.</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {capsLockPassword.capsLockActive && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                      Caps Lock is ON ⇪
                    </span>
                  )}
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  error={errors.password?.message}
                  onKeyDown={capsLockPassword.onKeyDown}
                  onKeyUp={capsLockPassword.onKeyUp}
                  onFocus={capsLockPassword.onFocus}
                  {...register('password', {
                    onBlur: () => capsLockPassword.onBlur(),
                  })}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={0}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  className="w-full text-xs font-semibold h-11"
                />

                {/* Password Strength Meter & Password Generator */}
                <PasswordStrengthMeter password={passwordValue} onGeneratePassword={handleGeneratePassword} />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  {capsLockConfirm.capsLockActive && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                      Caps Lock is ON ⇪
                    </span>
                  )}
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  onKeyDown={capsLockConfirm.onKeyDown}
                  onKeyUp={capsLockConfirm.onKeyUp}
                  onFocus={capsLockConfirm.onFocus}
                  {...register('confirmPassword', {
                    onBlur: () => capsLockConfirm.onBlur(),
                  })}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={0}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  className="w-full text-xs font-semibold h-11"
                />
              </div>

              {/* Terms & Privacy Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    {...register('termsAccepted')}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                    aria-invalid={!!errors.termsAccepted}
                  />
                  <span className="text-xs text-slate-600 font-medium leading-tight">
                    I agree to the{' '}
                    <Link to="/terms" className="font-bold text-emerald-650 hover:underline">
                      Terms & Conditions
                    </Link>
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-red-600 font-semibold" role="alert" aria-live="polite">
                    ⚠️ {errors.termsAccepted.message}
                  </p>
                )}

                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="privacyAccepted"
                    {...register('privacyAccepted')}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                    aria-invalid={!!errors.privacyAccepted}
                  />
                  <span className="text-xs text-slate-600 font-medium leading-tight">
                    I acknowledge the{' '}
                    <Link to="/privacy" className="font-bold text-emerald-650 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.privacyAccepted && (
                  <p className="text-xs text-red-600 font-semibold" role="alert" aria-live="polite">
                    ⚠️ {errors.privacyAccepted.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              </Button>
            </form>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-150"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Or Register With
            </span>
            <div className="flex-grow border-t border-slate-150"></div>
          </div>

          <Button
            onClick={handleGoogleRegister}
            variant="outline"
            className="w-full h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google Account</span>
          </Button>
        </>
      )}

      <p className="text-center text-xs font-semibold text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-emerald-650 hover:underline">
          Login Profile
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
