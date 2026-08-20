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

    const { error } = await login(email.trim(), password);

    if (error) {
      setFormError(
        error.message.includes('Invalid login credentials') || error.message.includes('invalid_grant')
          ? 'Invalid email address or password. Please try again.'
          : error.message
      );
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your candidate dashboard or employer ATS."
    >
      <div className="space-y-4 text-left">
        {/* Error Alert Display */}
        {(formError || authError) && (
          <Alert variant="error" title="Sign In Failed">
            {formError || authError}
          </Alert>
        )}

        {/* Premium Google OAuth Action */}
        <GoogleAuthButton
          text="Continue with Google"
          onError={(err) => setFormError(err)}
        />

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-kth-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-kth-slate-400 uppercase tracking-wider shrink-0">
            or continue with email
          </span>
          <div className="border-t border-kth-slate-200 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formError) setFormError(null);
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        {/* Password Input with Show/Hide Toggle */}
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-kth-slate-400 hover:text-kth-slate-600 focus:outline-none p-1 transition-colors"
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
              className="text-xs font-semibold text-kth-primary-600 hover:text-kth-primary-700 hover:underline"
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
          className="w-full font-bold shadow-xs mt-2"
          isLoading={isLoading}
          disabled={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>

        {/* Registration Redirection */}
        <div className="pt-4 border-t border-kth-slate-100 text-center text-xs text-kth-slate-600">
          <span>Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-bold text-kth-primary-600 hover:text-kth-primary-700 hover:underline"
          >
            Create an account
          </button>
        </div>
      </form>
      </div>
    </AuthLayout>
  );
};

