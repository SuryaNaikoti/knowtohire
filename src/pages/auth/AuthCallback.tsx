import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../../components/ui/Loading';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpiredToken, setIsExpiredToken] = useState(false);

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    const handleAuthCallback = async () => {
      setErrorMsg(null);
      setIsExpiredToken(false);

      if (errorDescription) {
        if (
          errorDescription.toLowerCase().includes('expired') ||
          errorDescription.toLowerCase().includes('invalid')
        ) {
          setIsExpiredToken(true);
        }
        setErrorMsg(errorDescription);
        return;
      }

      try {
        // 1. Password Reset Recovery Callback
        if (typeParam === 'recovery') {
          if (tokenHash) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            });
            if (error) throw error;
          }
          navigate('/reset-password', { replace: true });
          return;
        }

        // 2. PKCE Code Exchange
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && typeParam) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeParam as any,
          });
          if (error) throw error;
        }

        // 3. Obtain Active Session
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!data.session) {
          throw new Error('Authentication callback completed but no active session was established.');
        }

        const user = data.session.user;
        await refreshProfile();

        // 4. Determine Workspace Redirection Path
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || !profile.role) {
          navigate('/role-selection', { replace: true });
          return;
        }

        const userRole = profile.role;

        if (userRole === 'candidate') {
          const { data: candidateProfile } = await supabase
            .from('candidate_profiles')
            .select('headline')
            .eq('id', user.id)
            .single();

          if (candidateProfile && candidateProfile.headline) {
            navigate('/dashboard/candidate', { replace: true });
          } else {
            navigate('/onboarding/candidate', { replace: true });
          }
        } else if (userRole === 'employer') {
          const { data: employerProfile } = await supabase
            .from('employer_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

          if (employerProfile && employerProfile.company_id) {
            navigate('/dashboard/employer', { replace: true });
          } else {
            navigate('/onboarding/employer', { replace: true });
          }
        } else if (userRole === 'admin' || userRole === 'super_admin') {
          navigate('/dashboard/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err: any) {
        console.error('Auth Callback processing failure:', err);
        const message = err.message || 'Authentication link verification failed.';
        if (
          message.toLowerCase().includes('expired') ||
          message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('already used')
        ) {
          setIsExpiredToken(true);
        }
        setErrorMsg(message);
      }
    };

    handleAuthCallback();
  }, [code, tokenHash, typeParam, errorDescription, navigate, refreshProfile]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 text-center">
        {errorMsg ? (
          <div role="alert" aria-live="assertive" className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-850">
                {isExpiredToken ? 'Link Expired or Invalid' : 'Verification Issue'}
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/verify-email"
                className="w-full h-11 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Request New Verification Email</span>
              </Link>
              <Link
                to="/login"
                className="w-full h-10 text-slate-600 hover:text-slate-800 text-xs font-bold flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <Loading label="Exchanging security tokens & initializing session..." />
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
