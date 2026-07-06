import { supabase } from '../supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface NotificationPreference {
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  digest_enabled: boolean;
  digest_frequency: 'daily' | 'weekly';
  updated_at: string;
}

export const notificationsService = {
  async getNotifications(limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  },

  async getPreferences(): Promise<NotificationPreference | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) throw error;
    return data as NotificationPreference;
  },

  async updatePreferences(pref: Partial<NotificationPreference>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userData.user.id,
        ...pref,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  subscribeToNotifications(onNotification: (notification: Notification) => void) {
    return supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();
  }
};
