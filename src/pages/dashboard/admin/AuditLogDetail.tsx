import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  ArrowLeft,
  Terminal,
  ShieldCheck,
  Globe,
  Laptop,
  KeyRound,
  Clock,
  User,
  Copy,
  FileCode
} from 'lucide-react';

export const AuditLogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const log = {
    id: id || 'log-89421',
    action: '[Auth] Changed role configuration to candidate',
    ip_address: '127.0.0.1',
    created_at: '2026-07-09T17:18:00Z',
    details: {
      category: 'Authentication & RBAC Governance',
      severity: 'Medium',
      actor_name: 'Rajeev Sharma',
      actor_role: 'Platform Administrator',
      actor_email: 'admin@knowtohire.com',
      affected_user: 'Rahul Sharma (rahul.sharma@gmail.com)',
      changes: [
        { field: 'Role', previous: 'Administrator', new: 'Candidate' },
        { field: 'Status', previous: 'Pending', new: 'Active' }
      ],
      browser: 'Chrome 127',
      os: 'Windows 11',
      session: 'Current Session'
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <button
          onClick={() => navigate('/dashboard/admin/audit-logs')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Audit Logs Registry
        </button>

        <Badge variant="secondary" className="uppercase font-extrabold font-mono">
          Event ID: {log.id}
        </Badge>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-200/60 shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Security Action Event</span>
            <h1 className="text-xl font-black font-heading text-slate-900 tracking-tight mt-0.5">{log.action}</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Recorded on {new Date(log.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Recorded Field Changes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="py-3 px-4">Field</th>
                    <th className="py-3 px-4">Previous Value</th>
                    <th className="py-3 px-4">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {log.details.changes.map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 text-slate-900 font-bold">{c.field}</td>
                      <td className="py-3 px-4 text-rose-700 bg-rose-50/50 font-mono">{c.previous}</td>
                      <td className="py-3 px-4 text-emerald-700 bg-emerald-50/50 font-mono">{c.new}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Immutable Audit Record</span>
            <pre>{JSON.stringify(log, null, 2)}</pre>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Actor & Telemetry</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Actor</span>
                <span className="font-bold text-slate-900">{log.details.actor_name} ({log.details.actor_role})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">IP Address</span>
                <span className="font-mono font-bold text-slate-900">{log.ip_address}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Browser & OS</span>
                <span className="font-bold text-slate-900">{log.details.browser} ({log.details.os})</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetail;
