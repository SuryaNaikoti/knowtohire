import { useState, useEffect } from 'react';
import { notificationEngine } from '../engine/NotificationEngine';
import { toastAdapter, type ToastMessage } from '../adapters/ToastAdapter';
import type { NotificationPayload } from '../types';

export const useNotifications = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to live websocket stream
    notificationEngine.subscribeToLiveStream(userId, (_payload: NotificationPayload) => {
      setUnreadCount((prev) => prev + 1);
    });

    // Subscribe to UI toast stream
    const unsubscribeToasts = toastAdapter.subscribe((activeToasts) => {
      setToasts(activeToasts);
    });

    return () => {
      notificationEngine.unsubscribeLiveStream();
      unsubscribeToasts();
    };
  }, [userId]);

  const dismissToast = (toastId: string) => {
    toastAdapter.dismiss(toastId);
  };

  return {
    unreadCount,
    setUnreadCount,
    toasts,
    dismissToast,
  };
};
