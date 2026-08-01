import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { notificationService } from '../../../lib/services/notificationService';
import {
  preferenceEvaluator,
  useNotifications,
} from '../../../lib/services/notifications';
import type {
  NotificationCategory,
  UserNotificationPreferences,
  NotificationPayload,
} from '../../../lib/services/notifications/types';
import {
  Settings,
  Bell,
  Search,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES: { id: NotificationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Updates' },
  { id: 'application_update', label: 'Applications' },
  { id: 'job_alert', label: 'Job Alerts' },
  { id: 'payment', label: 'Payments' },
  { id: 'system', label: 'System' },
  { id: 'security', label: 'Security' },
  { id: 'marketplace', label: 'Marketplace' },
];

export const NotificationCenter: React.FC = () => {
  const { profile } = useAuth();
  const userId = profile?.id;

  const { setUnreadCount } = useNotifications(userId);

  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [prefs, setPrefs] = useState<UserNotificationPreferences>(
    preferenceEvaluator.getUserPreferences(userId || 'guest')
  );
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await notificationService.getNotifications(userId);
      setNotifications(
        list.map((item) => ({
          id: item.id,
          recipientId: item.recipientId,
          category: item.eventType as NotificationCategory,
          title: item.title,
          body: item.body,
          status: 'delivered',
          isRead: item.isRead,
          created_at: item.created_at,
        }))
      );
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    if (userId) {
      setPrefs(preferenceEvaluator.getUserPreferences(userId));
    }
  }, [userId]);

  // Memoized Filter Pipeline
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // 2. Read / Unread Filter
      if (readFilter === 'unread' && item.isRead) return false;
      if (readFilter === 'read' && !item.isRead) return false;
      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const bodyMatch = item.body.toLowerCase().includes(query);
        if (!titleMatch && !bodyMatch) return false;
      }
      return true;
    });
  }, [notifications, selectedCategory, readFilter, searchQuery]);

  // Stats Summary
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;
    return { total, unread, read };
  }, [notifications]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.size === 0) return;
    for (const id of selectedIds) {
      await notificationService.markAsRead(id);
    }
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - selectedIds.size));
    setSelectedIds(new Set());
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  const handlePreferenceToggle = (
    category: NotificationCategory,
    channel: 'in_app_enabled' | 'email_enabled' | 'push_enabled',
    value: boolean
  ) => {
    if (!userId) return;
    setSavingPrefs(true);
    const updatedPrefs = {
      ...prefs,
      [category]: {
        ...prefs[category],
        [channel]: value,
      },
    };
    setPrefs(updatedPrefs);
    preferenceEvaluator.setUserPreferences(userId, updatedPrefs);
    setTimeout(() => setSavingPrefs(false), 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header & Stats Banner */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                Notification Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor real-time activity and manage multi-channel delivery preferences.
              </p>
            </div>
            {/* Quick Stats Summary */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <div className="text-center px-3 py-1">
                <span className="block font-bold text-slate-800">{stats.total}</span>
                <span className="text-slate-400">Total</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center px-3 py-1">
                <span className="block font-bold text-emerald-600">{stats.unread}</span>
                <span className="text-slate-400">Unread</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center px-3 py-1">
                <span className="block font-bold text-slate-600">{stats.read}</span>
                <span className="text-slate-400">Read</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-2 mt-6 border-t border-slate-100 pt-4">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Alerts ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'preferences'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Channel Preference Matrix
            </button>
          </div>
        </div>

        {/* Tab 1: Notifications List & Filter Pipeline */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {/* Control Bar: Search, Category Pills & Bulk Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedIds.size > 0 && (
                    <>
                      <button
                        onClick={handleMarkSelectedRead}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Read ({selectedIds.size})
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete ({selectedIds.size})
                      </button>
                    </>
                  )}
                  {stats.unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 flex items-center gap-1 transition-colors"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills & Read Status Pills */}
              <div className="flex items-center justify-between gap-1.5 overflow-x-auto pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200">
                  {(['all', 'unread', 'read'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setReadFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                        readFilter === filter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
                  Syncing notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No notifications match the selected criteria.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Select All Checkbox header */}
                  <div className="pb-3 flex items-center gap-3 border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={
                        filteredNotifications.length > 0 &&
                        selectedIds.size === filteredNotifications.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-500">Select All</span>
                  </div>

                  {filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 py-4 ${
                        !item.isRead ? 'bg-emerald-50/30 rounded-xl p-3 -mx-2 my-1' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded text-emerald-600 mt-1 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-800">{item.title}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md capitalize font-medium">
                            {item.category.replace('_', ' ')}
                          </span>
                          {!item.isRead && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                        <span className="text-xs text-slate-400 block mt-2">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Per-Channel Preferences Matrix */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-600" />
                  Per-Channel Preference Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure delivery rules across In-App, Email, and Push channels for each notification category.
                </p>
              </div>
              {savingPrefs && (
                <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                  Saving preferences...
                </span>
              )}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold text-center">In-App</th>
                    <th className="p-4 font-bold text-center">Email</th>
                    <th className="p-4 font-bold text-center">Push (Future)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(prefs).map((catKey) => {
                    const category = catKey as NotificationCategory;
                    const catPref = prefs[category];
                    return (
                      <tr key={category} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800 capitalize">
                          {category.replace('_', ' ')}
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={catPref.in_app_enabled}
                            onChange={(e) =>
                              handlePreferenceToggle(category, 'in_app_enabled', e.target.checked)
                            }
                            className="rounded text-emerald-600 cursor-pointer h-4 w-4"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={catPref.email_enabled}
                            onChange={(e) =>
                              handlePreferenceToggle(category, 'email_enabled', e.target.checked)
                            }
                            className="rounded text-emerald-600 cursor-pointer h-4 w-4"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={catPref.push_enabled}
                            onChange={(e) =>
                              handlePreferenceToggle(category, 'push_enabled', e.target.checked)
                            }
                            className="rounded text-emerald-600 cursor-pointer h-4 w-4"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

