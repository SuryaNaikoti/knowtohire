import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dashboardService } from '../../../lib/services/dashboardService';
import type { AdminKPIs } from '../../../lib/services/dashboardService';
import { auditService } from '../../../lib/services/auditService';
import type { AuditLog } from '../../../lib/services/auditService';
import { adminBroadcastService } from '../../../lib/services/notifications';
import type {
  NotificationCategory,
  BroadcastTargetAudience,
  BroadcastDeliveryMode,
  BroadcastDeliveryReport
} from '../../../lib/services/notifications/types';
import {
  Users,
  Briefcase,
  Building,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  UserPlus,
  SendHorizontal,
  ChevronDown,
  Sparkles,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const adminId = profile?.id || 'admin-guest';
  const userName = profile?.first_name || 'Rajeev';

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);

  // Broadcast Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('system');
  const [targetAudience, setTargetAudience] = useState<BroadcastTargetAudience>('all');
  const [deliveryMode, setDeliveryMode] = useState<BroadcastDeliveryMode>('both');
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastReport, setLastReport] = useState<BroadcastDeliveryReport | null>(null);

  const estimatedReach = adminBroadcastService.estimateAudienceReach(targetAudience);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [kpiData, auditLogs] = await Promise.all([
          dashboardService.getAdminKPIs(),
          auditService.getAuditLogs(),
        ]);
        setKpis(kpiData);
        setAudits(auditLogs);
      } catch (err) {
        console.error('[AdminDashboard fetch error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

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
      setShowConfirmModal(false);
      setTitle('');
      setBody('');
    } catch (err) {
      console.error('Failed to dispatch broadcast:', err);
    } finally {
      setSending(false);
    }
  };

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  if (loading || !kpis) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 text-slate-900 scroll-smooth">
      
      {/* 1. EXECUTIVE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            Good morning, {userName} <span className="inline-block animate-bounce">🖐️</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS (5 CARDS IN 1 ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Users */}
        <Link to="/dashboard/admin/users" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-emerald-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Users</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis.totalUsersCount || 17}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Registered Accounts</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 3 this week</span>
          </div>
        </Link>

        {/* Card 2: Active Jobs */}
        <Link to="/dashboard/admin/moderation" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-blue-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Active Jobs</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis.totalJobsCount || 6}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Live Job Listings</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 1 this week</span>
          </div>
        </Link>

        {/* Card 3: Verified Employers */}
        <Link to="/dashboard/admin/employers" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-purple-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Verified Employers</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis.totalCompaniesCount || 3}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Active Companies</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 1 this week</span>
          </div>
        </Link>

        {/* Card 4: Pending Moderation */}
        <Link to="/dashboard/admin/moderation" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-amber-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Pending Moderation</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis.pendingModerationCount || 1}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Items Awaiting Review</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>↓ 0 this week</span>
          </div>
        </Link>

        {/* Card 5: Broadcasts Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-rose-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Broadcasts Today</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">2</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Messages Sent</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 2 today</span>
          </div>
        </div>
      </div>

      {/* 3. NEEDS ATTENTION + PLATFORM ACTIVITY (TODAY) GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Needs Attention Panel */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Needs Attention
            </h3>
            <Link to="/dashboard/admin/moderation" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {/* Item 1 */}
            <div
              onClick={() => navigate('/dashboard/admin/employers')}
              className="p-3.5 bg-slate-50/80 hover:bg-slate-100/70 rounded-xl border border-slate-100 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Employer approvals pending</p>
                  <p className="text-[11px] text-slate-400 font-medium">New companies awaiting verification</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-extrabold">2</span>
            </div>

            {/* Item 2 */}
            <div
              onClick={() => navigate('/dashboard/admin/moderation')}
              className="p-3.5 bg-slate-50/80 hover:bg-slate-100/70 rounded-xl border border-slate-100 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Jobs awaiting moderation</p>
                  <p className="text-[11px] text-slate-400 font-medium">New jobs require review</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-extrabold">1</span>
            </div>

            {/* Item 3 */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Reported content</p>
                  <p className="text-[11px] text-slate-400 font-medium">Items flagged by users</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-extrabold">0</span>
            </div>

            {/* Item 4 */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Failed broadcasts</p>
                  <p className="text-[11px] text-slate-400 font-medium">Messages that couldn't be delivered</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-extrabold">0</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Platform Activity (Today) */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Platform Activity (Today)
            </h3>
            <Link to="/dashboard/admin/users" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
              View Analytics
            </Link>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            {/* Metric 1 */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">New Users</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">4</h4>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ↑ 33% vs yesterday
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">New Employers</span>
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Building className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">1</h4>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ↑ 100% vs yesterday
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">New Jobs</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">3</h4>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ↑ 50% vs yesterday
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Applications</span>
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">11</h4>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ↑ 22% vs yesterday
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. BROADCAST CENTER + AUDIENCE REACH & RECENT BROADCASTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Center Form (2 Columns) */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-purple-600">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Broadcast Center</h3>
              <p className="text-xs text-slate-400 font-medium">Send platform-wide or targeted announcements to your audience.</p>
            </div>
          </div>

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
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
              >
                <option value="system">System Announcement</option>
                <option value="security">Security Alert</option>
                <option value="job_alert">Job Market Update</option>
                <option value="marketplace">Marketplace Release</option>
              </select>
            </div>

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
                        ? 'bg-purple-100/70 text-purple-800 border-purple-300 shadow-2xs'
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
                Message Body
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter details of your broadcast message..."
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDryRun}
              disabled={!title || !body}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview & Dry Run
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={!title || !body}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send Broadcast
            </button>
          </div>
        </Card>

        {/* Right Sidebar: Audience Reach & Recent Broadcasts */}
        <div className="space-y-6">
          {/* Audience Reach Card */}
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" /> Audience Reach
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="block text-3xl font-black font-heading text-slate-900">
                1,782
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Total Recipients
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="font-black text-emerald-900 block">1,102</span>
                <span className="text-[10px] font-bold text-emerald-700">Candidates</span>
              </div>
              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                <span className="font-black text-blue-900 block">512</span>
                <span className="text-[10px] font-bold text-blue-700">Employers</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-100">
                <span className="font-black text-purple-900 block">168</span>
                <span className="text-[10px] font-bold text-purple-700">Admins</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              <Clock className="w-3 h-3" /> Last updated: Today, 9:30 AM
            </p>
          </Card>

          {/* Recent Broadcasts Card */}
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-600" /> Recent Broadcasts
              </h3>
              <span className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer">View All</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Platform Update - June 2026</p>
                  <p className="text-[11px] text-slate-400">All Users • 06 Jun 2026, 10:30 AM</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold">Sent</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">New Job Alert!</p>
                  <p className="text-[11px] text-slate-400">Candidates • 07 Jun 2026, 04:15 PM</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold">Sent</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Maintenance Notice</p>
                  <p className="text-[11px] text-slate-400">All Users • 05 Jun 2026, 09:00 AM</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold">Sent</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. PLATFORM SUMMARY CARDS (4 CARDS IN 1 ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/admin/users" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-emerald-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Candidate Registry</p>
              <h3 className="text-2xl font-black text-slate-900 font-heading mt-1">{kpis.totalUsersCount || 17}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Active Talent Base</p>
            </div>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-emerald-600 mt-3 pt-2 border-t border-slate-100">↑ 3 this week</p>
        </Link>

        <Link to="/dashboard/admin/employers" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-blue-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Employers Base</p>
              <h3 className="text-2xl font-black text-slate-900 font-heading mt-1">{kpis.totalCompaniesCount || 3}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Verified Companies</p>
            </div>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-emerald-600 mt-3 pt-2 border-t border-slate-100">↑ 1 this week</p>
        </Link>

        <Link to="/dashboard/admin/moderation" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-purple-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Moderation Queue</p>
              <h3 className="text-2xl font-black text-slate-900 font-heading mt-1">{kpis.pendingModerationCount || 1}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Items Pending Review</p>
            </div>
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-amber-600 mt-3 pt-2 border-t border-slate-100">↓ 0 this week</p>
        </Link>

        <Link to="/dashboard/admin/audit-logs" className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-rose-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">System Audits</p>
              <h3 className="text-2xl font-black text-slate-900 font-heading mt-1">{audits.length || 1}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Traceable Events</p>
            </div>
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-emerald-600 mt-3 pt-2 border-t border-slate-100">↑ 1 this week</p>
        </Link>
      </div>

      {/* 6. RECENT PLATFORM ACTIVITY TIMELINE */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Recent Platform Activity
          </h3>
          <Link to="/dashboard/admin/audit-logs" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
            View All Activity
          </Link>
        </div>

        <div className="space-y-3">
          {/* Row 1 */}
          <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">10:42 AM</span>
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <p className="font-semibold text-slate-800">
                GreenEarth Inc. posted a new job "Senior Frontend Developer"
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-extrabold">
              Job Posted
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">10:28 AM</span>
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <p className="font-semibold text-slate-800">
                Rahul Sharma applied for "Product Manager"
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-[10px] font-extrabold">
              Application
            </span>
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">10:10 AM</span>
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Building className="w-3.5 h-3.5" />
              </div>
              <p className="font-semibold text-slate-800">
                Patent Nexus registered as a new employer
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-full text-[10px] font-extrabold">
              Employer
            </span>
          </div>

          {/* Row 4 */}
          <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">09:50 AM</span>
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <p className="font-semibold text-slate-800">
                New resource uploaded: "Interview Preparation Guide"
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-[10px] font-extrabold">
              Resource
            </span>
          </div>

          {/* Row 5 */}
          <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">09:35 AM</span>
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <SendHorizontal className="w-3.5 h-3.5" />
              </div>
              <p className="font-semibold text-slate-800">
                Broadcast "New Opportunities This Week" sent to 1,782 recipients
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full text-[10px] font-extrabold">
              Broadcast
            </span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer">
            Load more <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <Radio className="w-6 h-6" />
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
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                disabled={sending}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 cursor-pointer"
              >
                {sending ? 'Dispatching...' : 'Confirm & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Report */}
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

export default AdminDashboard;
