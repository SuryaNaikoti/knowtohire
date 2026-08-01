import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  adminBroadcastService,
} from '../../../lib/services/notifications';
import type {
  NotificationCategory,
  BroadcastTargetAudience,
  BroadcastDeliveryMode,
  BroadcastDeliveryReport,
} from '../../../lib/services/notifications/types';
import {
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react';

export const AdminBroadcast: React.FC = () => {
  const { profile } = useAuth();
  const adminId = profile?.id || 'admin-guest';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('system');
  const [targetAudience, setTargetAudience] = useState<BroadcastTargetAudience>('all');
  const [deliveryMode, setDeliveryMode] = useState<BroadcastDeliveryMode>('both');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastReport, setLastReport] = useState<BroadcastDeliveryReport | null>(null);
  const [history, setHistory] = useState<BroadcastDeliveryReport[]>(
    adminBroadcastService.getBroadcastHistory()
  );

  const estimatedReach = adminBroadcastService.estimateAudienceReach(targetAudience);

  const handleDryRun = async () => {
    if (!title || !body) return;
    const report = await adminBroadcastService.sendBroadcast(adminId, {
      title,
      body,
      category,
      targetAudience,
      deliveryMode,
      dryRun: true,
    });
    setLastReport(report);
  };

  const handleExecuteBroadcast = async () => {
    if (!title || !body) return;
    setSending(true);
    try {
      const report = await adminBroadcastService.sendBroadcast(adminId, {
        title,
        body,
        category,
        targetAudience,
        deliveryMode,
        dryRun: false,
      });
      setLastReport(report);
      setHistory(adminBroadcastService.getBroadcastHistory());
      setShowConfirmModal(false);
      setTitle('');
      setBody('');
    } catch (err) {
      console.error('Failed to dispatch broadcast:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
            <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading">Platform System Broadcasts</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Dispatch multi-channel announcements to targeted platform user segments via NotificationEngine.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Broadcast Composer
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Platform Maintenance Notice"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="system">System Announcement</option>
                <option value="security">Security Alert</option>
                <option value="job_alert">Job Market Update</option>
                <option value="marketplace">Marketplace Release</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Audience Segment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['all', 'candidates', 'employers', 'admins'] as const).map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setTargetAudience(aud)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      targetAudience === aud
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['in_app', 'email', 'both'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDeliveryMode(mode)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      deliveryMode === mode
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message Body
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter details of your broadcast message..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDryRun}
              disabled={!title || !body}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview & Dry Run
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={!title || !body}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Send Broadcast
            </button>
          </div>
        </div>

        {/* Sidebar: Audience Reach & Recent Logs */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Audience Reach Estimation
            </h3>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center">
              <span className="block text-3xl font-black font-heading text-indigo-900">
                {estimatedReach.toLocaleString()}
              </span>
              <span className="text-xs text-indigo-700 font-medium capitalize">
                {targetAudience} Recipients
              </span>
            </div>
          </div>

          {/* Broadcast History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Recent Broadcast Logs
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No broadcast history recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((log) => (
                  <div key={log.broadcastId} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{log.broadcastId.slice(0, 8)}...</span>
                      <span className="text-emerald-600 font-semibold">{log.inAppDelivered} In-App</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(log.completedAt).toLocaleString()} ({log.processingDurationMs}ms)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Platform Broadcast</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to dispatch <strong>"{title}"</strong> to approximately{' '}
              <strong>{estimatedReach} {targetAudience} users</strong> across <strong>{deliveryMode}</strong> channels.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                disabled={sending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5"
              >
                {sending ? 'Dispatching...' : 'Confirm & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Delivery Report Result Card */}
      {lastReport && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Broadcast Execution Report (Status: {lastReport.status})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-semibold">
            <div>Total: {lastReport.totalRecipients}</div>
            <div>In-App: {lastReport.inAppDelivered}</div>
            <div>Email Queued: {lastReport.emailQueued}</div>
            <div>Duration: {lastReport.processingDurationMs}ms</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBroadcast;
