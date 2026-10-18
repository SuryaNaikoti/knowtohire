/**
 * KnowToHire Browser Push Notification Service
 * Manages ServiceWorker registration, VAPID push subscriptions, and endpoint lifecycle.
 */

import { supabase } from '@/lib/supabase';

const SW_PATH = '/sw.js';

export interface PushSubscriptionResult {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  error?: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushNotificationService = {
  /**
   * Check if the current browser environment supports ServiceWorkers and Web Push.
   */
  isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  /**
   * Register the Service Worker if supported.
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
      return reg;
    } catch (err) {
      console.debug('[PushNotificationService] ServiceWorker registration failed:', err);
      return null;
    }
  },

  /**
   * Get current push notification permission status.
   */
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  /**
   * Request permission and subscribe the device to Web Push.
   * Sends the endpoint to /api/push-subscription with Bearer JWT.
   */
  async subscribeToPush(): Promise<PushSubscriptionResult> {
    if (!this.isPushSupported()) {
      return { supported: false, permission: 'denied', subscribed: false, error: 'Push not supported by browser.' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { supported: true, permission, subscribed: false, error: 'Push permission not granted.' };
      }

      const reg = await this.registerServiceWorker();
      if (!reg) {
        return { supported: true, permission, subscribed: false, error: 'Failed to register ServiceWorker.' };
      }

      // Check existing subscription
      let sub = await reg.pushManager.getSubscription();

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      if (!sub) {
        if (!vapidPublicKey) {
          // If no VAPID public key configured in current environment, return graceful status
          return {
            supported: true,
            permission: 'granted',
            subscribed: false,
            error: 'VAPID public key not configured (VITE_VAPID_PUBLIC_KEY).',
          };
        }

        const appServerKey = urlBase64ToUint8Array(vapidPublicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey as any,
        });
      }

      const subJson = sub.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        return { supported: true, permission: 'granted', subscribed: false, error: 'Invalid subscription object.' };
      }

      // Get authenticated session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        return { supported: true, permission: 'granted', subscribed: false, error: 'User is not authenticated.' };
      }

      // Send to serverless endpoint
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
          },
          user_agent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          supported: true,
          permission: 'granted',
          subscribed: false,
          error: errJson.error || 'Server failed to register push subscription.',
        };
      }

      return {
        supported: true,
        permission: 'granted',
        subscribed: true,
      };
    } catch (err: any) {
      return {
        supported: true,
        permission: this.getPermission(),
        subscribed: false,
        error: err?.message || String(err),
      };
    }
  },

  /**
   * Unsubscribe the browser push subscription locally and from the database.
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.isPushSupported()) return false;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        // Notify server
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token && endpoint) {
          await fetch('/api/push-subscription', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint }),
          }).catch(() => {});
        }
      }

      return true;
    } catch (err) {
      console.debug('[PushNotificationService] Failed to unsubscribe:', err);
      return false;
    }
  },
};
