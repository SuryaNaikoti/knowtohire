/**
 * KnowToHire Admin Settings Service
 * Manages platform configuration, admin profile, role governance, security session policies, and notification preferences.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface AdminProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  avatarUrl?: string;
}

export interface PlatformConfigSettings {
  platformName: string;
  supportEmail: string;
  operationalCurrency: string;
  maintenanceMode: boolean;
  jobModerationMode: 'auto_publish' | 'manual_review';
}

export interface RoleGovernanceSettings {
  defaultCandidateStatus: 'active' | 'pending_onboarding';
  defaultEmployerStatus: 'unverified' | 'pending_review' | 'verified';
  requireCorporateEmailForEmployers: boolean;
  maxResumeFileSizeMB: number;
}

export interface SecuritySessionSettings {
  sessionTimeoutMinutes: number;
  enforceMFA: boolean;
  auditLoggingEnabled: boolean;
  rowLevelSecurityStatus: 'enforced' | 'permissive';
}

export interface AdminNotificationSettings {
  emailOnNewEmployerRegistration: boolean;
  emailOnNewJobPost: boolean;
  emailOnContentRequest: boolean;
  dailyPlatformMetricsDigest: boolean;
  securityAlertsImmediate: boolean;
}

export interface MasterAdminSettings {
  profile: AdminProfileSettings;
  platform: PlatformConfigSettings;
  governance: RoleGovernanceSettings;
  security: SecuritySessionSettings;
  notifications: AdminNotificationSettings;
}

const STORAGE_KEY = 'kth_master_admin_settings';

const DEFAULT_ADMIN_SETTINGS: MasterAdminSettings = {
  profile: {
    fullName: 'KnowToHire Platform Administrator',
    email: 'admin@knowtohire.com',
    phone: '+91 80 4920 1800',
    designation: 'Master Superuser & Governance Lead',
  },
  platform: {
    platformName: 'KnowToHire — Sustainability & Career Intelligence Platform',
    supportEmail: 'support@knowtohire.com',
    operationalCurrency: 'INR (₹ Indian Rupee)',
    maintenanceMode: false,
    jobModerationMode: 'auto_publish',
  },
  governance: {
    defaultCandidateStatus: 'active',
    defaultEmployerStatus: 'verified',
    requireCorporateEmailForEmployers: false,
    maxResumeFileSizeMB: 10,
  },
  security: {
    sessionTimeoutMinutes: 60,
    enforceMFA: true,
    auditLoggingEnabled: true,
    rowLevelSecurityStatus: 'enforced',
  },
  notifications: {
    emailOnNewEmployerRegistration: true,
    emailOnNewJobPost: true,
    emailOnContentRequest: true,
    dailyPlatformMetricsDigest: true,
    securityAlertsImmediate: true,
  },
};

export const adminSettingsService = {
  /**
   * Get all master admin settings.
   */
  async getSettings(): Promise<ServiceResult<MasterAdminSettings>> {
    try {
      // 1. Check local persistent store
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return { data: { ...DEFAULT_ADMIN_SETTINGS, ...parsed }, error: null };
          } catch {
            // ignore
          }
        }
      }

      // 2. Query Supabase for current admin profile
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', userData.user.id)
          .maybeSingle();

        if (profile) {
          const settings = {
            ...DEFAULT_ADMIN_SETTINGS,
            profile: {
              ...DEFAULT_ADMIN_SETTINGS.profile,
              fullName: profile.full_name || DEFAULT_ADMIN_SETTINGS.profile.fullName,
              email: profile.email || DEFAULT_ADMIN_SETTINGS.profile.email,
              phone: profile.phone || DEFAULT_ADMIN_SETTINGS.profile.phone,
            },
          };
          return { data: settings, error: null };
        }
      }

      return { data: DEFAULT_ADMIN_SETTINGS, error: null };
    } catch (err) {
      return { data: DEFAULT_ADMIN_SETTINGS, error: null };
    }
  },

  /**
   * Update master admin settings.
   */
  async updateSettings(settings: MasterAdminSettings): Promise<ServiceResult<boolean>> {
    try {
      // 1. Save to local storage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      }

      // 2. Persist profile updates to Supabase if authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        await supabase
          .from('profiles')
          .update({
            full_name: settings.profile.fullName,
            phone: settings.profile.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.user.id);
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
