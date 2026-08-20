import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth, resolveRole, resolveEffectiveStatus } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export interface AuthCallbackPageProps {
  onNavigate?: (path: string) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onNavigate }) => {
  const { refreshProfile } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Verifying Google authentication credentials...');

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleOAuthCallback = async () => {
      // 1. Check for URL error parameters in query string or hash (e.g. user cancelled Google OAuth)
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash
      );

      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription =
        searchParams.get('error_description') || hashParams.get('error_description');

      if (error || errorDescription) {
        if (isMounted) {
          setErrorMessage(
            errorDescription ||
              'Google authentication was cancelled or could not be completed. Please try again.'
          );
        }
        return;
      }

      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setErrorMessage('Supabase credentials are not configured in the environment.');
        }
        return;
      }

      try {
        if (isMounted) {
          setStatusMessage('Retrieving active session & user profile...');
        }

        // 2. Fetch session from Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (isMounted) {
            setErrorMessage(sessionError.message);
          }
          return;
        }

        if (!session?.user) {
          // If no immediate session, check if onAuthStateChange detects it shortly or redirect to login
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();

          if (!currentUser) {
            if (isMounted) {
              setErrorMessage('No authenticated user session found from Google sign-in.');
            }
            return;
          }
        }

        if (isMounted) {
          setStatusMessage('Finalizing account permissions and workspace routing...');
        }

        // 3. Refresh user profile & resolve effective status
        const profile = await refreshProfile();
        const {
          data: { user: freshUser },
        } = await supabase.auth.getUser();

        const activeUser = freshUser || session?.user || null;
        const targetRole = resolveRole(activeUser, profile);
        const effectiveStatus = resolveEffectiveStatus(activeUser, profile) || 'unverified';

        // 4. Route accurately based on resolved lifecycle state
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem('kth_oauth_intended_role');
        }

        if (effectiveStatus === 'pending_onboarding') {
          const onboardingPath =
            targetRole === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
          navigate(onboardingPath);
        } else if (effectiveStatus === 'active') {
          const portalPath =
            targetRole === 'employer'
              ? '/employer'
              : targetRole === 'admin'
              ? '/admin'
              : '/candidate';
          navigate(portalPath);
        } else if (effectiveStatus === 'suspended') {
          navigate('/login');
        } else {
          // Unverified fallback (e.g. if provider did not verify email)
          navigate('/verify-email');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || 'An unexpected error occurred during Google sign-in.');
        }
      }
    };

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshProfile]);

  return (
    <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-kth-slate-200 shadow-md p-8 text-center space-y-6">
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-lg font-black shadow-sm">
            K
          </div>
          <span className="font-display font-bold text-xl text-kth-slate-900 tracking-tight">
            KnowToHire
          </span>
        </div>

        {errorMessage ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h2 className="font-display font-bold text-lg text-kth-slate-900">
              Authentication Notice
            </h2>

            <Alert variant="error" title="Google Sign-In Unsuccessful">
              {errorMessage}
            </Alert>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Animated Loading Indicator */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-kth-primary-100 animate-pulse" />
              <div className="w-16 h-16 rounded-full border-4 border-kth-primary-600 border-t-transparent animate-spin" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-bold text-base text-kth-slate-900">
                Signing you into KnowToHire...
              </h2>
              <p className="text-xs text-kth-slate-500 font-medium">
                {statusMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
