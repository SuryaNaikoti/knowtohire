import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lock, Eye, EyeOff, Check, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ResetPasswordPageProps {
  onNavigate?: (path: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(true);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Inspect recovery session on mount
  useEffect(() => {
    const checkRecoverySession = async () => {
      if (!isSupabaseConfigured()) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Warning: Recovery link might be expired or opened without fragment session
        setIsSessionValid(false);
      }
    };
    checkRecoverySession();
  }, []);

  const evalPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    return score;
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one uppercase letter and one number.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter confirm password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase credentials are not configured in environment.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setErrorMessage('Failed to update password. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a secure password for your KnowToHire account."
      badgeText="Password Update"
    >
      {!isSessionValid ? (
        <div className="space-y-6 text-center">
          <Alert variant="warning" title="Recovery Link Expired or Invalid">
            The password reset session is invalid or has expired. Please request a new password recovery email.
          </Alert>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      ) : isSuccess ? (
        <div className="space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <Alert variant="success" title="Password Updated">
            Your password has been successfully updated.
          </Alert>

          <p className="text-xs text-kth-slate-600">
            You can now sign in with your new password credentials.
          </p>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
          {errorMessage && (
            <Alert variant="error" title="Update Failed">
              {errorMessage}
            </Alert>
          )}

          {/* New Password */}
          <div>
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-kth-slate-400 hover:text-kth-slate-600 focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="new-password"
              required
            />

            {/* Strength Bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-kth-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full transition-all duration-300 ${evalPasswordStrength(password) >= 1 ? 'bg-red-500' : 'bg-transparent'} flex-1`} />
                  <div className={`h-full transition-all duration-300 ${evalPasswordStrength(password) >= 3 ? 'bg-amber-500' : 'bg-transparent'} flex-1`} />
                  <div className={`h-full transition-all duration-300 ${evalPasswordStrength(password) >= 4 ? 'bg-emerald-500' : 'bg-transparent'} flex-1`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              confirmPassword && confirmPassword === password ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : undefined
            }
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold shadow-xs mt-2"
            isLoading={isLoading}
            disabled={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Update Password & Continue
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
