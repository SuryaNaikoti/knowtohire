/**
 * KnowToHire Notification Service
 * Real-time and persisted database notifications for Candidate and Employer lifecycle events.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface AppNotification {
  id: string;
  user_id: string;
  company_id?: string | null;
  candidate_id?: string | null;
  application_id?: string | null;
  job_id?: string | null;
  interview_id?: string | null;
  type: 'application' | 'interview' | 'offer' | 'system' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface CreateNotificationInput {
  user_id?: string;
  company_id?: string;
  candidate_id?: string;
  application_id?: string;
  job_id?: string;
  interview_id?: string;
  type: 'application' | 'interview' | 'offer' | 'system' | 'message';
  title: string;
  message: string;
  link?: string;
}

const NOTIFICATIONS_CHANGED_EVENT = 'kth_notifications_changed';

function notifyNotificationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
  }
}

function getStoredNotifications(companyId?: string): AppNotification[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const key = companyId ? `kth_notifications_${companyId}` : 'kth_demo_notifications';
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredNotifications(notifications: AppNotification[], companyId?: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = companyId ? `kth_notifications_${companyId}` : 'kth_demo_notifications';
    window.localStorage.setItem(key, JSON.stringify(notifications));
    notifyNotificationsChanged();
  } catch {
    // ignore
  }
}

async function getAuthenticatedCompanyId(): Promise<string | null> {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.role === 'employer' || parsed?.role === 'admin') {
          return parsed.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        }
      } catch {
        // ignore
      }
    }
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: empProfile } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', userData.user.id)
        .maybeSingle();

      if (empProfile?.company_id) return empProfile.company_id;
    }
  } catch {
    // ignore
  }

  return 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
}

export const notificationService = {
  /**
   * Fetch all notifications for the authenticated user/company.
   */
  async getMyNotifications(): Promise<ServiceResult<AppNotification[]>> {
    try {
      const companyId = await getAuthenticatedCompanyId();
      const localNotifs = getStoredNotifications(companyId || undefined);

      if (isSupabaseConfigured()) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userData.user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const dbNotifs: AppNotification[] = data.map((n) => ({
              id: n.id,
              user_id: n.user_id,
              company_id: n.company_id || companyId,
              candidate_id: n.candidate_id,
              application_id: n.application_id,
              job_id: n.job_id,
              interview_id: n.interview_id,
              type: n.type || 'system',
              title: n.title || 'Notification',
              message: n.message || '',
              is_read: Boolean(n.is_read),
              link: n.link || undefined,
              created_at: n.created_at,
            }));

            // Merge local and DB (dedup by ID)
            const merged = [...localNotifs];
            for (const dn of dbNotifs) {
              if (!merged.some((m) => m.id === dn.id)) {
                merged.push(dn);
              }
            }
            merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return { data: merged, error: null };
          }
        }
      }

      localNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { data: localNotifs, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Get count of unread notifications.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await this.getMyNotifications();
      if (!res.data) return 0;
      return res.data.filter((n) => !n.is_read).length;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(id: string): Promise<ServiceResult<boolean>> {
    try {
      const companyId = await getAuthenticatedCompanyId();
      const localNotifs = getStoredNotifications(companyId || undefined);
      const targetIdx = localNotifs.findIndex((n) => n.id === id);

      if (targetIdx !== -1) {
        localNotifs[targetIdx].is_read = true;
        saveStoredNotifications(localNotifs, companyId || undefined);
      }

      if (isSupabaseConfigured()) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }

      notifyNotificationsChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Mark all notifications for the authenticated user/company as read.
   */
  async markAllAsRead(): Promise<ServiceResult<boolean>> {
    try {
      const companyId = await getAuthenticatedCompanyId();
      const localNotifs = getStoredNotifications(companyId || undefined);

      const updated = localNotifs.map((n) => ({ ...n, is_read: true }));
      saveStoredNotifications(updated, companyId || undefined);

      if (isSupabaseConfigured()) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('notifications').update({ is_read: true }).eq('user_id', userData.user.id);
        }
      }

      notifyNotificationsChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Create and trigger a notification for an employer or candidate.
   */
  async createNotification(input: CreateNotificationInput): Promise<ServiceResult<AppNotification>> {
    try {
      const companyId = input.company_id || (await getAuthenticatedCompanyId()) || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
      const userId = input.user_id || '00000000-0000-0000-0000-000000000002';

      const existingNotifs = getStoredNotifications(companyId);

      // Duplicate prevention: avoid inserting same notification for same application/interview event within 10s
      const isDuplicate = existingNotifs.some(
        (n) =>
          n.title === input.title &&
          n.message === input.message &&
          Math.abs(new Date().getTime() - new Date(n.created_at).getTime()) < 10000
      );

      if (isDuplicate) {
        const match = existingNotifs.find((n) => n.title === input.title && n.message === input.message)!;
        return { data: match, error: null };
      }

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        user_id: userId,
        company_id: companyId,
        candidate_id: input.candidate_id || null,
        application_id: input.application_id || null,
        job_id: input.job_id || null,
        interview_id: input.interview_id || null,
        type: input.type,
        title: input.title.trim(),
        message: input.message.trim(),
        is_read: false,
        link: input.link,
        created_at: new Date().toISOString(),
      };

      existingNotifs.unshift(newNotif);
      saveStoredNotifications(existingNotifs, companyId);

      if (isSupabaseConfigured()) {
        await supabase.from('notifications').insert({
          user_id: userId,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          is_read: false,
          created_at: newNotif.created_at,
        });
      }

      notifyNotificationsChanged();
      return { data: newNotif, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Send a notification with candidate notification preference governance.
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'application' | 'interview' | 'offer' | 'system' | 'message' = 'system',
    link?: string
  ): Promise<ServiceResult<AppNotification | null>> {
    try {
      // Check candidate notification preferences from demo or database
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const storedCustom = window.localStorage.getItem(`kth_demo_cand_profile_${userId}`);
          if (storedCustom) {
            const parsed = JSON.parse(storedCustom);
            if (type === 'system' && parsed.jobRecommendationAlerts === false) {
              return { data: null, error: null }; // Suppressed by preference
            }
            if (type === 'application' && parsed.applicationStageUpdates === false) {
              return { data: null, error: null }; // Suppressed by preference
            }
          }
        } catch {
          // ignore
        }
      }

      const res = await this.createNotification({
        user_id: userId,
        candidate_id: userId,
        title,
        message,
        type,
        link,
      });

      if (res.error) {
        return { data: null, error: res.error };
      }
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
