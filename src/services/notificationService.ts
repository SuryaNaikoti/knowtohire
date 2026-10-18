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
  category?: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  link?: string;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
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
  category?: string;
  title: string;
  message: string;
  link?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

const NOTIFICATIONS_CHANGED_EVENT = 'kth_notifications_changed';

function notifyNotificationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
  }
}

interface NotificationScope {
  role: 'candidate' | 'employer' | 'creator' | 'admin';
  storageKey: string;
  userId?: string | null;
  companyId?: string | null;
}

async function getNotificationScope(): Promise<NotificationScope> {
  // 1. Check demo auth session first
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        const role = parsed?.role || 'candidate';
        const userId = parsed?.id || null;
        if (role === 'employer') {
          const compId = parsed?.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
          return { role: 'employer', storageKey: `kth_notifications_${compId}`, userId, companyId: compId };
        } else if (role === 'creator') {
          return { role: 'creator', storageKey: userId ? `kth_notifications_creator_${userId}` : 'kth_notifications_creator', userId };
        } else if (role === 'admin') {
          return { role: 'admin', storageKey: 'kth_notifications_admin', userId };
        } else {
          return { role: 'candidate', storageKey: userId ? `kth_notifications_cand_${userId}` : 'kth_demo_notifications', userId };
        }
      } catch {
        // ignore
      }
    }
  }

  // 2. Check Supabase authenticated user
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const uid = userData.user.id;
      // Check profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .maybeSingle();

      const userRole = profile?.role || 'candidate';

      if (userRole === 'employer') {
        const { data: empProfile } = await supabase
          .from('employer_profiles')
          .select('company_id')
          .eq('profile_id', uid)
          .maybeSingle();

        const compId = empProfile?.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        return { role: 'employer', storageKey: `kth_notifications_${compId}`, userId: uid, companyId: compId };
      } else if (userRole === 'creator') {
        return { role: 'creator', storageKey: `kth_notifications_creator_${uid}`, userId: uid };
      } else if (userRole === 'admin') {
        return { role: 'admin', storageKey: 'kth_notifications_admin', userId: uid };
      } else {
        return { role: 'candidate', storageKey: `kth_notifications_cand_${uid}`, userId: uid };
      }
    }
  } catch {
    // ignore
  }

  return { role: 'candidate', storageKey: 'kth_demo_notifications' };
}

function getStoredNotifications(storageKey: string): AppNotification[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredNotifications(notifications: AppNotification[], storageKey: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(notifications));
    notifyNotificationsChanged();
  } catch {
    // ignore
  }
}

export const notificationService = {
  /**
   * Fetch all notifications for the authenticated user/company across any role.
   */
  async getMyNotifications(): Promise<ServiceResult<AppNotification[]>> {
    try {
      const scope = await getNotificationScope();
      const localNotifs = getStoredNotifications(scope.storageKey);

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
              company_id: n.company_id || scope.companyId,
              candidate_id: n.candidate_id,
              application_id: n.application_id,
              job_id: n.job_id,
              interview_id: n.interview_id,
              type: n.type || 'system',
              category: n.category || 'system',
              title: n.title || 'Notification',
              message: n.message || '',
              is_read: Boolean(n.is_read),
              read_at: n.read_at || null,
              link: n.action_url || n.link || undefined,
              action_url: n.action_url || n.link || null,
              metadata: n.metadata || {},
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
      const scope = await getNotificationScope();
      const localNotifs = getStoredNotifications(scope.storageKey);
      const targetIdx = localNotifs.findIndex((n) => n.id === id);

      const nowIso = new Date().toISOString();
      if (targetIdx !== -1) {
        localNotifs[targetIdx].is_read = true;
        localNotifs[targetIdx].read_at = nowIso;
        saveStoredNotifications(localNotifs, scope.storageKey);
      }

      if (isSupabaseConfigured()) {
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: nowIso })
          .eq('id', id);
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
      const scope = await getNotificationScope();
      const localNotifs = getStoredNotifications(scope.storageKey);

      const updated = localNotifs.map((n) => ({ ...n, is_read: true }));
      saveStoredNotifications(updated, scope.storageKey);

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
   * Create and trigger a notification for any role (employer, candidate, creator, admin).
   */
  async createNotification(input: CreateNotificationInput): Promise<ServiceResult<AppNotification>> {
    try {
      let targetStorageKey = 'kth_demo_notifications';
      let userId = input.user_id;

      if (input.company_id) {
        targetStorageKey = `kth_notifications_${input.company_id}`;
        if (!userId) userId = '00000000-0000-0000-0000-000000000002';
      } else if (input.candidate_id) {
        targetStorageKey = `kth_notifications_cand_${input.candidate_id}`;
        if (!userId) userId = input.candidate_id;
      } else if (input.user_id) {
        targetStorageKey = `kth_notifications_user_${input.user_id}`;
      } else {
        const scope = await getNotificationScope();
        targetStorageKey = scope.storageKey;
        if (!userId) userId = scope.userId || '00000000-0000-0000-0000-000000000001';
      }

      if (!userId) {
        userId = '00000000-0000-0000-0000-000000000001';
      }

      const existingNotifs = getStoredNotifications(targetStorageKey);

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
        company_id: input.company_id || null,
        candidate_id: input.candidate_id || null,
        application_id: input.application_id || null,
        job_id: input.job_id || null,
        interview_id: input.interview_id || null,
        type: input.type,
        category: input.category || 'system',
        title: input.title.trim(),
        message: input.message.trim(),
        is_read: false,
        read_at: null,
        link: input.action_url || input.link,
        action_url: input.action_url || input.link || null,
        metadata: input.metadata || {},
        created_at: new Date().toISOString(),
      };

      existingNotifs.unshift(newNotif);
      saveStoredNotifications(existingNotifs, targetStorageKey);

      if (isSupabaseConfigured() && userId && userId !== '00000000-0000-0000-0000-000000000002') {
        try {
          const { data: authData } = await supabase.auth.getUser();
          // Owner-only check: only insert if authenticated user matches target recipient
          if (authData?.user && authData.user.id === userId) {
            await supabase.from('notifications').insert({
              user_id: userId,
              title: newNotif.title,
              message: newNotif.message,
              type: newNotif.type,
              category: newNotif.category,
              action_url: newNotif.action_url,
              metadata: newNotif.metadata,
              is_read: false,
              read_at: null,
              created_at: newNotif.created_at,
            });
          }
        } catch {
          // ignore DB insert errors
        }
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
