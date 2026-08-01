import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { setRememberMePreference, clearSessionPreferences } from '../lib/session/sessionStorage';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { SessionTimeoutModal } from '../components/auth/SessionTimeoutModal';

export type UserRole = 'candidate' | 'employer' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  headline?: string | null;
  phone_number?: string | null;
}

export interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (rememberMe?: boolean) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  extendSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Multi-Tab Synchronization Channel
const AUTH_BROADCAST_CHANNEL = 'knowtohire_auth_channel';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes
const IDLE_WARNING_MS = 14 * 60 * 1000; // 14 Minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIdleModal, setShowIdleModal] = useState(false);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      if (error) throw error;
      setProfile(data as UserProfile);
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Proactive Silent Token Refresh
  const scheduleTokenRefresh = useCallback((currentSession: Session | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    if (!currentSession || !currentSession.expires_at) return;

    const expiresAtMs = currentSession.expires_at * 1000;
    const nowMs = Date.now();
    // Refresh 5 minutes before expiration
    const refreshLeadTimeMs = 5 * 60 * 1000;
    const timeUntilRefreshMs = Math.max(1000, expiresAtMs - nowMs - refreshLeadTimeMs);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn('Silent token refresh failed:', error.message);
        } else if (data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error('Error during silent token refresh:', err);
      }
    }, timeUntilRefreshMs);
  }, []);

  // Logout Handler
  const logout = useCallback(async () => {
    setLoading(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setShowIdleModal(false);
    clearSessionPreferences();

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout warning:', err);
    }

    setProfile(null);
    setUser(null);
    setSession(null);
    setLoading(false);

    // Notify other open browser tabs
    try {
      broadcastChannelRef.current?.postMessage({ type: 'LOGOUT' });
    } catch {
      // Ignore broadcast fallback
    }
  }, []);

  const extendSession = useCallback(async () => {
    setShowIdleModal(false);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        setSession(data.session);
        scheduleTokenRefresh(data.session);
      }
    } catch (err) {
      console.error('Failed to extend session:', err);
    }
  }, [scheduleTokenRefresh]);

  // Idle Timer Setup
  const { resetTimer } = useIdleTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    warningMs: IDLE_WARNING_MS,
    onWarning: () => {
      if (user) setShowIdleModal(true);
    },
    onTimeout: () => {
      if (user) logout();
    },
    enabled: !!user,
  });

  const handleExtendClick = () => {
    extendSession();
    resetTimer();
  };

  // Multi-Tab Synchronization & Auth Listener
  useEffect(() => {
    if ('BroadcastChannel' in window) {
      broadcastChannelRef.current = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          setUser(null);
          setSession(null);
          setProfile(null);
        } else if (event.data?.type === 'LOGIN') {
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
          });
        }
      };
    }

    // Initial session restoration
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      scheduleTokenRefresh(session);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      scheduleTokenRefresh(session);

      if (event === 'SIGNED_IN') {
        try {
          broadcastChannelRef.current?.postMessage({ type: 'LOGIN' });
        } catch {
          // Ignore broadcast failures on fallback environments
        }
      }

      if (session?.user) {
        setLoading(true);
        await fetchProfile(session.user.id);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
    };
  }, [fetchProfile, scheduleTokenRefresh]);

  const login = (rememberMe = false) => {
    setRememberMePreference(rememberMe);
  };

  const setRole = async (newRole: UserRole) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
      if (error) throw error;
      await fetchProfile(user.id);
    } catch (err) {
      console.error('Failed to set role:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  const authValue = useMemo(
    () => ({
      user,
      session,
      profile,
      isAuthenticated,
      loading,
      login,
      logout,
      setRole,
      refreshProfile,
      extendSession,
    }),
    [user, session, profile, isAuthenticated, loading, logout, extendSession]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
      <SessionTimeoutModal
        isOpen={showIdleModal}
        onExtend={handleExtendClick}
        onLogout={logout}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
