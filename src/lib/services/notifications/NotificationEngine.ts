import { supabase, isSupabaseConfigured } from '../../supabase';
import type {
  NotificationEvent,
  NotificationDeliveryResult,
} from './types';
import { emailAdapter } from './EmailAdapter';
import { realtimeAdapter, type RealtimeNotificationCallback } from './RealtimeAdapter';

export class NotificationEngine {
  /**
   * Dispatch notification event across active channels
   */
  async dispatch(event: NotificationEvent): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];

    // 1. In-App Database Persistence
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('notifications').insert({
          user_id: event.recipientId,
          type: event.category,
          title: event.title,
          message: event.body,
          is_read: false,
        });

        if (!error) {
          results.push({ channel: 'in_app', success: true });
        } else {
          results.push({ channel: 'in_app', success: false, error: error.message });
        }
      } else {
        // LocalStorage fallback for demo mode
        const key = 'kth_notifications';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          id: crypto.randomUUID(),
          recipientId: event.recipientId,
          category: event.category,
          title: event.title,
          body: event.body,
          linkUrl: event.linkUrl,
          status: 'delivered',
          isRead: false,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(existing));
        results.push({ channel: 'in_app', success: true });
      }
    } catch (err: any) {
      results.push({ channel: 'in_app', success: false, error: err?.message });
    }

    // 2. Email Gateway Dispatch (if recipient email is provided)
    if (event.recipientEmail) {
      const emailResult = await emailAdapter.sendEmail(
        event.recipientEmail,
        event.title,
        event.body
      );
      results.push(emailResult);
    }

    return results;
  }

  /**
   * Subscribe to single authenticated websocket stream
   */
  subscribeToLiveStream(userId: string, callback: RealtimeNotificationCallback): void {
    realtimeAdapter.subscribe(userId, callback);
  }

  /**
   * Unsubscribe active live stream
   */
  unsubscribeLiveStream(): void {
    realtimeAdapter.unsubscribe();
  }
}

export const notificationEngine = new NotificationEngine();
