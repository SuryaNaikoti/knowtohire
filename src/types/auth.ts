import { User } from '@supabase/supabase-js';
import { Profile, UserRole, AccountStatus } from './database';

export type { UserRole, AccountStatus };
export type AuthUser = User;
export type AuthProfile = Profile;

export interface AuthState {
  user: AuthUser | null;
  profile: AuthProfile | null;
  role: UserRole | null;
  status: AccountStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  loginWithGoogle: (role?: 'candidate' | 'employer') => Promise<{ error: Error | null }>;
  register: (
    email: string,
    password: string,
    metadata: { full_name: string; role: 'candidate' | 'employer' }
  ) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  clearError: () => void;
}
