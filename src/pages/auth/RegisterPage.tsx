import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Building2, Eye, EyeOff, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export interface RegisterPageProps {
  onNavigate?: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isLoading, error: authError, clearError } = useAuth();

  // Role Selection (Candidate vs Employer vs Creator)
  const searchParams = new URLSearchParams(window.location.search);
  const paramRole = searchParams.get('role');
  const initialRole: 'candidate' | 'employer' | 'creator' =
    paramRole === 'employer' ? 'employer' : paramRole === 'creator' ? 'creator' : 'candidate';
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer' | 'creator'>(initialRole);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Generic Email Detection for Employers (Non-blocking warning)
  const isGenericEmail = (emailStr: string): boolean => {
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'rediffmail.com'];
    const domain = emailStr.split('@')[1]?.toLowerCase();
    return genericDomains.includes(domain);
  };

  const validateForm = (): boolean => {
    setFormError(null);
    clearError();

    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }

    if (selectedRole === 'employer' && (!companyName.trim() || companyName.trim().length < 2)) {
      setFormError('Please enter your company or enterprise name.');
      return false;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return false;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setFormError('Password must contain at least one uppercase letter and one number.');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter confirm password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SIGNUP TRACE 01]', { selectedRole });
    if (!validateForm()) return;

    const metadata = {
      full_name: fullName.trim(),
      role: selectedRole,
      ...(selectedRole === 'employer' && { company_name: companyName.trim() }),
    };

    console.log('[SIGNUP TRACE 02]', {
      selectedRole: metadata.role,
      email: email.trim(),
      fullName: metadata.full_name,
      companyName: (metadata as any).company_name,
    });

    const { error } = await register(email.trim(), password, metadata);

    if (error) {
      setFormError(error.message);
    } else {
      // If user requires email verification, navigate directly to verify-email
      const encodedEmail = encodeURIComponent(email.trim());
      navigate(`/verify-email?email=${encodedEmail}`);
    }
  };

  return (
    <AuthLayout
      brandTitle="Build Your Future With KnowToHire"
      brandSubtitle="Join a growing community of candidates, employers, and creators advancing sustainable careers across India."
      brandFeatures={[
        {
          title: "Real Opportunities",
          description: "in sustainability & innovation",
        },
        {
          title: "Verified Employers",
          description: "and quality roles",
        },
        {
          title: "Career Growth",
          description: "with trusted resources",
        },
      ]}
    >
      <div className="space-y-5 text-left">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-slate-500">
            Get started with KnowToHire and choose how you want to use the platform.
          </p>
        </div>

        {/* Error Alert */}
        {(formError || authError) && (
          <Alert variant="error" title="Registration Error">
            {formError || authError}
          </Alert>
        )}

        {/* Google OAuth Sign Up Action */}
        <GoogleAuthButton
          role={selectedRole}
          text="Continue with Google"
          onError={(err) => setFormError(err)}
        />

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            or sign up with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Account Type Selection Cards (Mockup 2 & 5) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            I am a...
          </label>
          <div className="space-y-2.5">
            {/* Candidate Card */}
            <div
              onClick={() => setSelectedRole('candidate')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedRole === 'candidate'
                  ? 'border-[#5145F5] bg-[#5145F5]/[0.03] ring-1 ring-[#5145F5]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'candidate'
                      ? 'bg-[#5145F5]/10 text-[#5145F5]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Candidate</div>
                  <div className="text-[11px] text-slate-500">
                    Find jobs, learn skills, and grow your career in sustainability.
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedRole === 'candidate'
                    ? 'border-[#5145F5] bg-[#5145F5]'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'candidate' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Employer Card */}
            <div
              onClick={() => setSelectedRole('employer')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedRole === 'employer'
                  ? 'border-[#5145F5] bg-[#5145F5]/[0.03] ring-1 ring-[#5145F5]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'employer'
                      ? 'bg-[#5145F5]/10 text-[#5145F5]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Employer</div>
                  <div className="text-[11px] text-slate-500">
                    Post jobs, find talent, and build your team for a sustainable future.
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedRole === 'employer'
                    ? 'border-[#5145F5] bg-[#5145F5]'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'employer' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Creator Card */}
            <div
              onClick={() => setSelectedRole('creator')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedRole === 'creator'
                  ? 'border-[#5145F5] bg-[#5145F5]/[0.03] ring-1 ring-[#5145F5]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'creator'
                      ? 'bg-[#5145F5]/10 text-[#5145F5]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Creator</div>
                  <div className="text-[11px] text-slate-500">
                    Share knowledge, templates, and resources to support the community.
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedRole === 'creator'
                    ? 'border-[#5145F5] bg-[#5145F5]'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'creator' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1" noValidate>
          {/* Full Name */}
          <Input
            label="Full name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            autoComplete="name"
            required
          />

          {/* Email Input */}
          <div>
            <Input
              label={selectedRole === 'employer' ? 'Corporate work email' : 'Email address'}
              type="email"
              placeholder={selectedRole === 'employer' ? 'name@company.com' : 'name@example.com'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError(null);
              }}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
              required
            />

            {/* Employer Generic Email Warning */}
            {selectedRole === 'employer' && email && isGenericEmail(email) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Using a corporate work email speeds up enterprise verification.</span>
              </div>
            )}
          </div>

          {/* Employer Company Name */}
          {selectedRole === 'employer' && (
            <Input
              label="Company / Enterprise Name"
              type="text"
              placeholder="e.g. Acme Sustainability Pvt. Ltd."
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (formError) setFormError(null);
              }}
              leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              required
            />
          )}

          {/* Password */}
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="new-password"
              required
            />

            {/* Clear Password Requirements Checklist (Mockup 6) */}
            <div className="mt-2 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-700">Your password must contain:</div>
              <div className="grid grid-cols-2 gap-1 pt-0.5">
                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>One number</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            rightIcon={
              confirmPassword && confirmPassword === password ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : undefined
            }
            autoComplete="new-password"
            required
          />

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold shadow-xs mt-2 bg-[#5145F5] hover:bg-[#4338CA] text-white cursor-pointer"
            isLoading={isLoading}
            disabled={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create account
          </Button>

          {/* Navigation back to Sign In */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-bold text-[#5145F5] hover:text-[#4338CA] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </div>

          <div className="text-[11px] text-center text-slate-400 pt-1">
            By creating an account, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a>.
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
