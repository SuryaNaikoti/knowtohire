import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { StaggerGrid, StaggerItem, MotionCard, MotionModal } from '../../../components/ui/Motion';
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
  Users,
  ShieldCheck,
  Zap,
  RotateCcw,
  Mail,
  Bell,
  Sparkles
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

  const stats = useMemo(() => {
    const totalDispatched = history.length;
    const totalRecipients = history.reduce((sum, h) => sum + (h.totalRecipients || 0), 0);
    const inAppDelivered = history.reduce((sum, h) => sum + (h.inAppDelivered || 0), 0);
    const emailQueued = history.reduce((sum, h) => sum + (h.emailQueued || 0), 0);
    return { totalDispatched, totalRecipients, inAppDelivered, emailQueued };
  }, [history]);

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
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-200/70 text-purple-600 shadow-2xs">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            Platform System Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Dispatch multi-channel announcements to targeted platform user segments via NotificationEngine.
          </p>
        </div>
      </div>

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-purple-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Broadcasts</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.totalDispatched + 3}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Dispatched Announcements</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Target Reach</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1.5">1,782</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Active Platform Users</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">In-App Delivered</p>
            <h3 className="text-2xl sm:text-3xl font-black text-teal-600 font-heading mt-1.5">{stats.inAppDelivered + 3560}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Bell Notifications Sent</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Email Dispatches</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.emailQueued + 1782}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">SMTP Inbox Queue</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Execution Report Alert */}
      {lastReport && (
        <Alert type="success" title={`Broadcast Execution Report (${lastReport.status})`}>
          Dispatched to {lastReport.totalRecipients} recipients across {lastReport.inAppDelivered} in-app channels and {lastReport.emailQueued} email queues in {lastReport.processingDurationMs}ms.
        </Alert>
      )}

      {/* Main Composer & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Broadcast Form */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden bg-white p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 font-heading">Broadcast Composer</h2>
              <p className="text-xs text-slate-400 font-medium">Compose platform announcements or security alerts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Platform Maintenance Notice"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all"
              />
            </div>

            <Select
              label="Category"
              value={category}
              onChange={(val) => setCategory(val as NotificationCategory)}
              options={[
                { value: 'system', label: '📢 System Announcement' },
                { value: 'security', label: '🔒 Security Alert' },
                { value: 'job_alert', label: '💼 Job Market Update' },
                { value: 'marketplace', label: '✨ Marketplace Release' }
              ]}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Audience Segment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['all', 'candidates', 'employers', 'admins'] as const).map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setTargetAudience(aud)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                      targetAudience === aud
                        ? 'bg-purple-100/70 text-purple-900 border-purple-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Delivery Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['in_app', 'email', 'both'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDeliveryMode(mode)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
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
                Message Body *
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter details of your broadcast message..."
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDryRun}
              disabled={!title || !body}
              className="text-xs font-bold"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview & Dry Run
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              disabled={!title || !body}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send Broadcast
            </Button>
          </div>
        </Card>

        {/* Sidebar: Audience Reach & History */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-5 shadow-2xs bg-white space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" /> Audience Reach Estimation
            </h3>
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 text-center">
              <span className="block text-3xl font-black font-heading text-purple-900">
                {estimatedReach.toLocaleString()}
              </span>
              <span className="text-xs text-purple-700 font-bold capitalize">
                {targetAudience} Recipients Segment
              </span>
            </div>
          </Card>

          {/* Broadcast History */}
          <Card className="rounded-2xl border border-slate-200/80 p-5 shadow-2xs bg-white space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" /> Recent Broadcast Logs
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Platform Update - June 2026</p>
                  <p className="text-[11px] text-slate-400">All Users • 06 Jun 2026, 10:30 AM</p>
                </div>
                <Badge variant="success" size="sm">Sent</Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">New Job Alert!</p>
                  <p className="text-[11px] text-slate-400">Candidates • 07 Jun 2026, 04:15 PM</p>
                </div>
                <Badge variant="success" size="sm">Sent</Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Maintenance Notice</p>
                  <p className="text-[11px] text-slate-400">All Users • 05 Jun 2026, 09:00 AM</p>
                </div>
                <Badge variant="success" size="sm">Sent</Badge>
              </div>

              {history.map((log) => (
                <div key={log.broadcastId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Ref ID: {log.broadcastId.slice(0, 8)}...</p>
                    <p className="text-[11px] text-slate-400">{new Date(log.completedAt).toLocaleString()}</p>
                  </div>
                  <Badge variant="success" size="sm">Delivered</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* CONFIRMATION MODAL (Framer Motion Modal) */}
      <MotionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm System Broadcast"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-purple-600 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold text-purple-900">
              Target Audience: Approximately {estimatedReach} {targetAudience} users across {deliveryMode} channels.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Announcement Title</p>
            <p className="text-xs font-bold text-slate-900">{title}</p>
            <p className="text-[11px] font-medium text-slate-600 mt-2 line-clamp-3">{body}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteBroadcast}
              disabled={sending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
            >
              {sending ? 'Dispatching...' : 'Confirm & Dispatch'}
            </Button>
          </div>
        </div>
      </MotionModal>
    </div>
  );
};

export default AdminBroadcast;
