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
      brandTitle="Secure Your Account"
      brandSubtitle="Set a new strong password to restore complete access to your KnowToHire account."
      brandFeatures={[
        {
          title: "Account Security",
          description: "Encrypted password storage & protection",
        },
        {
          title: "Instant Access",
          description: "Resume your applications and ATS tools",
        },
      ]}
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
              className="w-full bg-[#5145F5] hover:bg-[#4338CA] text-white"
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

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Password updated
            </h2>
            <p className="text-xs text-slate-500">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full bg-[#5145F5] hover:bg-[#4338CA] text-white shadow-xs font-bold"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create new password
            </h2>
            <p className="text-xs text-slate-500">
              Choose a secure password for your KnowToHire account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errorMessage && (
              <Alert variant="error" title="Update Failed">
                {errorMessage}
              </Alert>
            )}

            {/* New Password */}
            <div>
              <Input
                label="New password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
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

              {/* Requirements box */}
              <div className="mt-2 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">Password requirements:</div>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>1 uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>1 lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>1 number</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <Input
              label="Confirm new password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold shadow-xs mt-2 bg-[#5145F5] hover:bg-[#4338CA] text-white cursor-pointer"
              isLoading={isLoading}
              disabled={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password & Continue
            </Button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
};
