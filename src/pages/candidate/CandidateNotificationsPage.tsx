import React, { useState, useEffect } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notificationService, AppNotification } from '@/services/notificationService';
import { CheckCheck, Bell, Calendar, Briefcase, Award, Loader2 } from 'lucide-react';

export const CandidateNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const res = await notificationService.getMyNotifications();
    if (res.data) {
      setNotifications(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setIsMarkingAll(false);
  };

  const handleMarkSingleRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'application':
        return <Briefcase className="w-4 h-4 text-kth-primary-600" />;
      case 'offer':
        return <Award className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-kth-primary-600" />;
    }
  };

  return (
    <CandidateShell title="Notifications" currentPath="/candidate/notifications">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center text-xs">
          <span className="text-kth-slate-500">
            You have <strong className="text-kth-slate-900 font-mono">{unreadCount} unread</strong> notifications
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              isLoading={isMarkingAll}
              leftIcon={<CheckCheck className="w-4 h-4 text-kth-primary-600" />}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-kth-primary-600 animate-spin mb-2" />
            <p className="text-xs text-kth-slate-500">Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-10 h-10 text-kth-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-base text-kth-slate-900 mb-1">No Notifications</h4>
            <p className="text-xs text-kth-slate-500">
              You will receive updates here when employers view your applications, schedule interviews, or extend offers.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkSingleRead(notif.id)}
                className={`p-4 transition-all cursor-pointer ${
                  !notif.is_read
                    ? 'bg-kth-primary-50/40 border-kth-primary-200 shadow-xs'
                    : 'bg-white hover:border-kth-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-kth-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-display font-bold text-xs text-kth-slate-900 flex items-center gap-2">
                        {notif.title}
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-kth-primary-600 inline-block" />
                        )}
                      </h4>
                      <span className="text-[10px] text-kth-slate-400 font-mono">
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-kth-slate-600 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
