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
      title="Reset your password"
      subtitle="Enter your account email to receive password recovery instructions."
      badgeText="Password Recovery"
    >
      {isSent ? (
        <div className="space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          
          <Alert variant="success" title="Recovery Instructions Sent">
            If an account exists for <strong className="font-mono">{email}</strong>, password reset instructions have been dispatched.
          </Alert>

          <p className="text-xs text-kth-slate-600 leading-relaxed">
            Please check your inbox (and spam folder). The reset link will expire after 1 hour.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => navigate('/login')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
          {errorMessage && (
            <Alert variant="error" title="Password Reset Request Failed">
              {errorMessage}
            </Alert>
          )}

          <Input
            label="Account Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
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
            Send Password Reset Link
          </Button>

          <div className="pt-4 border-t border-kth-slate-100 text-center text-xs text-kth-slate-600">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-kth-slate-600 hover:text-kth-slate-900 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
