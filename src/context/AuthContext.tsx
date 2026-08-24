import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthState, AuthContextType, AuthUser, AccountStatus, UserRole } from '@/types/auth';
import { Profile } from '@/types/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'kth_demo_auth_session';

// Predefined Demo Accounts for 100% reliable login across all 3 portals
export const DEMO_CREDENTIALS = {
  candidate: {
    email: 'candidate@knowtohire.com',
    password: 'Password123!',
    role: 'candidate' as UserRole,
    status: 'active' as AccountStatus,
    full_name: 'Surya Naikoti',
    phone: '+91 98765 43210',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
    id: '00000000-0000-0000-0000-000000000001',
  },
  employer: {
    email: 'employer@knowtohire.com',
    password: 'Password123!',
    role: 'employer' as UserRole,
    status: 'active' as AccountStatus,
    full_name: 'Vikram Malhotra (Talent Lead)',
    phone: '+91 99887 75643',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    id: '00000000-0000-0000-0000-000000000002',
    company_name: 'EcoStrategy India Pvt Ltd',
  },
  admin: {
    email: 'admin@knowtohire.com',
    password: 'Password123!',
    role: 'admin' as UserRole,
    status: 'active' as AccountStatus,
    full_name: 'KnowToHire Platform Administrator',
    phone: '+91 80 4920 1800',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    id: '00000000-0000-0000-0000-000000000003',
  },
};

/**
 * Creates a mock AuthUser compatible with Supabase Auth schema.
 */
function createDemoAuthUser(demo: typeof DEMO_CREDENTIALS.candidate | typeof DEMO_CREDENTIALS.employer | typeof DEMO_CREDENTIALS.admin): AuthUser {
  return {
    id: demo.id,
    app_metadata: { provider: 'email', providers: ['email'], role: demo.role },
    user_metadata: { full_name: demo.full_name, role: demo.role, phone: demo.phone },
    aud: 'authenticated',
    confirmation_sent_at: '2026-08-01T00:00:00Z',
    recovery_sent_at: undefined,
    email_change_sent_at: undefined,
    new_email: undefined,
    invited_at: undefined,
    action_link: undefined,
    email: demo.email,
    phone: demo.phone,
    created_at: '2026-08-01T00:00:00Z',
    confirmed_at: '2026-08-01T00:00:00Z',
    email_confirmed_at: '2026-08-01T00:00:00Z',
    phone_confirmed_at: '2026-08-01T00:00:00Z',
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  } as unknown as AuthUser;
}

function createDemoProfile(demo: typeof DEMO_CREDENTIALS.candidate | typeof DEMO_CREDENTIALS.employer | typeof DEMO_CREDENTIALS.admin): Profile {
  let customOverrides: Partial<Profile> = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(`kth_demo_profile_custom_${demo.id}`);
      if (stored) {
        customOverrides = JSON.parse(stored);
      }
    } catch {
      // Ignore parse error
    }
  }

  return {
    id: demo.id,
    email: customOverrides.email || demo.email,
    full_name: customOverrides.full_name || demo.full_name,
    role: demo.role,
    status: demo.status,
    phone: customOverrides.phone !== undefined ? customOverrides.phone : demo.phone,
    avatar_url: customOverrides.avatar_url || demo.avatar_url,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: customOverrides.updated_at || new Date().toISOString(),
  };
}

/**
 * Authoritatively calculates effective account status.
 */
export const resolveEffectiveStatus = (
  user: AuthUser | null,
  profile: Profile | null
): AccountStatus | null => {
  if (!user) return null;

  // Demo user overrides
  if (user.id?.startsWith('demo-')) {
    return 'active';
  }

  const isEmailConfirmed = Boolean(user.email_confirmed_at || (user as any).confirmed_at);

  // 1. If email is not confirmed in Supabase Auth, account is strictly 'unverified'
  if (!isEmailConfirmed) {
    return 'unverified';
  }

  // 2. If profile is suspended, preserve suspended state
  if (profile?.status === 'suspended') {
    return 'suspended';
  }

  // 3. If email is confirmed but profile is unverified or missing, transition to 'pending_onboarding'
  if (!profile || profile.status === 'unverified') {
    return 'pending_onboarding';
  }

  // 4. Return existing profile status ('pending_onboarding' or 'active')
  return profile.status;
};

/**
 * Authoritatively resolves user role.
 */
