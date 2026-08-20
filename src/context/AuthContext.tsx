import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthState, AuthContextType, AuthUser, AccountStatus, UserRole } from '@/types/auth';
import { Profile } from '@/types/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authoritatively calculates the effective account status based on:
 * 1. Supabase Auth email confirmation state (auth.users.email_confirmed_at)
 * 2. Public profile onboarding/suspension status (public.profiles.status)
 */
export const resolveEffectiveStatus = (
  user: AuthUser | null,
  profile: Profile | null
): AccountStatus | null => {
  if (!user) return null;

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
 * Authoritatively resolves user role with strict priority:
 * 1. public.profiles.role (authoritative database record)
 * 2. user.user_metadata.role (Supabase Auth user metadata)
 * 3. user.app_metadata.role (Supabase Auth app metadata)
 * 4. fallbackRole
 * 5. sessionStorage intended OAuth role
 * 6. NULL if unresolved (NEVER silently default to candidate!)
 */
export const resolveRole = (
  user: AuthUser | null,
  profile: Profile | null,
  fallbackRole?: UserRole | null
): UserRole | null => {
  const metaRole = user?.user_metadata?.role || (user as any)?.raw_user_meta_data?.role;
  const appRole = user?.app_metadata?.role || (user as any)?.raw_app_meta_data?.role;

  // 1. If profile is active (onboarding completed), profile.role is authoritative
  if (profile?.status === 'active' && (profile.role === 'employer' || profile.role === 'candidate' || profile.role === 'admin')) {
    return profile.role;
  }

  // 2. During signup / unverified / pending_onboarding, user_metadata.role explicitly reflects the user's chosen registration role
  if (metaRole === 'employer' || metaRole === 'candidate' || metaRole === 'admin') {
    return metaRole;
  }

  // 3. Check profile record if valid
  if (profile?.role === 'employer' || profile?.role === 'candidate' || profile?.role === 'admin') {
    return profile.role;
  }

  // 4. Supabase app metadata
  if (appRole === 'employer' || appRole === 'candidate' || appRole === 'admin') {
    return appRole;
  }

  // 5. Explicit fallback
  if (fallbackRole === 'employer' || fallbackRole === 'candidate' || fallbackRole === 'admin') {
    return fallbackRole;
  }

  // 6. Session storage (OAuth intended role)
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const sessionRole = window.sessionStorage.getItem('kth_oauth_intended_role') as UserRole | null;
      if (sessionRole === 'employer' || sessionRole === 'candidate' || sessionRole === 'admin') {
        return sessionRole;
      }
    } catch {
      // Ignore sessionStorage access exceptions
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

  // Refresh profile & user session state action exposed via context
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const {
        data: { user: freshUser },
      } = await supabase.auth.getUser();

      const targetUserId = freshUser?.id || state.user?.id;
      if (!targetUserId) return null;

      let profile = await fetchProfile(targetUserId);
      const activeUser = freshUser || state.user;

      // If user metadata has a role but profile row is missing or not updated, sync it
      const metaRole = activeUser?.user_metadata?.role as UserRole | undefined;
      if (activeUser && metaRole && (!profile || profile.role !== metaRole)) {
        try {
          const syncStatus = activeUser.email_confirmed_at ? 'pending_onboarding' : 'unverified';
          const { data: upsertedProfile } = await supabase
            .from('profiles')
            .upsert({
              id: activeUser.id,
              email: activeUser.email || '',
              full_name: activeUser.user_metadata?.full_name || profile?.full_name || 'User',
              role: metaRole,
              status: profile?.status === 'active' ? 'active' : syncStatus,
            }, { onConflict: 'id' })
            .select('*')
            .single();

          if (upsertedProfile) {
            profile = upsertedProfile as Profile;
          }
        } catch {
          // Fallback to existing profile
        }
      }

      const effectiveStatus = resolveEffectiveStatus(activeUser, profile);
      const resolvedRole = resolveRole(activeUser, profile, state.role);

      console.log('[AUTH TRACE 01]', {
        authUserId: activeUser?.id,
        profileRole: profile?.role,
        metadataRole: activeUser?.user_metadata?.role,
        resolvedRole,
        resolvedStatus: effectiveStatus,
      });

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
  }, [state.user, state.role, fetchProfile]);

  // Session resolution & Auth State Change Listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
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
          let profile = await fetchProfile(user.id);

          // Auto-sync profile if metadata has role and profile is missing
          const metaRole = user.user_metadata?.role as UserRole | undefined;
          if (metaRole && (!profile || profile.role !== metaRole)) {
            try {
              const syncStatus = user.email_confirmed_at ? 'pending_onboarding' : 'unverified';
              const { data: upsertedProfile } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  email: user.email || '',
                  full_name: user.user_metadata?.full_name || 'User',
                  role: metaRole,
                  status: profile?.status === 'active' ? 'active' : syncStatus,
                }, { onConflict: 'id' })
                .select('*')
                .single();

              if (upsertedProfile) {
                profile = upsertedProfile as Profile;
              }
            } catch {
              // Proceed with existing profile
            }
          }

          const effectiveStatus = resolveEffectiveStatus(user, profile);
          const resolvedRole = resolveRole(user, profile);

          console.log('[AUTH TRACE 01]', {
            authUserId: user.id,
            profileRole: profile?.role,
            metadataRole: user.user_metadata?.role,
            resolvedRole,
            resolvedStatus: effectiveStatus,
          });

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

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const user: AuthUser = session.user;
          let profile = await fetchProfile(user.id);

          const metaRole = user.user_metadata?.role as UserRole | undefined;
          if (metaRole && (!profile || profile.role !== metaRole)) {
            try {
              const syncStatus = user.email_confirmed_at ? 'pending_onboarding' : 'unverified';
              const { data: upsertedProfile } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  email: user.email || '',
                  full_name: user.user_metadata?.full_name || 'User',
                  role: metaRole,
                  status: profile?.status === 'active' ? 'active' : syncStatus,
                }, { onConflict: 'id' })
                .select('*')
                .single();

              if (upsertedProfile) {
                profile = upsertedProfile as Profile;
              }
            } catch {
              // Proceed with existing profile
            }
          }

          const effectiveStatus = resolveEffectiveStatus(user, profile);
          const resolvedRole = resolveRole(user, profile);

          console.log('[AUTH TRACE 01]', {
            authUserId: user.id,
            profileRole: profile?.role,
            metadataRole: user.user_metadata?.role,
            resolvedRole,
            resolvedStatus: effectiveStatus,
          });

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
        if (isMounted) {
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
  }, [fetchProfile]);

  // Actions
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase credentials are not configured in environment.') };
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    if (data?.user) {
      let profile = await fetchProfile(data.user.id);
      const metaRole = data.user.user_metadata?.role as UserRole | undefined;

      if (metaRole && (!profile || profile.role !== metaRole)) {
        try {
          const syncStatus = data.user.email_confirmed_at ? 'pending_onboarding' : 'unverified';
          const { data: upsertedProfile } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email || email.trim(),
              full_name: data.user.user_metadata?.full_name || 'User',
              role: metaRole,
              status: profile?.status === 'active' ? 'active' : syncStatus,
            }, { onConflict: 'id' })
            .select('*')
            .single();

          if (upsertedProfile) {
            profile = upsertedProfile as Profile;
          }
        } catch {
          // Proceed with existing profile
        }
      }

      const effectiveStatus = resolveEffectiveStatus(data.user, profile);
      const resolvedRole = resolveRole(data.user, profile);

      console.log('[AUTH TRACE 01]', {
        authUserId: data.user.id,
        profileRole: profile?.role,
        metadataRole: data.user.user_metadata?.role,
        resolvedRole,
        resolvedStatus: effectiveStatus,
      });

      setState((prev) => ({
        ...prev,
        user: data.user,
        profile,
        role: resolvedRole,
        status: effectiveStatus,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    }

    return { error: null };
  };

  const loginWithGoogle = async (role?: 'candidate' | 'employer'): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase credentials are not configured in environment.') };
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    // Explicitly validate role to only allow candidate or employer (block admin)
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

    console.log('[SIGNUP ROLE DEBUG: register initiated]', {
      selectedRole: metadata.role,
      email,
      fullName: metadata.full_name,
    });

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
      console.log('[SIGNUP TRACE 03]', {
        authUserId: data.user.id,
        userMetadataRole: data.user.user_metadata?.role,
        sessionExists: Boolean(data.session),
        confirmationRequired: !Boolean(data.user.email_confirmed_at),
      });

      const initialStatus = data.user.email_confirmed_at ? 'pending_onboarding' : 'unverified';

      // 1. Explicitly persist/sync profile record with chosen role
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

      // Fallback local representation if network delay
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

      console.log('[SIGNUP TRACE 04]', {
        profileId: profile?.id,
        profileRole: profile?.role,
        profileStatus: profile?.status,
      });

      const effectiveStatus = resolveEffectiveStatus(data.user, profile);
      const resolvedRole = resolveRole(data.user, profile, metadata.role);

      console.log('[AUTH TRACE 01]', {
        authUserId: data.user.id,
        profileRole: profile?.role,
        metadataRole: data.user.user_metadata?.role,
        resolvedRole,
        resolvedStatus: effectiveStatus,
      });

      setState((prev) => ({
        ...prev,
        user: data.user,
        profile,
        role: resolvedRole,
        status: effectiveStatus,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    }

    return { error: null };
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('kth_oauth_intended_role');
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
