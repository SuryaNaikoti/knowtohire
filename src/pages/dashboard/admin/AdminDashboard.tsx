import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { useAuth } from '../../../context/AuthContext';
import { ShieldAlert, Server, Users, Activity, ToggleLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { dashboardService } from '../../../lib/services/dashboardService';
import type { AdminKPIs } from '../../../lib/services/dashboardService';
import { auditService } from '../../../lib/services/auditService';
import type { AuditLog } from '../../../lib/services/auditService';
import { Loading } from '../../../components/ui/Loading';

export const AdminDashboard: React.FC = () => {
  const { profile, setRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);

  const headers = [
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action Description' },
    { key: 'resource', label: 'Target Module' },
    { key: 'status', label: 'Severity' },
    { key: 'date', label: 'Timestamp' },
  ];

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

  const triggerMockAudit = async (newRole: any) => {
    if (profile) {
      await auditService.logEvent(
        profile.id,
        'Auth',
        `Changed role configuration to ${newRole}`,
        undefined,
        { previousRole: profile.role }
      );
    }
    await setRole(newRole);
    // Reload logs
    const auditLogs = await auditService.getAuditLogs();
    setAudits(auditLogs);
  };

  if (loading || !kpis) {
    return <Loading label="Fetching admin control center..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-accent to-indigo-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-orange-500/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <Badge className="bg-white/20 text-white border-none py-0.5" size="sm">Administrative Control</Badge>
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight leading-tight">
            KnowToHire Control Center
          </h1>
          <p className="text-xs md:text-sm text-orange-100 font-medium leading-relaxed">
            Monitor authentication states, database read triggers, security alerts, and Clerk oauth parameters.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: kpis.totalUsersCount.toString(), icon: <Users className="w-5 h-5 text-primary" />, desc: 'Vetted candidate & recruiter list' },
          { label: 'Pending Moderation', value: kpis.pendingModerationCount.toString(), icon: <Server className="w-5 h-5 text-secondary" />, desc: 'Jobs waiting approval' },
          { label: 'Total Companies', value: kpis.totalCompaniesCount.toString(), icon: <ShieldAlert className="w-5 h-5 text-accent" />, desc: 'Registered employers' },
        ].map((stat) => (
          <Card key={stat.label} hoverEffect>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <div className="p-2 bg-gray-50 border border-gray-100 border-solid rounded-lg">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-heading text-gray-900 leading-none mb-1">{stat.value}</div>
              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-secondary" /> {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid: Audit Logs & Permission Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Audit Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">Recent Audit Logs</h2>
            <Badge variant="accent" size="sm">System Logs Live</Badge>
          </div>
          <Table headers={headers}>
            {audits.slice(0, 10).map((audit, i) => (
              <TableRow key={audit.id || i}>
                <TableCell className="font-bold text-gray-900 text-xs sm:text-sm">
                  {audit.actorId === profile?.id ? `${profile.first_name} ${profile.last_name}` : audit.actorId}
                </TableCell>
                <TableCell className="text-xs text-gray-600 font-medium">{audit.action}</TableCell>
                <TableCell className="text-xs text-gray-500 font-semibold">{audit.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={audit.category === 'Auth' ? 'secondary' : 'primary'}
                    size="sm"
                  >
                    Success
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-400 font-semibold">
                  {new Date(audit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>

        {/* Access Simulator Widget */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">Simulator Controls</h2>
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-primary uppercase tracking-widest flex items-center gap-1.5">
                <ToggleLeft className="w-4 h-4" /> Role Simulator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed border-b border-gray-100 border-solid pb-3">
                Change your active permissions profile to verify layout adaptations. Switching roles will generate an audit log entry.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-700">Impersonate Profile:</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={profile?.role === 'candidate' ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => triggerMockAudit('candidate')}
                  >
                    Switch to Candidate Dashboard
                  </Button>
                  <Button
                    variant={profile?.role === 'employer' ? 'secondary' : 'outline'}
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => triggerMockAudit('employer')}
                  >
                    Switch to Employer Dashboard
                  </Button>
                  <Button
                    variant={profile?.role === 'admin' ? 'accent' : 'outline'}
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => triggerMockAudit('admin')}
                  >
                    Switch to Admin Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
