import { supabase } from './supabaseClient';

// Supabase environment credential variables
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

// Status flag indicating whether Supabase credentials are set in .env
export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'https://your-supabase-url.supabase.co' &&
  SUPABASE_ANON_KEY !== 'your-anon-key-placeholder' &&
  SUPABASE_ANON_KEY !== 'your-publishable-key-placeholder';

// Export the shared client instance to maintain a single source of truth and session state
export { supabase };

// ==========================================
// SPRINT 1 DATABASE TYPES & SCHEMAS
// ==========================================

export type PlatformRole = 'Candidate' | 'Employer' | 'Admin';

/**
 * Platform User profile synchronized from Clerk authentication.
 */
export interface DBUser {
  id: string; // Synced with Clerk userId (e.g. user_...)
  email: string;
  name: string;
  role: PlatformRole;
  created_at: string;
  updated_at: string;
}

/**
 * Candidate or Employer profile containing metadata.
 */
export interface DBProfile {
  id: string; // Links to DBUser.id
  avatar_url?: string;
  bio?: string;
  phone_number?: string;
  website_url?: string;
  
  // Candidate Specifics
  resume_url?: string;
  skills?: string[];
  education_level?: string;
  desired_salary?: number;
  
  // Employer Specifics
  company_name?: string;
  company_size?: string;
  industry?: string;
  headquarters?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * User-specific notification and security preferences.
 */
export interface DBSettings {
  id: string; // Links to DBUser.id
  email_notifications: boolean;
  marketing_emails: boolean;
  profile_visibility: 'public' | 'private' | 'employers-only';
  two_factor_enabled: boolean;
  updated_at: string;
}

/**
 * System and security logging records for compliance.
 */
export interface DBAuditLog {
  id: string; // uuid primary key
  user_id: string; // Actor
  user_email: string;
  role: PlatformRole;
  action: string; // Description (e.g., 'Deleted profile resume')
  module: string; // Target feature (e.g., 'Profile Hub')
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper methods to simulate Supabase database calls in offline developer mode
export const mockDatabaseService = {
  getUserProfile: async (userId: string): Promise<DBProfile | null> => {
    return {
      id: userId,
      bio: 'Simulated biography content for local preview purposes.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
      company_name: 'InnoTech Solutions',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
  getSettings: async (userId: string): Promise<DBSettings> => {
    return {
      id: userId,
      email_notifications: true,
      marketing_emails: false,
      profile_visibility: 'public',
      two_factor_enabled: false,
      updated_at: new Date().toISOString(),
    };
  },
  writeAuditLog: async (log: Omit<DBAuditLog, 'id' | 'created_at'>): Promise<boolean> => {
    console.log('[SUPABASE AUDIT SIMULATION]', log);
    return true;
  },
};
