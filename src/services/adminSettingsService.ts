/**
 * KnowToHire Admin Settings Service
 * Manages platform configuration, admin profile, role governance, security session policies, and notification preferences.
 *
 * ARCHITECTURE NOTE:
 * Dual-layer architecture:
 * 1. REAL SUPABASE MODE: When configured, reads admin profile and settings.
 * 2. LOCAL / DEMO RESILIENT LAYER: Synchronizes in-memory & localStorage store,
 *    emitting 'kth_admin_settings_changed' for live reactive updates across Admin console.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

export interface CreatorPayoutSettings {
  minPayoutThresholdINR: number;
  creatorCommissionPct: number;
  defaultFeaturedJobDurationDays: number;
}

export interface MasterAdminSettings {
  profile: AdminProfileSettings;
  platform: PlatformConfigSettings;
  governance: RoleGovernanceSettings;
  security: SecuritySessionSettings;
  notifications: AdminNotificationSettings;
  creatorPayout: CreatorPayoutSettings;
}

const STORAGE_KEY = 'kth_master_admin_settings';

export const DEFAULT_ADMIN_SETTINGS: MasterAdminSettings = {
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
  creatorPayout: {
    minPayoutThresholdINR: 1500,
    creatorCommissionPct: 70,
    defaultFeaturedJobDurationDays: 7,
  },
};

let inMemorySettings: MasterAdminSettings | null = null;

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
            return {
              data: {
                ...DEFAULT_ADMIN_SETTINGS,
                ...parsed,
                profile: { ...DEFAULT_ADMIN_SETTINGS.profile, ...parsed.profile },
                platform: { ...DEFAULT_ADMIN_SETTINGS.platform, ...parsed.platform },
                governance: { ...DEFAULT_ADMIN_SETTINGS.governance, ...parsed.governance },
                security: { ...DEFAULT_ADMIN_SETTINGS.security, ...parsed.security },
                notifications: { ...DEFAULT_ADMIN_SETTINGS.notifications, ...parsed.notifications },
                creatorPayout: { ...DEFAULT_ADMIN_SETTINGS.creatorPayout, ...(parsed.creatorPayout || {}) },
              },
              error: null,
            };
          } catch {
            // ignore
          }
        }
      }

      if (inMemorySettings) {
        return { data: inMemorySettings, error: null };
      }

      // 2. Query Supabase for current admin profile if available
      if (isSupabaseConfigured()) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email, phone')
              .eq('id', userData.user.id)
              .maybeSingle();

            if (profile) {
              const settings: MasterAdminSettings = {
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
        } catch {
          // Fallback
        }
      }

      return { data: DEFAULT_ADMIN_SETTINGS, error: null };
    } catch (err) {
      return { data: inMemorySettings || DEFAULT_ADMIN_SETTINGS, error: null };
    }
  },

  /**
   * Update master admin settings.
   */
  async updateSettings(settings: MasterAdminSettings): Promise<ServiceResult<boolean>> {
    try {
      inMemorySettings = settings;

      // 1. Save to local storage
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
          } catch {
            // ignore
          }
        }
        window.dispatchEvent(new CustomEvent('kth_admin_settings_changed'));
      }

      // 2. Persist profile updates to Supabase if authenticated
      if (isSupabaseConfigured()) {
        try {
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
        } catch {
          // Table catch
        }
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Reset settings to canonical defaults (used for testing cleanup).
   */
  async resetSettings(): Promise<ServiceResult<boolean>> {
    inMemorySettings = { ...DEFAULT_ADMIN_SETTINGS };
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent('kth_admin_settings_changed'));
    }
    return { data: true, error: null };
  },
};
