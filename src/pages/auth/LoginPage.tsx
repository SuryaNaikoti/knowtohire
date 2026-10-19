import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const validateForm = (): boolean => {
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError('Email address is required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }

    if (!password) {
      setFormError('Password is required.');
      return false;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = await login(email.trim(), password);

    if (res.error) {
      setFormError(
        res.error.message.includes('Invalid login credentials') || res.error.message.includes('invalid_grant')
          ? 'Invalid email address or password. Please try again.'
          : res.error.message
      );
    } else {
      // Authoritative navigation based on resolved role and status
      if (res.status === 'suspended') {
        setFormError('Your account has been suspended due to governance or compliance review. Please contact support@knowtohire.com.');
        return;
      }

      if (res.status === 'unverified') {
        navigate('/verify-email');
        return;
      }

      if (res.status === 'pending_onboarding') {
        const onboardingPath =
          res.role === 'employer'
            ? '/onboarding/employer'
            : res.role === 'creator'
            ? '/onboarding/creator'
            : '/onboarding/candidate';
        navigate(onboardingPath);
        return;
      }

      // Active status destination
      const targetPath =
        res.role === 'admin'
          ? '/admin'
          : res.role === 'employer'
          ? '/employer'
          : res.role === 'creator'
          ? '/creator'
          : '/candidate';
      navigate(targetPath);
    }
  };

  return (
    <AuthLayout
      brandTitle="Know More. Hire Better. Grow Faster."
      brandSubtitle="A unified platform connecting talent with real opportunities, verified resources, and expert guidance for a sustainable future in India."
      brandFeatures={[
        {
          title: "Verified Opportunities",
          description: "from trusted employers",
        },
        {
          title: "Expert Resources",
          description: "for every career stage",
        },
        {
          title: "Sustainable Careers",
          description: "that create real impact",
        },
      ]}
    >
      <div className="space-y-5 text-left">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to continue to your candidate dashboard, employer ATS, or admin portal.
          </p>
        </div>

        {/* Error Alert Display */}
        {(formError || authError) && (
          <Alert variant="error" title="Sign In Failed">
            {formError || authError}
          </Alert>
        )}

        {/* Google OAuth Action */}
        <GoogleAuthButton
          text="Continue with Google"
          onError={(err) => setFormError(err)}
        />

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            or continue with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Input */}
          <Input
            label="Email address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            autoComplete="email"
            required
          />

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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
              autoComplete="current-password"
              required
            />

            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs font-semibold text-[#5145F5] hover:text-[#4338CA] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold shadow-xs mt-2 bg-[#5145F5] hover:bg-[#4338CA] text-white"
            isLoading={isLoading}
            disabled={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>

          {/* Registration Redirection */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-bold text-[#5145F5] hover:text-[#4338CA] hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </div>

          <div className="text-[11px] text-center text-slate-400 pt-1">
            By signing in, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a>.
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
