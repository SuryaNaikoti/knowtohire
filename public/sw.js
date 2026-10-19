/**
 * KnowToHire Browser Service Worker
 * Handles Web Push notifications and push-click navigation events.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Handle incoming Web Push notifications from server
 */
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let payload = {
    title: 'KnowToHire Notification',
    message: 'You have a new update on KnowToHire.',
    action_url: '/',
    category: 'system',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
  };

  try {
    const json = event.data.json();
    payload = {
      ...payload,
      ...json,
    };
  } catch {
    payload.message = event.data.text() || payload.message;
  }

  const notificationOptions = {
    body: payload.message || payload.body,
    icon: payload.icon || '/favicon.svg',
    badge: payload.badge || '/favicon.svg',
    tag: payload.tag || `kth-notif-${Date.now()}`,
    data: {
      action_url: payload.action_url || payload.link || '/',
      timestamp: Date.now(),
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

/**
 * Handle user click on push notification banner
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.action_url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open on this origin, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.focus();
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
