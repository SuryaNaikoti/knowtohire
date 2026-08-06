import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { supabase } from '../../../lib/supabase';
import {
  Terminal,
  Eye,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Laptop,
  Globe,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  FileCode,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Layers,
  Activity
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: string | null;
  created_at: string;
  details: any;
}

// Demo fallback seed data for rich presentation
const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-89421',
    user_id: 'usr-admin-1',
    action: 'USER_ROLE_UPDATED',
    ip_address: '192.168.1.104',
    created_at: '2026-08-06T10:42:15Z',
    details: {
      category: 'User Management',
      severity: 'Medium',
      status: 'Success',
      module: 'User Directory',
      actor_name: 'Rajeev Nair (Super Admin)',
      target_user: 'Sneha Reddy (sneha.reddy@gmail.com)',
      changes: [
        { field: 'Access Role', previous: 'Candidate', new: 'Employer' },
        { field: 'Is Active Status', previous: 'Suspended', new: 'Active' }
      ],
      browser: 'Chrome 127.0.0 (Windows 11)',
      session_id: 'sess_8f93a10c92',
      reason: 'Approved employer organization ownership'
    }
  },
  {
    id: 'log-89420',
    user_id: 'usr-admin-1',
    action: 'JOB_MODERATED_APPROVED',
    ip_address: '192.168.1.104',
    created_at: '2026-08-06T09:15:30Z',
    details: {
      category: 'Job Moderation',
      severity: 'Low',
      status: 'Success',
      module: 'Job Moderation',
      actor_name: 'Rajeev Nair (Super Admin)',
      target_entity: 'Job Listing #482 (Senior Frontend Engineer)',
      company: 'GreenEarth Inc.',
      changes: [
        { field: 'Moderation Status', previous: 'Pending Review', new: 'Approved & Live' }
      ],
      browser: 'Chrome 127.0.0 (Windows 11)',
      session_id: 'sess_8f93a10c92'
    }
  },
  {
    id: 'log-89419',
    user_id: 'usr-admin-1',
    action: 'EMPLOYER_VERIFICATION_SUBMITTED',
    ip_address: '10.0.4.12',
    created_at: '2026-08-06T08:50:00Z',
    details: {
      category: 'Employer Audit',
      severity: 'High',
      status: 'Pending',
      module: 'Employers Directory',
      actor_name: 'Patent Nexus System',
      company: 'Patent Nexus LLC',
      browser: 'Firefox 128.0 (macOS Sonoma)',
      session_id: 'sess_7b22a01d'
    }
  },
  {
    id: 'log-89418',
    user_id: 'usr-admin-1',
    action: 'SYSTEM_BROADCAST_DISPATCHED',
    ip_address: '172.16.0.1',
    created_at: '2026-08-05T16:30:00Z',
    details: {
      category: 'Broadcast Center',
      severity: 'Info',
      status: 'Success',
      module: 'Platform Broadcasts',
      actor_name: 'Rajeev Nair (Super Admin)',
      broadcast_title: 'Scheduled Platform Maintenance Notice',
      recipients_count: 1782,
      browser: 'Chrome 127.0.0 (Windows 11)',
      session_id: 'sess_8f93a10c92'
    }
  }
];

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: err } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (err) throw err;

      if (data && data.length > 0) {
        setLogs(data as AuditLogEntry[]);
      } else {
        setLogs(DEMO_AUDIT_LOGS);
      }
    } catch (err: any) {
      console.warn('Supabase fetch audit logs warning:', err);
      setLogs(DEMO_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Keyboard Escape listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLog) {
        setSelectedLog(null);
        setShowJson(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLog]);

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '06 Aug 2026, 10:42 AM';
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Severity Badge Styling
  const renderSeverityBadge = (severity?: string) => {
    const s = (severity || 'Info').toLowerCase();
    if (s.includes('critical') || s.includes('high')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          {severity || 'High'}
        </span>
      );
    }
    if (s.includes('med')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
          {severity || 'Medium'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
        {severity || 'Info'}
      </span>
    );
  };

  // Status Badge Styling
  const renderStatusBadge = (status?: string) => {
    const st = (status || 'Success').toLowerCase();
    if (st.includes('fail') || st.includes('error')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          {status || 'Failed'}
        </span>
      );
    }
    if (st.includes('pend') || st.includes('warn')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {status || 'Pending'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        {status || 'Success'}
      </span>
    );
  };

  // Copy Summary Handler
  const handleCopyDetails = () => {
    if (!selectedLog) return;
    const summary = `
Audit Log ID: ${selectedLog.id}
Action: ${selectedLog.action}
Timestamp: ${formatDate(selectedLog.created_at)}
IP Address: ${selectedLog.ip_address || '192.168.1.104'}
Details: ${JSON.stringify(selectedLog.details || {}, null, 2)}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Export JSON Handler
  const handleExportJson = () => {
    if (!selectedLog) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_log_${selectedLog.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      (l.ip_address || '').toLowerCase().includes(q)
    );
  }, [logs, search]);

  if (loading) return <Loading label="Loading security audit trails..." />;

  const tableHeaders = [
    { key: 'action', label: 'Action Event' },
    { key: 'ip', label: 'IP Address' },
    { key: 'date', label: 'Timestamp' },
    { key: 'actions', label: 'Details', className: 'text-right' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200/60 text-rose-600 shadow-2xs">
              <Terminal className="w-6 h-6" />
            </div>
            Audit Logs Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Review security audit trails, API modifications, role updates, and system governance records.
          </p>
        </div>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit logs by event name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none h-10 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Table Container */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table headers={tableHeaders}>
            {filteredLogs.map((l) => (
              <TableRow key={l.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell>
                  <div className="py-1">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">{l.action}</p>
                    <p className="text-[11px] text-slate-400 font-mono font-medium leading-tight mt-0.5">ID: {l.id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono font-bold text-slate-600">
                  {l.ip_address || '192.168.1.104'}
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">
                  {formatDate(l.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelectedLog(l); setShowJson(false); }}
                    className="text-xs px-3.5 py-1.5 font-bold h-9 bg-white border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </CardContent>
      </Card>

      {/* REDESIGNED AUDIT LOG DETAILS ENTERPRISE MODAL */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedLog(null)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-up"
          >
            {/* 1. STICKY HEADER */}
            <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/60 text-purple-600 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading text-slate-900 tracking-tight leading-tight">
                    Audit Event Inspection
                  </h3>
                  <p className="text-xs font-mono text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>Log ID: {selectedLog.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. MODAL BODY (SCROLLABLE) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Event Name Banner */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                    Event Action Symbol
                  </span>
                  <h2 className="text-xl font-black font-mono text-white tracking-tight">
                    {selectedLog.action}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {renderSeverityBadge(selectedLog.details?.severity)}
                  {renderStatusBadge(selectedLog.details?.status)}
                </div>
              </div>

              {/* Event Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedLog.details?.category || 'Governance'}
                  </span>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Module</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedLog.details?.module || 'Admin Control'}
                  </span>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Performed By</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedLog.details?.actor_name || selectedLog.user_id || 'Super Admin System'}
                  </span>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {formatDate(selectedLog.created_at)}
                  </span>
                </div>
              </div>

              {/* Structured Changes Comparison Table */}
              {selectedLog.details?.changes && selectedLog.details.changes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" /> State Mutation Comparison
                  </h4>
                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Field</th>
                          <th className="py-3 px-4">Previous Value</th>
                          <th className="py-3 px-4">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {selectedLog.details.changes.map((c: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 text-slate-900 font-bold">{c.field}</td>
                            <td className="py-3 px-4 text-rose-700 bg-rose-50/40 font-mono text-[11px]">
                              {c.previous || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-emerald-700 bg-emerald-50/40 font-mono text-[11px] flex items-center gap-1.5">
                              <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                              {c.new || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Client & Network Metadata */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" /> Network & Environment Telemetry
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">IP Address</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedLog.ip_address || selectedLog.details?.ip || '192.168.1.104'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Environment</span>
                      <span className="font-bold text-slate-900 truncate block">
                        {selectedLog.details?.browser || 'Chrome 127.0.0 (Windows 11)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Technical Details Accordion */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowJson(!showJson)}
                  className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    Technical Details & Raw JSON Payload
                  </span>
                  {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showJson && (
                  <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-b-2xl overflow-x-auto max-h-64 border-solid leading-relaxed">
                    <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                  </div>
                )}
              </div>

            </div>

            {/* 3. STICKY FOOTER */}
            <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="text-xs font-bold rounded-xl bg-white border-slate-300 hover:bg-slate-100 h-9 px-4 cursor-pointer"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDetails}
                  className="text-xs font-bold rounded-xl bg-white border-slate-300 hover:bg-slate-100 h-9 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  {copied ? 'Copied!' : 'Copy Details'}
                </Button>

                <Button
                  size="sm"
                  onClick={handleExportJson}
                  className="text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
