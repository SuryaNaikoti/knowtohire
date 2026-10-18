import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface ForgotPasswordPageProps {
  onNavigate?: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase credentials are not configured in environment.');
      return;
    }

    setIsLoading(true);

    try {
      // Dynamic origin construction for recovery callback
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        // Do not expose rate limit or specific account existence errors harshly
        setErrorMessage(error.message);
      } else {
        setIsSent(true);
      }
    } catch (err) {
      setErrorMessage('Failed to send password reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandTitle="Get back to what matters"
      brandSubtitle="Reset your password to continue accessing your KnowToHire account."
      brandFeatures={[
        {
          title: "Secure Access",
          description: "Your data stays protected",
        },
        {
          title: "Quick Recovery",
          description: "Get back in minutes",
        },
        {
          title: "Same Opportunities",
          description: "Continue your journey",
        },
      ]}
    >
      {isSent ? (
        <div className="space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Check your email
            </h2>
            <p className="text-xs text-slate-500">
              We've dispatched recovery instructions to <strong className="font-mono text-slate-700">{email}</strong>.
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-slate-600 leading-relaxed text-left">
            The reset link is valid for 1 hour. Make sure to check your spam or junk folder if you don't receive it shortly.
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              className="w-full font-semibold"
              onClick={() => navigate('/login')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-left">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reset your password
            </h2>
            <p className="text-xs text-slate-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errorMessage && (
              <Alert variant="error" title="Password Reset Request Failed">
                {errorMessage}
              </Alert>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
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
              Send reset link
            </Button>

            {/* Security Notice Box (Mockup 3 & 7) */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-slate-500 font-bold text-[10px]">
                i
              </div>
              <div>
                You'll receive an email with a secure link to create a new password. The link will expire for security reasons.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center text-xs">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-[#5145F5] hover:text-[#4338CA] hover:underline cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          </form>
        </div>
      )}
    </AuthLayout>
  );
};
