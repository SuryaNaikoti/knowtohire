import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth, resolveRole, resolveEffectiveStatus } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, AlertCircle, LogOut } from 'lucide-react';

export interface AuthCallbackPageProps {
  onNavigate?: (path: string) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onNavigate }) => {
  const { refreshProfile, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Verifying authentication credentials...');

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
        // 2. Check for PKCE 'code' or email confirmation 'token_hash' in URL
        const code = searchParams.get('code') || hashParams.get('code');
        const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
        const otpType = (searchParams.get('type') || hashParams.get('type') || 'signup') as any;

        if (tokenHash) {
          if (isMounted) {
            setStatusMessage('Verifying email confirmation token...');
          }
          const { error: verifyErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          if (verifyErr) {
            if (isMounted) {
              setErrorMessage(verifyErr.message || 'The confirmation link has expired or is invalid.');
            }
            return;
          }
        } else if (code) {
          if (isMounted) {
            setStatusMessage('Exchanging authorization code for secure session...');
          }
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            if (isMounted) {
              setErrorMessage(exchangeErr.message || 'Failed to exchange authorization code.');
            }
            return;
          }
        }

        if (isMounted) {
          setStatusMessage('Retrieving active session & user profile...');
        }

        // 3. Fetch session from Supabase
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
              setErrorMessage('No authenticated user session found from verification or sign-in.');
            }
            return;
          }
        }

        if (isMounted) {
          setStatusMessage('Finalizing account permissions and workspace routing...');
        }

        // 3. Resolve user and ensure profile row exists
        const {
          data: { user: freshUser },
        } = await supabase.auth.getUser();

        const activeUser = freshUser || session?.user || null;
        if (!activeUser) {
          if (isMounted) {
            setErrorMessage('No active user session detected.');
          }
          return;
        }

        // Fetch authoritative profile record
        let profile = await refreshProfile();

        if (!profile && isSupabaseConfigured()) {
          // Double check database directly to ensure we don't overwrite an existing profile
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', activeUser.id)
            .maybeSingle();

          if (existingProfile) {
            profile = existingProfile;
          }
        }

        const storedRole =
          typeof window !== 'undefined' && window.sessionStorage
            ? (window.sessionStorage.getItem('kth_oauth_intended_role') as 'candidate' | 'employer' | 'creator' | null)
            : null;

        const targetRole =
          resolveRole(activeUser, profile) ||
          storedRole ||
          'candidate';

        // Only create a new profile if the user genuinely does not have one in Supabase
        if (!profile && isSupabaseConfigured()) {
          try {
            const rawMeta = activeUser.user_metadata || {};
            const fullName = rawMeta.full_name || rawMeta.name || activeUser.email?.split('@')[0] || 'User';
            const avatarUrl = rawMeta.avatar_url || rawMeta.picture || null;

            await supabase.from('profiles').insert([
              {
                id: activeUser.id,
                email: activeUser.email,
                full_name: fullName,
                avatar_url: avatarUrl,
                role: targetRole,
                status: 'pending_onboarding',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

            profile = await refreshProfile();
          } catch (createErr) {
            console.warn('[AuthCallbackPage] Profile creation warning:', createErr);
          }
        }

        // Authoritative effective status check
        const effectiveStatus = resolveEffectiveStatus(activeUser, profile);

        // Fail-safe: if status could not be resolved or profile is missing/unusable, fail closed
        if (!effectiveStatus) {
          if (isMounted) {
            setErrorMessage('Unable to verify account access status. Please try signing in again or contact support.');
          }
          return;
        }

        // 4. Clean up session storage
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem('kth_oauth_intended_role');
        }

        // 5. If suspended, block immediately and show dedicated suspended screen (do not redirect to onboarding or login)
        if (effectiveStatus === 'suspended') {
          if (isMounted) {
            setIsSuspended(true);
          }
          return;
        }

        // 6. Determine target destination for allowed accounts
        let targetPath = '/onboarding/candidate';
        if (effectiveStatus === 'pending_onboarding') {
          targetPath =
            targetRole === 'employer'
              ? '/onboarding/employer'
              : targetRole === 'creator'
              ? '/creator'
              : '/onboarding/candidate';
        } else if (effectiveStatus === 'active') {
          targetPath =
            targetRole === 'employer'
              ? '/employer'
              : targetRole === 'admin'
              ? '/admin'
              : targetRole === 'creator'
              ? '/creator'
              : '/candidate';
        } else if (effectiveStatus === 'unverified') {
          targetPath = '/verify-email';
        }

        // 7. Navigate cleanly without leaving OAuth hash in browser URL
        if (typeof window !== 'undefined') {
          window.location.replace(targetPath);
        } else {
          navigate(targetPath);
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

        {isSuspended ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h2 className="font-display font-bold text-lg text-kth-slate-900">
              Account Suspended
            </h2>

            <Alert variant="error" title="Account Access Disabled">
              Your KnowToHire account has been suspended due to governance or compliance review. Please contact support@knowtohire.com for assistance or to request a review.
            </Alert>

            <div className="pt-2">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h2 className="font-display font-bold text-lg text-kth-slate-900">
              Authentication Notice
            </h2>

            <Alert variant="error" title="Authentication Unsuccessful">
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
