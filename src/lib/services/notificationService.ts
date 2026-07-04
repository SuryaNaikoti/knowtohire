import { supabase, isSupabaseConfigured } from '../supabase';

export type NotificationEvent =
  | 'ApplicationSubmitted'
  | 'ApplicationStatusChanged'
  | 'JobApproved'
  | 'JobRejected'
  | 'ContentRequestUpdates'
  | 'MarketplacePurchases';

export interface NotificationPayload {
  id: string;
  recipientId: string;
  eventType: NotificationEvent;
  title: string;
  body: string;
  isRead: boolean;
  linkUrl?: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'kth_notifications';

const getLocalNotifications = (): NotificationPayload[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to parse notifications from localStorage', err);
    return [];
  }
};

const saveLocalNotifications = (notifications: NotificationPayload[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications to localStorage', err);
  }
};

export const notificationService = {
  dispatchNotification: async (
    recipientId: string,
    eventType: NotificationEvent,
    title: string,
    body: string,
    linkUrl?: string
  ): Promise<boolean> => {
    const newNotification: NotificationPayload = {
      id: crypto.randomUUID(),
      recipientId,
      eventType,
      title,
      body,
      isRead: false,
      linkUrl,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('notifications').insert({
          recipient_id: recipientId,
          event_type: eventType,
          title,
          body,
          link_url: linkUrl,
          is_read: false,
        });
        if (!error) return true;
        console.warn('Supabase notification insert failed, falling back to local storage', error);
      } catch (err) {
        console.warn('Supabase notification insert failed with exception, falling back to local storage', err);
      }
    }

    const localNotifications = getLocalNotifications();
    localNotifications.unshift(newNotification);
    saveLocalNotifications(localNotifications);
    return true;
  },

  getNotifications: async (recipientId: string): Promise<NotificationPayload[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', recipientId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            recipientId: item.recipient_id,
            eventType: item.event_type as NotificationEvent,
            title: item.title,
            body: item.body,
            isRead: item.is_read,
            linkUrl: item.link_url,
            created_at: item.created_at,
          }));
        }
        console.warn('Supabase notifications select failed, falling back to local storage', error);
      } catch (err) {
        console.warn('Supabase notifications select failed with exception, falling back to local storage', err);
      }
    }

    const localNotifications = getLocalNotifications();
    return localNotifications.filter(n => n.recipientId === recipientId);
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
        if (!error) return true;
        console.warn('Supabase notifications update failed, falling back to local storage', error);
      } catch (err) {
        console.warn('Supabase notifications update failed with exception, falling back to local storage', err);
      }
    }

    const localNotifications = getLocalNotifications();
    const updated = localNotifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveLocalNotifications(updated);
    return true;
  },
};