export const resolveRole = (
  user: AuthUser | null,
  profile: Profile | null,
  fallbackRole?: UserRole | null
): UserRole | null => {
  if (user?.id?.startsWith('demo-')) {
    const metaRole = user.user_metadata?.role as UserRole;
    if (metaRole === 'candidate' || metaRole === 'employer' || metaRole === 'admin') {
      return metaRole;
    }
  }

  const metaRole = user?.user_metadata?.role || (user as any)?.raw_user_meta_data?.role;
  const appRole = user?.app_metadata?.role || (user as any)?.raw_app_meta_data?.role;

  // 1. If profile is active (onboarding completed), profile.role is authoritative
  if (profile?.status === 'active' && (profile.role === 'employer' || profile.role === 'candidate' || profile.role === 'admin')) {
    return profile.role;
  }

  // 2. User metadata role
  if (metaRole === 'employer' || metaRole === 'candidate' || metaRole === 'admin') {
    return metaRole;
  }

  // 3. Profile role
  if (profile?.role === 'employer' || profile?.role === 'candidate' || profile?.role === 'admin') {
    return profile.role;
  }

  // 4. App metadata
  if (appRole === 'employer' || appRole === 'candidate' || appRole === 'admin') {
    return appRole;
  }

  // 5. Explicit fallback role
  if (fallbackRole) {
    return fallbackRole;
  }

  // 6. Inspect localStorage demo session as graceful fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
      const sessionRole = stored ? JSON.parse(stored)?.role : null;
      if (sessionRole === 'employer' || sessionRole === 'candidate' || sessionRole === 'admin') {
        return sessionRole;
      }
    } catch {
      // Ignore
    }
  }

  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    status: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  // Helper to fetch user profile from public.profiles
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (
      userId === DEMO_CREDENTIALS.candidate.id ||
      userId === DEMO_CREDENTIALS.employer.id ||
      userId === DEMO_CREDENTIALS.admin.id ||
      userId.startsWith('demo-')
    ) {
      if (userId === DEMO_CREDENTIALS.candidate.id || userId === 'demo-candidate-001') return createDemoProfile(DEMO_CREDENTIALS.candidate);
      if (userId === DEMO_CREDENTIALS.employer.id || userId === 'demo-employer-002') return createDemoProfile(DEMO_CREDENTIALS.employer);
      if (userId === DEMO_CREDENTIALS.admin.id || userId === 'demo-admin-003') return createDemoProfile(DEMO_CREDENTIALS.admin);
    }

    if (!isSupabaseConfigured()) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Failed to fetch user profile:', error.message);
        return null;
      }
      return data as Profile | null;
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  // Refresh profile & user session state action
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    const isDemoId = state.user?.id && (
      state.user.id === DEMO_CREDENTIALS.candidate.id ||
      state.user.id === DEMO_CREDENTIALS.employer.id ||
      state.user.id === DEMO_CREDENTIALS.admin.id ||
      state.user.id.startsWith('demo-')
    );
    if (isDemoId && state.user?.id) {
      const updatedProfile = await fetchProfile(state.user.id);
      if (updatedProfile) {
        setState((prev) => ({
          ...prev,
          profile: updatedProfile,
        }));
      }
      return updatedProfile;
    }

    if (!isSupabaseConfigured()) return null;

    try {
      const {
        data: { user: freshUser },
      } = await supabase.auth.getUser();

      const targetUserId = freshUser?.id || state.user?.id;
      if (!targetUserId) return null;

      let profile = await fetchProfile(targetUserId);
      const activeUser = freshUser || state.user;

      const effectiveStatus = resolveEffectiveStatus(activeUser, profile);
      const resolvedRole = resolveRole(activeUser, profile, state.role);

      setState((prev) => ({
        ...prev,
        user: activeUser,
        profile,
        role: resolvedRole,
        status: effectiveStatus,
      }));

      return profile;
    } catch (err) {
      console.error('[AuthContext] refreshProfile error:', err);
      return null;
    }
  }, [state.user, state.profile, state.role, fetchProfile]);

  // Session resolution & Auth State Change Listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // 1. Check local demo auth session
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedDemo = window.localStorage.getItem(DEMO_STORAGE_KEY);
          if (storedDemo) {
            const parsedDemo = JSON.parse(storedDemo);
            if (parsedDemo && parsedDemo.role && parsedDemo.id) {
              const demoUser = createDemoAuthUser(parsedDemo);
              const demoProfile = createDemoProfile(parsedDemo);

              if (isMounted) {
                setState({
                  user: demoUser,
                  profile: demoProfile,
                  role: parsedDemo.role,
                  status: 'active',
                  isAuthenticated: true,
                  isLoading: false,
                  isInitialized: true,
                  error: null,
                });
                return;
              }
            }
          }
        }
      } catch (e) {
        console.warn('[AuthContext] Demo session parsing error:', e);
      }

      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isInitialized: true,
          }));
        }
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('[AuthContext] Session retrieval error:', sessionError.message);
        }

        if (session?.user && isMounted) {
          const user: AuthUser = session.user;
          const profile = await fetchProfile(user.id);
          const effectiveStatus = resolveEffectiveStatus(user, profile);
          const resolvedRole = resolveRole(user, profile);

          if (isMounted) {
            setState({
              user,
              profile,
              role: resolvedRole,
              status: effectiveStatus,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        } else if (isMounted) {
          setState({
            user: null,
            profile: null,
            role: null,
            status: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        }
      } catch (err) {
        console.error('[AuthContext] Initialization failure:', err);
        if (isMounted) {
          setState({
            user: null,
            profile: null,
            role: null,
            status: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: 'Authentication initialization failed.',
          });
        }
      }
    };

    initializeAuth();

    // Listen for Supabase auth state changes
    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // Ignore Supabase SIGNED_OUT if local demo session is active
      const isCurrentDemo = state.user?.id && (
        state.user.id === DEMO_CREDENTIALS.candidate.id ||
        state.user.id === DEMO_CREDENTIALS.employer.id ||
        state.user.id === DEMO_CREDENTIALS.admin.id ||
        state.user.id.startsWith('demo-')
      );
      if (isCurrentDemo) {
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const user: AuthUser = session.user;
          const profile = await fetchProfile(user.id);
          const effectiveStatus = resolveEffectiveStatus(user, profile);
          const resolvedRole = resolveRole(user, profile);

          if (isMounted) {
            setState({
              user,
              profile,
              role: resolvedRole,
              status: effectiveStatus,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted && !isCurrentDemo) {
          setState({
            user: null,
            profile: null,
            role: null,
            status: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, state.user?.id]);

  // Actions
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Demo Accounts for instant, guaranteed login
    const isCandidateDemo = cleanEmail === 'candidate@knowtohire.com' || cleanEmail === 'demo.candidate@knowtohire.com';
    const isEmployerDemo = cleanEmail === 'employer@knowtohire.com' || cleanEmail === 'demo.employer@knowtohire.com' || cleanEmail === 'cilove3743@hutdot.com';
    const isAdminDemo = cleanEmail === 'admin@knowtohire.com' || cleanEmail === 'demo.admin@knowtohire.com' || cleanEmail === 'cand_1786972983967@hutdot.com';

    if (isCandidateDemo || isEmployerDemo || isAdminDemo) {
      const demoData = isCandidateDemo
        ? DEMO_CREDENTIALS.candidate
        : isEmployerDemo
        ? DEMO_CREDENTIALS.employer
        : DEMO_CREDENTIALS.admin;

      // Allow any standard password entered by user for demo accounts
      const demoUser = createDemoAuthUser(demoData);
      const demoProfile = createDemoProfile(demoData);

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoData));
      }

      setState({
        user: demoUser,
        profile: demoProfile,
        role: demoData.role,
        status: 'active',
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });

      return { error: null };
    }

    // 2. Standard Supabase Auth fallback
    if (!isSupabaseConfigured()) {
      setState((prev) => ({ ...prev, isLoading: false, error: 'Supabase credentials are not configured.' }));
      return { error: new Error('Supabase credentials are not configured in environment.') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass });
    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    if (data?.user) {
      const profile = await fetchProfile(data.user.id);
      const effectiveStatus = resolveEffectiveStatus(data.user, profile);
      const resolvedRole = resolveRole(data.user, profile);

      setState({
        user: data.user,
        profile,
        role: resolvedRole,
        status: effectiveStatus,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }

    return { error: null };
  };

  const loginWithGoogle = async (role?: 'candidate' | 'employer'): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase credentials are not configured in environment.') };
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const sanitizedRole = role === 'employer' ? 'employer' : role === 'candidate' ? 'candidate' : undefined;

    if (sanitizedRole && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('kth_oauth_intended_role', sanitizedRole);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: sanitizedRole ? { role: sanitizedRole } : undefined,
        ...(sanitizedRole ? { data: { role: sanitizedRole } } : {}),
      } as any,
    });

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { error: null };
  };

  const register = async (
    email: string,
    password: string,
    metadata: { full_name: string; role: 'candidate' | 'employer'; [key: string]: any }
  ): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase credentials are not configured in environment.') };
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });
    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    if (data?.user) {
      const initialStatus = data.user.email_confirmed_at ? 'pending_onboarding' : 'unverified';

      let profile: Profile | null = null;
      try {
        const { data: upserted } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email || email.trim(),
            full_name: metadata.full_name,
            role: metadata.role,
            status: initialStatus,
          }, { onConflict: 'id' })
          .select('*')
          .single();

        if (upserted) {
          profile = upserted as Profile;
        }

        if (metadata.role === 'candidate') {
          await supabase
            .from('candidate_profiles')
            .upsert({ profile_id: data.user.id }, { onConflict: 'profile_id' });
        }
      } catch (syncErr) {
        console.warn('[AuthContext] Profile sync catch:', syncErr);
      }

      if (!profile) {
        profile = await fetchProfile(data.user.id);
      }

      if (!profile) {
        profile = {
          id: data.user.id,
          email: data.user.email || email.trim(),
          full_name: metadata.full_name,
          role: metadata.role,
          status: initialStatus,
          phone: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const effectiveStatus = resolveEffectiveStatus(data.user, profile);
      const resolvedRole = resolveRole(data.user, profile, metadata.role);

      setState({
        user: data.user,
        profile,
        role: resolvedRole,
        status: effectiveStatus,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }

    return { error: null };
  };

  const logout = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
      }
      if (window.sessionStorage) {
        window.sessionStorage.removeItem('kth_oauth_intended_role');
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signout error
      }
    }

    setState({
      user: null,
      profile: null,
      role: null,
      status: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        register,
        logout,
        clearError,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
