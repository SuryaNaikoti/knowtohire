import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  ChevronUp,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { StaggerGrid, StaggerItem } from '../../../components/ui/Motion';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const adminId = profile?.id || 'admin-guest';
  const userName = profile?.first_name || 'Rajeev';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [isBroadcastCollapsed, setIsBroadcastCollapsed] = useState(false);

  // Broadcast Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('system');
  const [targetAudience, setTargetAudience] = useState<BroadcastTargetAudience>('all');
  const [deliveryMode, setDeliveryMode] = useState<BroadcastDeliveryMode>('both');
  const [sending, setSending] = useState(false);
  const [lastReport, setLastReport] = useState<BroadcastDeliveryReport | null>(null);
  const [broadcastSuccessAlert, setBroadcastSuccessAlert] = useState('');

  const estimatedReach = useMemo(() => {
    return adminBroadcastService.estimateAudienceReach(targetAudience);
  }, [targetAudience]);

  const fetchAdminData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [kpiData, auditLogs] = await Promise.all([
        dashboardService.getAdminKPIs(),
        auditService.getAuditLogs(),
      ]);

      setKpis(kpiData);
      setAudits(auditLogs || []);
      setLastRefreshedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('[AdminDashboard fetch error]', err);
      setError('Unable to load executive metrics. Please check network connectivity and retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

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
      setBroadcastSuccessAlert(`Broadcast dispatched successfully to approx ${report.totalRecipients || 1782} users.`);
      
      // Prepend to audits list locally for real-time feedback
      const newAuditItem: any = {
        id: `aud-live-${Date.now()}`,
        created_at: new Date().toISOString(),
        action: 'SYSTEM_BROADCAST',
        user_email: profile?.email || 'admin@knowtohire.com',
        details: { title, targetAudience, deliveryMode }
      };
      setAudits(prev => [newAuditItem, ...prev]);

      setTitle('');
      setBody('');
      setTimeout(() => setBroadcastSuccessAlert(''), 5000);
    } catch (err) {
      console.error('Failed to dispatch broadcast:', err);
    } finally {
      setSending(false);
    }
  };

  const displayedAudits = useMemo(() => {
    return showAllActivity ? audits.slice(0, 10) : audits.slice(0, 5);
  }, [audits, showAllActivity]);

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-14 bg-slate-200/80 rounded-2xl w-full"></div>
        <div className="h-44 bg-slate-200/80 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200/80 rounded-2xl"></div>
      </div>
    );
  }

  // Error State View
  if (error && !kpis) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto font-black">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">Executive Telemetry Unavailable</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">{error}</p>
        </div>
        <Button onClick={() => fetchAdminData()} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry Fetch
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 text-slate-900 scroll-smooth">
      
      {/* SECTION 1: EXECUTIVE COMMAND BAR HEADER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Admin Portal</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-emerald-600">Executive Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            Good morning, {userName} <span className="inline-block animate-bounce">🖐️</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Here is your daily administrative command center and urgent operational triage.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : lastRefreshedAt ? `Updated ${lastRefreshedAt}` : 'Sync Telemetry'}</span>
          </button>

          <Button
            onClick={() => navigate('/dashboard/admin/employers')}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs"
          >
            <Building className="w-3.5 h-3.5 mr-1" /> Verify Employers
          </Button>

          <Button
            onClick={() => navigate('/dashboard/admin/moderation')}
            size="sm"
            variant="outline"
            className="text-xs font-bold rounded-xl border-slate-300 bg-white"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-500" /> Moderate Jobs
          </Button>
        </div>
      </div>

      {/* SECTION 2: NEEDS ATTENTION (PRIORITY TRIAGE - TOP VISUAL FOCUS) */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
              Needs Attention (Priority Triage)
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Critical items requiring immediate administrator decision.</p>
          </div>
          <Link to="/dashboard/admin/employers" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3.5 py-1.5 rounded-lg transition-colors">
            Manage Queues →
          </Link>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Item 1 */}
          <div
            onClick={() => navigate('/dashboard/admin/employers')}
            className="p-4 bg-rose-50/60 hover:bg-rose-50 rounded-2xl border border-rose-100/90 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <Building className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Employer Approvals
                  <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md uppercase">Critical</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">2 tax & GST dossiers</p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
          </div>

          {/* Item 2 */}
          <div
            onClick={() => navigate('/dashboard/admin/moderation')}
            className="p-4 bg-amber-50/60 hover:bg-amber-50 rounded-2xl border border-amber-100/90 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Job Moderation
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md uppercase">High</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">1 safety clearance</p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
          </div>

          {/* Item 3 */}
          <div
            onClick={() => navigate('/dashboard/admin/moderation')}
            className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Flagged Reports
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded-md uppercase">Medium</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">0 user violations</p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">0</span>
          </div>

          {/* Item 4 */}
          <div
            onClick={() => navigate('/dashboard/admin/broadcasts')}
            className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <Radio className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Failed Deliveries
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded-md uppercase">Low</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">0 dispatch bounces</p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">0</span>
          </div>
        </div>
      </Card>

      {/* SECTION 3: EXECUTIVE KPI GRID */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <StaggerItem>
          <div
            onClick={() => navigate('/dashboard/admin/employers')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-rose-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Pending Approvals</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis?.pendingCompanyApprovalsCount || 2}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Tax Review Queue</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600">
              <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Action Required</span>
              <span className="text-slate-400 hover:text-slate-600">Inspect →</span>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 2 */}
        <StaggerItem>
          <div
            onClick={() => navigate('/dashboard/admin/moderation')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-amber-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Job Moderation</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis?.pendingModerationCount || 1}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Safety Clearance Queue</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-600">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending Queue</span>
              <span className="text-slate-400 hover:text-slate-600">Review →</span>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 3 */}
        <StaggerItem>
          <div
            onClick={() => navigate('/dashboard/admin/candidates')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-emerald-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Candidates</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis?.totalCandidatesCount || 11}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Verified Talent Base</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> ↑ 3 this week</span>
              <span className="text-slate-400 hover:text-slate-600">Directory →</span>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 4 */}
        <StaggerItem>
          <div
            onClick={() => navigate('/dashboard/admin/employers')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-blue-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Verified Corporate</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{kpis?.totalCompaniesCount || 3}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Active Client Companies</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> ↑ 1 this week</span>
              <span className="text-slate-400 hover:text-slate-600">Workspace →</span>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 5 */}
        <StaggerItem>
          <div
            onClick={() => navigate('/dashboard/admin/applications')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-purple-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Job Applications</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">11</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Hiring Funnel Submissions</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> ↑ 22% velocity</span>
              <span className="text-slate-400 hover:text-slate-600">Pipeline →</span>
            </div>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* SECTION 4: RECENT PLATFORM ACTIVITY (DISTINGUISHABLE EVENTS) */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-slate-600" />
              Recent Platform Activity & System Events
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time traceable audit feed across applications, vacancies, and registrations.</p>
          </div>
          <Link to="/dashboard/admin/audit-logs" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3.5 py-1.5 rounded-lg transition-colors">
            Audit Logs Registry →
          </Link>
        </div>

        {displayedAudits.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400">
            <Activity className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">No recent system activity records logged.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAudits.map((item: any, idx: number) => {
              const actionStr = (item.action || '').toUpperCase();
              let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
              let iconNode = <Activity className="w-4 h-4 text-slate-600" />;

              if (actionStr.includes('BROADCAST')) {
                badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
                iconNode = <Radio className="w-4 h-4 text-rose-600" />;
              } else if (actionStr.includes('EMPLOYER') || actionStr.includes('COMPANY')) {
                badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
                iconNode = <Building className="w-4 h-4 text-blue-600" />;
              } else if (actionStr.includes('JOB') || actionStr.includes('VACANCY')) {
                badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                iconNode = <Briefcase className="w-4 h-4 text-amber-600" />;
              } else if (actionStr.includes('APPLICATION') || actionStr.includes('CANDIDATE')) {
                badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                iconNode = <Users className="w-4 h-4 text-emerald-600" />;
              }

              return (
                <div key={item.id || idx} className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/60 rounded-2xl border border-slate-100 text-xs transition-colors">
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-slate-400 text-[11px] w-20 shrink-0">
                      {new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {iconNode}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.action ? item.action.replace(/_/g, ' ') : 'Platform Log Event'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Actor: {item.user_email || 'admin@knowtohire.com'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeBg}`}>
                    {item.action ? item.action.split('_')[0] : 'Event'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {audits.length > 5 && (
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={() => setShowAllActivity(prev => !prev)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {showAllActivity ? (
                <>Collapse Feed <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>Expand Activity Feed ({audits.length - 5} more items) <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        )}
      </Card>

      {/* SECTION 5: STREAMLINED BROADCAST COMMUNICATION CONSOLE (LIGHTER WORKSPACE) */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 font-heading">Broadcast Communication Workspace</h2>
              <p className="text-xs text-slate-400 font-medium">Dispatch targeted system notices, job market updates, or security alerts.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              Recipient Reach: ~{estimatedReach.toLocaleString()}
            </span>
            <button
              onClick={() => setIsBroadcastCollapsed(prev => !prev)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isBroadcastCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {broadcastSuccessAlert && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {broadcastSuccessAlert}
          </div>
        )}

        {!isBroadcastCollapsed && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Announcement Headline *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Infrastructure Maintenance & System Upgrades"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <Select
                label="Message Category"
                value={category}
                onChange={(val) => setCategory(val as NotificationCategory)}
                options={[
                  { value: 'system', label: '📢 System Announcement' },
                  { value: 'security', label: '🛡️ Security Alert' },
                  { value: 'job_alert', label: '💼 Job Market Update' },
                  { value: 'marketplace', label: '📦 Marketplace Release' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Audience Segment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['all', 'candidates', 'employers', 'admins'] as const).map((aud) => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => setTargetAudience(aud)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        targetAudience === aud
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
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
                <div className="grid grid-cols-3 gap-1.5">
                  {(['in_app', 'email', 'both'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDeliveryMode(mode)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        deliveryMode === mode
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message Content Body *
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter complete broadcast message details..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
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
                onClick={handleExecuteBroadcast}
                disabled={!title || !body || sending}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Dispatching Notice...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
};

export default AdminDashboard;
