import React, { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';

export interface AdminNotificationsBroadcastPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminNotificationsBroadcastPage: React.FC<AdminNotificationsBroadcastPageProps> = ({
  onNavigate,
}) => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'candidates' | 'employers' | 'creators'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [category, setCategory] = useState<'system' | 'announcement'>('announcement');

  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const audienceOptions = [
    { id: 'all', label: 'All Users', desc: 'Broadcast to all active candidates, employers, and creators' },
    { id: 'candidates', label: 'Candidates Only', desc: 'Broadcast to active job seekers and candidates' },
    { id: 'employers', label: 'Employers Only', desc: 'Broadcast to active talent acquisition leads and hiring teams' },
    { id: 'creators', label: 'Creators Only', desc: 'Broadcast to active content, knowledge, and template creators' },
  ];

  const handleBroadcast = async () => {
    if (!title.trim()) {
      setResultMessage({ type: 'error', text: 'Please provide an announcement title.' });
      return;
    }
    if (!message.trim()) {
      setResultMessage({ type: 'error', text: 'Please provide an announcement message.' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setResultMessage({ type: 'error', text: 'Administrative authentication token missing. Please re-login.' });
        setLoading(false);
        setShowConfirmModal(false);
        return;
      }

      const response = await fetch('/api/admin-broadcast-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          target_audience: targetAudience,
          action_url: actionUrl.trim() || undefined,
          category,
        }),
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        setResultMessage({
          type: 'error',
          text: resJson.error || 'Failed to broadcast notification.',
        });
      } else {
        setResultMessage({
          type: 'success',
          text: resJson.message || `Successfully sent broadcast to ${resJson.count || 0} user(s).`,
        });
        setTitle('');
        setMessage('');
        setActionUrl('');
        setShowConfirmModal(false);

        // Notify local app so admin's own bell updates if included
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kth_notifications_changed'));
        }
      }
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err?.message || 'A network error occurred while broadcasting.',
      });
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <AdminShell currentPath="/admin/notifications" onNavigate={onNavigate} title="Broadcast Announcements">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-kth-emerald-800 to-kth-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Platform Broadcast Centre
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Push Live Announcements to Users
          </h2>
          <p className="text-kth-slate-300 text-sm mt-1 max-w-2xl">
            Deliver immediate in-app notifications and real-time updates directly into the notification bells of candidates, employers, and creators across KnowToHire.
          </p>
        </div>

        {/* Status Alert */}
        {resultMessage && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 border ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-medium">{resultMessage.text}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-sm">
            {/* Target Audience Selector */}
            <div>
              <label className="block text-sm font-semibold text-kth-slate-900 mb-2">
                1. Select Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audienceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTargetAudience(opt.id as any)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      targetAudience === opt.id
                        ? 'border-kth-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-kth-slate-200 hover:border-kth-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-kth-slate-900">{opt.label}</span>
                      <input
                        type="radio"
                        checked={targetAudience === opt.id}
                        onChange={() => {}}
                        className="text-kth-emerald-600 focus:ring-kth-emerald-500"
                      />
                    </div>
                    <p className="text-xs text-kth-slate-500 line-clamp-2">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-kth-slate-900 mb-1">
                  2. Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Scheduled Maintenance / Platform Feature Update"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border border-kth-slate-300 focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 text-sm"
                />
                <div className="text-right text-xs text-kth-slate-400 mt-1">{title.length} / 200</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-kth-slate-900 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-kth-slate-300 focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 text-sm bg-white"
                >
                  <option value="announcement">Announcement</option>
                  <option value="system">System Notice</option>
                </select>
              </div>
            </div>

            {/* Notification Message */}
            <div>
              <label className="block text-sm font-semibold text-kth-slate-900 mb-1">
                3. Announcement Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write the full message that users will read in their notification feed..."
                maxLength={2000}
                className="w-full px-4 py-2.5 rounded-xl border border-kth-slate-300 focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 text-sm"
              />
              <div className="text-right text-xs text-kth-slate-400 mt-1">{message.length} / 2000</div>
            </div>

            {/* Action Link (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-kth-slate-900 mb-1">
                4. Action Link / URL <span className="text-xs text-kth-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g., /jobs, /blog/sustainability-updates, or https://..."
                maxLength={255}
                className="w-full px-4 py-2.5 rounded-xl border border-kth-slate-300 focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 text-sm"
              />
            </div>

            {/* Submit Trigger */}
            <div className="pt-2">
              <button
                type="button"
                disabled={loading || !title.trim() || !message.trim()}
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-kth-emerald-700 hover:bg-kth-emerald-800 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Review & Broadcast to {audienceOptions.find((a) => a.id === targetAudience)?.label}
              </button>
            </div>
          </div>

          {/* Live Preview Card (1 col) */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-kth-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-kth-slate-700 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Live Notification Preview
              </div>
              <p className="text-xs text-kth-slate-500">
                This is how the announcement will appear inside a user's notification feed:
              </p>

              {/* Mock Notification Item */}
              <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-kth-slate-900 truncate">
                        {title.trim() || 'Announcement Title'}
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold shrink-0">Just now</span>
                    </div>
                    <p className="text-xs text-kth-slate-600 mt-1 line-clamp-3">
                      {message.trim() || 'Your message preview will appear here in real-time as you type...'}
                    </p>
                    {actionUrl.trim() && (
                      <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>{actionUrl.trim()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-4 rounded-xl bg-kth-slate-100 border border-kth-slate-200 text-xs text-kth-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-kth-slate-500 shrink-0 mt-0.5" />
              <span>
                Broadcast notifications are created with service-role authority and published instantly via Supabase Realtime to all connected users.
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-kth-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-kth-slate-900">Confirm Broadcast</h3>
                  <p className="text-xs text-kth-slate-500">
                    Target: <span className="font-semibold text-kth-slate-800">{audienceOptions.find((a) => a.id === targetAudience)?.label}</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-kth-slate-50 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-kth-slate-800">{title}</div>
                <div className="text-kth-slate-600 line-clamp-3">{message}</div>
              </div>

              <p className="text-xs text-kth-slate-500">
                Are you sure you want to broadcast this announcement to all matching active accounts?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-kth-slate-200 text-xs font-semibold text-kth-slate-700 hover:bg-kth-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleBroadcast}
                  className="px-4 py-2 rounded-xl bg-kth-emerald-700 hover:bg-kth-emerald-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {loading ? 'Broadcasting...' : 'Confirm & Broadcast'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};
