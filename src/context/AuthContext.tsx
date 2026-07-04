import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'candidate' | 'employer' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, role: UserRole) => void; // Keeping compatible signatures
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
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
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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
    };
  }, []);

  const login = () => {
    // Compatible placeholder signature - actual login uses supabase client directly
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, session, profile, isAuthenticated, loading, login, logout, setRole, refreshProfile }}>
      {children}
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
