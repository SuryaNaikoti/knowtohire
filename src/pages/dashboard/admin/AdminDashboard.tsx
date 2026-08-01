import React, { useEffect, useState } from 'react';
import { Users, Activity, ShieldAlert, Sparkles, Building } from 'lucide-react';
import { dashboardService } from '../../../lib/services/dashboardService';
import type { AdminKPIs } from '../../../lib/services/dashboardService';
import { auditService } from '../../../lib/services/auditService';
import type { AuditLog } from '../../../lib/services/auditService';
import { Loading } from '../../../components/ui/Loading';
import { AdminBroadcast } from './AdminBroadcast';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);

  const fetchAdminData = async () => {
    try {
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

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading || !kpis) {
    return <Loading label="Initializing Platform Governance Center..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen p-2 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors animate-fade-in">
      
      {/* 1. EXECUTIVE ADMIN HERO COMMAND CENTER */}
      <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Platform Governance Control
              </h1>
              <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-solid border-purple-200 dark:border-purple-800">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              System health monitoring, audit trail logs, tenant moderation, and broadcast management.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/dashboard/admin/ai">
              <button className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Engine Control
              </button>
            </Link>
            <Link to="/dashboard/admin/users">
              <button className="bg-white dark:bg-slate-800 border border-solid border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                <Users className="w-4 h-4" /> User Management
              </button>
            </Link>
          </div>
        </div>

        {/* Executive Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-solid border-slate-100 dark:border-slate-800">
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Platform Users</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">{kpis.totalUsersCount} Accounts</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Active Jobs</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{kpis.totalJobsCount} Listings</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Employers</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">{kpis.totalCompaniesCount} Companies</span>
          </div>
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Audit Logs</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">{audits.length} Records</span>
          </div>
        </div>
      </div>

      {/* 2. ADMIN BROADCAST CONTROLLER */}
      <AdminBroadcast />

      {/* 3. TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/dashboard/admin/users" className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Registry</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{kpis.totalUsersCount}</div>
          <span className="text-[9px] font-bold text-emerald-600">Active Talent Base</span>
        </Link>

        <Link to="/dashboard/admin/employers" className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employers Base</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{kpis.totalCompaniesCount}</div>
          <span className="text-[9px] font-bold text-blue-600">Verified Companies</span>
        </Link>

        <Link to="/dashboard/admin/moderation" className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moderation Queue</span>
            <ShieldAlert className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{kpis.pendingModerationCount} Pending</div>
          <span className="text-[9px] font-bold text-purple-600">Queue Active</span>
        </Link>

        <Link to="/dashboard/admin/audit-logs" className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-rose-300 transition space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Audits</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{audits.length}</div>
          <span className="text-[9px] font-bold text-rose-600">Traceable Events</span>
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;
