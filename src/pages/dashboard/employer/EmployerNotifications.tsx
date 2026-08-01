import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { useAuth } from '../../../context/AuthContext';
import { Bell, Sparkles, Calendar, FileText, CreditCard } from 'lucide-react';

interface EmployerNotification {
  id: string;
  type: 'application' | 'interview' | 'billing' | 'recommendation' | 'general';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const EmployerNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EmployerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Simulate real-time and mock notifications since it is a dashboard workspace
      const mockNotifications: EmployerNotification[] = [
        {
          id: 'n-1',
          type: 'application',
          title: 'New Application Received',
          message: 'Sarah Vance applied for your Senior React Architect position. AI alignment matches at 94%.',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          read: false,
        },
        {
          id: 'n-2',
          type: 'interview',
          title: 'Interview Reminder',
          message: 'Technical round with Alex Chen is scheduled in 2 hours at 2:00 PM.',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          read: false,
        },
        {
          id: 'n-3',
          type: 'recommendation',
          title: 'AI Candidate Recommendation',
          message: 'We discovered 3 candidate profiles matching your Supabase/PostgreSQL stack settings.',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: true,
        },
        {
          id: 'n-4',
          type: 'billing',
          title: 'Billing Invoice Generated',
          message: 'Invoice K2H-920489 for your Starter Plan renewal has been successfully processed.',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          read: true,
        },
      ];

      setNotifications(mockNotifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="w-5 h-5 text-primary" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-secondary" />;
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-accent" />;
      case 'billing':
        return <CreditCard className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <Loading label="Loading alerts..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Notifications Console
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Monitor applicant milestones, technical interview rounds, system notifications, and billing invoices.
          </p>
        </div>
        <Button size="sm" variant="outline" className="bg-white text-xs font-bold self-start" onClick={markAllRead}>
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-4 max-w-4xl">
        {notifications.length === 0 ? (
          <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
            <Bell className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-600">You are all caught up!</p>
            <p className="text-xs text-gray-400 font-medium">No unread notifications present.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`bg-white hover:border-gray-300 transition ${
                !notif.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2.5 bg-gray-50 border border-gray-100 border-solid rounded-xl shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap shrink-0">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployerNotifications;
