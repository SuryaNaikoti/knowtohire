import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../../components/ui/Loading';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange session parameters
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          throw new Error('No session active after redirect Callback.');
        }

        const user = data.session.user;

        // 1. Sync public profiles database records
        await refreshProfile();

        // 2. Fetch profile from DB to check role and onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || !profile.role) {
          // If no role set yet, redirect to role selection screen
          navigate('/role-selection', { replace: true });
          return;
        }

        const userRole = profile.role;

        if (userRole === 'candidate') {
          // Check if candidate onboarding is done
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
          // Check if employer onboarding is done (linked to a company)
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
        console.error('OAuth Callback handling error:', err);
        setErrorMsg(err.message || 'OAuth verification failed.');
        navigate('/login?error=oauth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, refreshProfile]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-4 text-center">
        {errorMsg ? (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        ) : (
          <Loading label="Authenticating callback token credentials..." />
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
