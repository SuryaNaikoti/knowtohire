import React, { useState, useEffect } from 'react';
import { notificationsService } from '../lib/services/notificationsService';
import type { Notification } from '../lib/services/notificationsService';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications(5);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const channel = notificationsService.subscribeToNotifications((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationsService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-35" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <span className="text-sm font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.link) navigate(item.link);
                      setIsOpen(false);
                    }}
                    className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors relative ${
                      !item.is_read ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      {!item.is_read && (
                        <button
                          onClick={(e) => handleMarkRead(item.id, e)}
                          className="w-4 h-4 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-2 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  navigate('/dashboard/notifications');
                  setIsOpen(false);
                }}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5"
              >
                View all notifications
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Fallback import mock to avoid TS issues
import { supabase } from '../lib/supabase';
