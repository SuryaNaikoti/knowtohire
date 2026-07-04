import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { notificationService } from '../../../lib/services/notificationService';
import type { NotificationPayload } from '../../../lib/services/notificationService';
import { Loading } from '../../../components/ui/Loading';
import { Bell, CheckCheck, ChevronRight, Mail, BellOff } from 'lucide-react';

const groupByDate = (notifications: NotificationPayload[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: Record<string, NotificationPayload[]> = {
    Today: [],
    'This Week': [],
    Older: [],
  };

  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dayStart >= today) {
      groups['Today'].push(n);
    } else if (dayStart >= weekAgo) {
      groups['This Week'].push(n);
    } else {
      groups['Older'].push(n);
    }
  });

  return groups;
};

const eventTypeLabel = (eventType: string): string => {
  const labels: Record<string, string> = {
    ApplicationSubmitted: 'Application',
    ApplicationStatusChanged: 'Status Update',
    JobApproved: 'Job Alert',
    JobRejected: 'Job Alert',
    ContentRequestUpdates: 'System',
    MarketplacePurchases: 'Payment',
    application_update: 'Application',
    job_alert: 'Job Alert',
    payment: 'Payment',
    system: 'System',
  };
  return labels[eventType] || 'Notification';
};

export const Notifications: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await notificationService.getNotifications(profile.id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!profile) return;
    setMarkingAll(true);
    await notificationService.markAllAsRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupByDate(notifications);

  if (loading) return <Loading label="Loading notifications..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notification Center
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Stay updated on applications, job alerts, and system events.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-blue-800 transition disabled:opacity-50 cursor-pointer w-full md:w-auto justify-center md:justify-start"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? 'Marking...' : 'Mark All as Read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <BellOff className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-600">You're all caught up!</p>
          <p className="text-xs text-gray-400 font-medium">No notifications yet. Apply to jobs to see updates here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupName, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={groupName}>
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{groupName}</h2>
                <div className="space-y-2">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={`group flex items-start gap-4 p-4 rounded-xl border border-solid transition-all cursor-pointer ${
                        n.isRead
                          ? 'bg-white border-gray-100 hover:bg-gray-50'
                          : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        n.isRead ? 'bg-gray-100' : 'bg-primary/10'
                      }`}>
                        <Mail className={`w-4 h-4 ${n.isRead ? 'text-gray-400' : 'text-primary'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!n.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                          )}
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            {eventTypeLabel(n.eventType)}
                          </span>
                        </div>
                        <p className={`text-xs font-bold leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          {new Date(n.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {n.linkUrl && (
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
