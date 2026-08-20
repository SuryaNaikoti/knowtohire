/**
 * KnowToHire Notification Service
 * Real-time and persisted database notifications for Candidate and Employer lifecycle events.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'application' | 'interview' | 'offer' | 'system' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export const notificationService = {
  /**
   * Fetch all notifications for the authenticated user.
   */
  async getMyNotifications(): Promise<ServiceResult<AppNotification[]>> {
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const normalized: AppNotification[] = (data || []).map((n) => ({
        id: n.id,
        user_id: n.user_id,
        type: n.type || 'system',
        title: n.title || 'Notification',
        message: n.message || '',
        is_read: Boolean(n.is_read),
        link: n.link || undefined,
        created_at: n.created_at,
      }));

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Get count of unread notifications.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .eq('is_read', false);

      if (error || count === null) return 0;
      return count;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Mark all notifications for the authenticated user as read.
   */
  async markAllAsRead(): Promise<ServiceResult<boolean>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return { data: true, error: null };

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userData.user.id);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Create and trigger a notification for a user.
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'application' | 'interview' | 'offer' | 'system' = 'system',
    link?: string
  ): Promise<ServiceResult<AppNotification>> {
    try {
      const payload = {
        user_id: userId,
        title: title.trim(),
        message: message.trim(),
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('notifications').insert(payload).select('*').single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return {
        data: {
          id: data.id,
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          is_read: data.is_read,
          link,
          created_at: data.created_at,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
