import { supabase, isSupabaseConfigured } from '../../../supabase';
import type {
  NotificationEvent,
  NotificationDeliveryResult,
} from '../types';
import { realtimeAdapter, type RealtimeNotificationCallback } from '../adapters/RealtimeAdapter';
import { toastAdapter } from '../adapters/ToastAdapter';
import { preferenceEvaluator } from '../utils/preferenceEvaluator';
import { emailQueue } from '../queue/EmailQueue';

export class NotificationEngine {
  async dispatch(event: NotificationEvent): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];

    // 1. In-App Notification Channel (Evaluated against User Preferences)
    if (preferenceEvaluator.shouldDeliver(event.recipientId, event.category, 'in_app')) {
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
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Storage failed';
        results.push({ channel: 'in_app', success: false, error: errorMsg });
      }

      // Emit live Toast alert for in-app delivery
      toastAdapter.notify({
        id: crypto.randomUUID(),
        recipientId: event.recipientId,
        category: event.category,
        title: event.title,
        body: event.body,
        status: 'delivered',
        isRead: false,
        created_at: new Date().toISOString(),
      }, 'info');
    }

    // 2. Email Channel (Evaluated against User Preferences & Enqueued asynchronously)
    if (
      event.recipientEmail &&
      preferenceEvaluator.shouldDeliver(event.recipientId, event.category, 'email')
    ) {
      emailQueue.enqueue(event.recipientEmail, event.title, event.body);
      results.push({ channel: 'email', success: true });
    }

    return results;
  }

  subscribeToLiveStream(userId: string, callback: RealtimeNotificationCallback): void {
    realtimeAdapter.subscribe(userId, callback);
  }

  unsubscribeLiveStream(): void {
    realtimeAdapter.unsubscribe();
  }
}

export const notificationEngine = new NotificationEngine();
