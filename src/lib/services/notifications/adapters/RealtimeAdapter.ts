import { supabase, isSupabaseConfigured } from '../../../supabase';
import type { NotificationPayload } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeNotificationCallback = (payload: NotificationPayload) => void;

export class RealtimeNotificationAdapter {
  private channel: RealtimeChannel | null = null;
  private activeUserId: string | null = null;

  subscribe(userId: string, callback: RealtimeNotificationCallback): void {
    if (this.activeUserId === userId && this.channel) {
      return;
    }

    this.unsubscribe();

    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    this.activeUserId = userId;
    this.channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newRow = payload.new;
          if (newRow) {
            callback({
              id: newRow.id,
              recipientId: newRow.user_id,
              category: newRow.type || 'system',
              title: newRow.title,
              body: newRow.message,
              linkUrl: undefined,
              status: 'delivered',
              isRead: newRow.is_read || false,
              created_at: newRow.created_at,
            });
          }
        }
      )
      .subscribe();
  }

  unsubscribe(): void {
    if (this.channel && supabase) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.activeUserId = null;
    }
  }
}

export const realtimeAdapter = new RealtimeNotificationAdapter();
