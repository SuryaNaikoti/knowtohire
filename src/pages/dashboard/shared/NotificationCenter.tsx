import React, { useState, useEffect } from 'react';
import { notificationsService } from '../../../lib/services/notificationsService';
import type { Notification, NotificationPreference } from '../../../lib/services/notificationsService';
import { Check, Settings, Bell, Mail, Clock } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'preferences'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, p] = await Promise.all([
        notificationsService.getNotifications(50),
        notificationsService.getPreferences(),
      ]);
      setNotifications(list);
      setPrefs(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePref = async (key: keyof Omit<NotificationPreference, 'user_id' | 'updated_at'>, val: any) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: val };
    setPrefs(newPrefs);
    setSavingPrefs(true);
    try {
      await notificationsService.updatePreferences({ [key]: val });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600 animate-swing" />
            Notification Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure preferences and monitor alerts.</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'preferences'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
            Syncing notification history...
          </div>
        )}

        {/* Tab 1: All Notifications */}
        {!loading && activeTab === 'all' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            {notifications.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm">No notification updates yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 py-4 first:pt-0 last:pb-0 ${
                      !item.is_read ? 'bg-emerald-50/20 rounded-lg p-2' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-800">{item.title}</span>
                        {!item.is_read && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{item.message}</p>
                      <span className="text-xs text-slate-400 block mt-2">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    {!item.is_read && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Preferences */}
        {!loading && activeTab === 'preferences' && prefs && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Delivery Channels
            </h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.in_app_enabled}
                  onChange={(e) => handleTogglePref('in_app_enabled', e.target.checked)}
                  className="rounded text-emerald-600 mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    In-app alerts
                  </p>
                  <p className="text-xs text-slate-500">Show red notification dot count badges and tray logs in site headers.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.email_enabled}
                  onChange={(e) => handleTogglePref('email_enabled', e.target.checked)}
                  className="rounded text-emerald-600 mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email alerts
                  </p>
                  <p className="text-xs text-slate-500">Send transactional email details immediately upon important updates.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.digest_enabled}
                  onChange={(e) => handleTogglePref('digest_enabled', e.target.checked)}
                  className="rounded text-emerald-600 mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Digest summaries
                  </p>
                  <p className="text-xs text-slate-500">Opt-in to structured summary updates compiled at specific times.</p>
                </div>
              </label>
            </div>

            {prefs.digest_enabled && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Digest Frequency</h3>
                <div className="flex gap-2">
                  {(['daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleTogglePref('digest_frequency', freq)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        prefs.digest_frequency === freq
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {savingPrefs && (
              <span className="text-xs text-slate-400 block mt-2 animate-pulse">Saving changes...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
