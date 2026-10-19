import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Radio,
  Briefcase,
  Calendar,
  Award,
  ChevronRight,
  Wrench,
  Loader2,
} from 'lucide-react';
import { notificationService, AppNotification } from '@/services/notificationService';
import { cn } from '@/lib/utils';

export interface NotificationDropdownProps {
  onNavigate?: (path: string) => void;
  role?: 'admin' | 'candidate' | 'employer' | 'creator';
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onNavigate,
  role = 'admin',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.is_read).length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleSync = () => {
      fetchNotifications();
    };

    window.addEventListener('kth_notifications_changed', handleSync);
    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('kth_interviews_changed', handleSync);

    return () => {
      window.removeEventListener('kth_notifications_changed', handleSync);
      window.removeEventListener('kth_applications_changed', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setIsMarkingAll(false);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setIsOpen(false);

    // Resolve target workflow route based on role and notification metadata
    let targetRoute = notif.action_url || notif.link;

    if (!targetRoute) {
      if (role === 'admin') {
        if (notif.category === 'announcement' || notif.type === 'system') {
          targetRoute = '/admin/notifications';
        } else if (notif.type === 'application') {
          targetRoute = '/admin/applications';
        } else if (notif.job_id) {
          targetRoute = '/admin/jobs';
        } else {
          targetRoute = '/admin/notifications';
        }
      } else if (role === 'candidate') {
        if (notif.type === 'interview' || notif.interview_id) {
          targetRoute = '/candidate/interviews';
        } else if (notif.type === 'application' || notif.application_id) {
          targetRoute = notif.application_id
            ? `/candidate/applications/${notif.application_id}`
            : '/candidate/applications';
        } else {
          targetRoute = '/candidate/applications';
        }
      } else if (role === 'employer') {
        if (notif.type === 'interview' || notif.interview_id) {
          targetRoute = '/employer/interviews';
        } else if (notif.type === 'application' || notif.application_id) {
          targetRoute = notif.application_id
            ? `/employer/applications/${notif.application_id}`
            : '/employer/pipeline';
        } else {
          targetRoute = '/employer';
        }
      } else if (role === 'creator') {
        targetRoute = '/creator';
      }
    }

    if (targetRoute) {
      if (onNavigate) {
        onNavigate(targetRoute);
      } else {
        window.history.pushState({}, '', targetRoute);
        window.dispatchEvent(new Event('popstate'));
      }
    }
  };

  const getNotificationIcon = (notif: AppNotification) => {
    if (notif.category === 'announcement' || notif.title?.toLowerCase().includes('announcement')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
      );
    }
    if (notif.category === 'system' || notif.title?.toLowerCase().includes('maintenance')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4" />
        </div>
      );
    }
    switch (notif.type) {
      case 'interview':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'application':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        );
      case 'offer':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const now = new Date();
      const date = new Date(isoDate);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-100 transition-colors cursor-pointer focus:outline-none"
        title={`${unreadCount} unread notification(s)`}
        aria-label="Open notifications dropdown"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-white" />
          </span>
        )}
      </button>

      {/* Flyout Notification Dropdown Bar */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-kth-slate-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 origin-top-right">
          {/* Header */}
          <div className="px-4 py-3 bg-kth-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider font-display">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-[11px] font-semibold text-kth-slate-300 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List Scroll Canvas */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-kth-slate-100 scrollbar-none">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-xs font-bold text-kth-slate-800">All Caught Up</h4>
                <p className="text-[11px] text-kth-slate-500 mt-1 max-w-[200px] mx-auto">
                  You have no new alerts. Platform broadcasts and workflow events will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.is_read;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-kth-slate-50 relative group',
                      isUnread ? 'bg-emerald-50/40' : 'bg-white'
                    )}
                  >
                    {/* Unread Accent Pill */}
                    {isUnread && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r" />
                    )}

                    {getNotificationIcon(notif)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-400">
                          {notif.category || notif.type || 'Notice'}
                        </span>
                        <span className="text-[10px] text-kth-slate-400 font-medium">
                          {formatTimestamp(notif.created_at)}
                        </span>
                      </div>

                      <h5
                        className={cn(
                          'text-xs font-bold mt-0.5 leading-snug line-clamp-1',
                          isUnread ? 'text-kth-slate-900' : 'text-kth-slate-700'
                        )}
                      >
                        {notif.title}
                      </h5>

                      <p className="text-[11px] text-kth-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Destination Preview Tag */}
                      {(notif.action_url || notif.link) && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800">
                          <span>View Workflow</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-kth-slate-50 border-t border-kth-slate-100 flex items-center justify-between text-xs text-kth-slate-500">
            <span className="text-[11px]">Realtime WebSocket Active</span>
            {role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate('/admin/notifications');
                  else {
                    window.history.pushState({}, '', '/admin/notifications');
                    window.dispatchEvent(new Event('popstate'));
                  }
                }}
                className="text-[11px] font-bold text-kth-emerald-700 hover:text-kth-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Broadcast Center</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            {role === 'candidate' && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate('/candidate/notifications');
                  else {
                    window.history.pushState({}, '', '/candidate/notifications');
                    window.dispatchEvent(new Event('popstate'));
                  }
                }}
                className="text-[11px] font-bold text-kth-primary-700 hover:text-kth-primary-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Feed</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            {role === 'employer' && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate('/employer/notifications');
                  else {
                    window.history.pushState({}, '', '/employer/notifications');
                    window.dispatchEvent(new Event('popstate'));
                  }
                }}
                className="text-[11px] font-bold text-kth-primary-700 hover:text-kth-primary-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Feed</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
