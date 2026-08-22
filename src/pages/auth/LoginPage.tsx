import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuth, DEMO_CREDENTIALS } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, GraduationCap, Building2, ShieldCheck } from 'lucide-react';

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

  const handleQuickDemoLogin = async (type: 'candidate' | 'employer' | 'admin') => {
    const creds = DEMO_CREDENTIALS[type];
    setEmail(creds.email);
    setPassword(creds.password);
    setFormError(null);
    clearError();

    const { error } = await login(creds.email, creds.password);
    if (error) {
      setFormError(error.message);
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
      subtitle="Sign in to continue to your candidate dashboard, employer ATS, or admin portal."
    >
      <div className="space-y-5 text-left">
        {/* Error Alert Display */}
        {(formError || authError) && (
          <Alert variant="error" title="Sign In Failed">
            {formError || authError}
          </Alert>
        )}

        {/* Demo Credentials Quick Switcher Banner */}
        <div className="bg-gradient-to-br from-kth-slate-50 to-kth-primary-50/40 border border-kth-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-kth-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-kth-primary-600" />
              <span>Instant Demo Accounts</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-kth-slate-200 text-kth-slate-600">
              Pass: Password123!
            </span>
          </div>

          <p className="text-[11px] text-kth-slate-600 leading-relaxed">
            Click any button below to immediately sign in to that portal:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemoLogin('candidate')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-kth-primary-50/80 border border-kth-slate-200 hover:border-kth-primary-300 text-kth-slate-800 transition-all text-center group shadow-xs active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center mb-1 group-hover:bg-kth-primary-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">Candidate</span>
              <span className="text-[9px] text-kth-slate-400 font-mono">candidate@...</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemoLogin('employer')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-emerald-50/80 border border-kth-slate-200 hover:border-emerald-300 text-kth-slate-800 transition-all text-center group shadow-xs active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">Employer</span>
              <span className="text-[9px] text-kth-slate-400 font-mono">employer@...</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-indigo-50/80 border border-kth-slate-200 hover:border-indigo-300 text-kth-slate-800 transition-all text-center group shadow-xs active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">Admin</span>
              <span className="text-[9px] text-kth-slate-400 font-mono">admin@...</span>
            </button>
          </div>
        </div>

        {/* Premium Google OAuth Action */}
        <GoogleAuthButton
          text="Continue with Google"
          onError={(err) => setFormError(err)}
        />

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center my-3">
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
