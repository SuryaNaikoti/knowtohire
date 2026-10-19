/**
 * useNotificationRealtime Hook
 * Connects to Supabase Realtime channel for public.notifications filtered by user_id = auth.uid().
 * Automatically dispatches kth_notifications_changed to update all shells and counts immediately.
 */

import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useNotificationRealtime() {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) {
      return;
    }

    const userId = user.id;

    // Create a private channel for the user's notifications
    const channelName = `realtime-notifications-${userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Immediately trigger the global notification change event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kth_notifications_changed', {
                detail: { payload },
              })
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // channel active
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);
}
