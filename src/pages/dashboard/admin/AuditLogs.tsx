import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { StaggerGrid, StaggerItem, MotionCard } from '../../../components/ui/Motion';
import { supabase } from '../../../lib/supabase';
import {
  Terminal,
  Eye,
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
  Search,
  Check,
  X,
  Activity,
  Briefcase,
  Building,
  KeyRound,
  FileText
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: string | null;
  created_at: string;
  details: any;
}

// Demo seed data matching enterprise V1.0 structure
const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-89421',
    user_id: 'usr-admin-1',
    action: 'USER_ROLE_UPDATED',
    ip_address: '127.0.0.1',
    created_at: '2026-07-09T17:18:00Z',
    details: {
      event_title: 'Role Updated Successfully',
      summary: "Rajeev Sharma changed Rahul Sharma's role",
      category: 'Authentication',
      severity: 'Medium',
      status: 'Completed',
      module: 'Access Configuration',
      actor_name: 'Rajeev Sharma',
      actor_role: 'Platform Administrator',
      actor_email: 'admin@knowtohire.com',
      affected_user: {
        name: 'Rahul Sharma',
        role: 'Candidate',
        email: 'rahul.sharma@gmail.com'
      },
      changes: [
        { field: 'Role', previous: 'Administrator', new: 'Candidate' },
        { field: 'Status', previous: 'Pending', new: 'Active' }
      ],
      browser: 'Chrome 127',
      os: 'Windows 11',
      session: 'Current Session',
      timeline: [
        { time: '05:14 PM', step: 'Role update initiated' },
        { time: '05:14 PM', step: 'Permissions validated' },
        { time: '05:15 PM', step: 'Role updated' },
        { time: '05:18 PM', step: 'Audit record created' }
      ]
    }
  },
  {
    id: 'log-89420',
    user_id: 'usr-admin-1',
    action: 'JOB_MODERATION_APPROVED',
    ip_address: '192.168.1.104',
    created_at: '2026-08-06T09:15:30Z',
    details: {
      event_title: 'Job Moderation Approved',
      summary: 'Rajeev Sharma approved job listing for GreenEarth Consultants',
      category: 'Moderation',
      severity: 'Low',
      status: 'Completed',
      module: 'Job Audit',
      actor_name: 'Rajeev Sharma',
      actor_role: 'Platform Administrator',
      actor_email: 'admin@knowtohire.com',
      affected_job: {
        title: 'Senior Environmental Engineer',
        company: 'GreenEarth Consultants'
      },
      changes: [
        { field: 'Moderation Status', previous: 'Pending Review', new: 'Approved & Live' }
      ],
      browser: 'Chrome 127',
      os: 'Windows 11',
      session: 'Current Session',
      timeline: [
        { time: '09:10 AM', step: 'Job moderation queued' },
        { time: '09:12 AM', step: 'Content safety checks passed' },
        { time: '09:15 AM', step: 'Listing approved' }
      ]
    }
  },
  {
    id: 'log-89419',
    user_id: 'usr-admin-1',
    action: 'EMPLOYER_VERIFICATION_SUBMITTED',
    ip_address: '10.0.4.12',
    created_at: '2026-08-06T08:50:00Z',
    details: {
      event_title: 'Employer Verification Submitted',
      summary: 'Patent Nexus LLC submitted corporate documentation for verification',
      category: 'Employer Audit',
      severity: 'High',
      status: 'Pending',
      module: 'Employers Directory',
      actor_name: 'Patent Nexus Admin',
      actor_role: 'Employer Partner',
      actor_email: 'jobs@patentnexus.com',
      affected_company: {
        name: 'Patent Nexus LLC',
        industry: 'Legal Tech'
      },
      browser: 'Firefox 128',
      os: 'macOS Sonoma',
      session: 'Session #8921'
    }
  }
];

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Keyboard ESC listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLog) {
        setSelectedLog(null);
        setShowTechnicalDetails(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLog]);

  // Formatters
  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '09 Jul 2026';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '09 Jul 2026';
    }
  };

  const formatTimeOnly = (dateStr?: string) => {
    if (!dateStr) return '05:18 PM';
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '05:18 PM';
    }
  };

  // Copy Details Handler
  const handleCopyDetails = () => {
    if (!selectedLog) return;
    const d = selectedLog.details || {};
    const summary = `
Audit Log ID: ${selectedLog.id}
Event: ${d.event_title || selectedLog.action}
Category: ${d.category || 'Authentication'}
Module: ${d.module || 'Access Configuration'}
Performed By: ${d.actor_name || 'Rajeev Sharma'} (${d.actor_email || 'admin@knowtohire.com'})
Date & Time: ${formatDateOnly(selectedLog.created_at)} ${formatTimeOnly(selectedLog.created_at)}
IP Address: ${selectedLog.ip_address || '127.0.0.1'}
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
      {/* Header Title Section */}
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

      {/* Toolbar */}
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
                  {l.ip_address || '127.0.0.1'}
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">
                  {formatDateOnly(l.created_at)} {formatTimeOnly(l.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelectedLog(l); setShowTechnicalDetails(false); }}
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

      {/* 10. ENTERPRISE AUDIT LOG DETAILS MODAL (24px ROUNDED, ~900-1000px MAX-WIDTH) */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedLog(null)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[24px] max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-scale-up sm:w-11/12"
          >
            {/* 1. MODAL HEADER */}
            <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                  Audit Log Details
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Log ID: <span className="font-mono text-slate-600 font-bold">{selectedLog.id}</span> • Category: <span className="font-bold text-slate-600">{selectedLog.details?.category || 'Authentication'}</span> • Date: <span className="font-bold text-slate-600">{formatDateOnly(selectedLog.created_at)}</span>
                </p>
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
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900">
              
              {/* 2. HERO EVENT SUMMARY CARD */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      {selectedLog.details?.event_title || 'Role Updated Successfully'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedLog.details?.summary || "Rajeev Sharma changed Rahul Sharma's role"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedLog.details?.status || 'Completed'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {selectedLog.details?.category || 'Authentication'}
                  </span>
                </div>
              </div>

              {/* 3. FOUR EQUAL RESPONSIVE INFORMATION CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedLog.details?.category || 'Authentication'}
                  </span>
                </div>

                {/* Module */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Module</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedLog.details?.module || 'Access Configuration'}
                  </span>
                </div>

                {/* Performed By */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Performed By</span>
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {selectedLog.details?.actor_name || 'Rajeev Sharma'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {selectedLog.details?.actor_role || 'Platform Administrator'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal truncate">
                    {selectedLog.details?.actor_email || 'admin@knowtohire.com'}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                  <p className="text-xs font-bold text-slate-900">
                    {formatDateOnly(selectedLog.created_at)}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatTimeOnly(selectedLog.created_at)}
                  </p>
                </div>
              </div>

              {/* 4. AFFECTED ENTITY SECTION */}
              {(selectedLog.details?.affected_user || selectedLog.details?.affected_job || selectedLog.details?.affected_company) && (
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedLog.details?.affected_user ? 'Affected User' : selectedLog.details?.affected_job ? 'Affected Job' : 'Affected Company'}
                  </h4>

                  {selectedLog.details?.affected_user && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {selectedLog.details.affected_user.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{selectedLog.details.affected_user.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {selectedLog.details.affected_user.role} • {selectedLog.details.affected_user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedLog.details?.affected_job && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{selectedLog.details.affected_job.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{selectedLog.details.affected_job.company}</p>
                      </div>
                    </div>
                  )}

                  {selectedLog.details?.affected_company && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{selectedLog.details.affected_company.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{selectedLog.details.affected_company.industry}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. CHANGES SUMMARY COMPARISON TABLE */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Changes Summary
                </h4>

                {selectedLog.details?.changes && selectedLog.details.changes.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-5">Field</th>
                          <th className="py-3.5 px-5">Previous Value</th>
                          <th className="py-3.5 px-5">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {selectedLog.details.changes.map((c: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-5 text-slate-900 font-bold">{c.field}</td>
                            <td className="py-3.5 px-5 text-rose-700 bg-rose-50/40 font-mono text-[11px]">
                              {c.previous}
                            </td>
                            <td className="py-3.5 px-5 text-emerald-700 bg-emerald-50/40 font-mono text-[11px]">
                              {c.new}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs font-medium text-slate-500 text-center">
                    No field-level changes recorded.
                  </div>
                )}
              </div>

              {/* 7. NETWORK & ENVIRONMENT COMPACT CARDS */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" /> Network & Environment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Browser</span>
                      <span className="font-bold text-slate-900">{selectedLog.details?.browser || 'Chrome 127'}</span>
                      <span className="text-[10px] text-slate-500 block">{selectedLog.details?.os || 'Windows 11'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">IP Address</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLog.ip_address || '127.0.0.1'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Session</span>
                      <span className="font-bold text-slate-900">{selectedLog.details?.session || 'Current Session'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. COMPACT VERTICAL TIMELINE SECTION */}
              {selectedLog.details?.timeline && selectedLog.details.timeline.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" /> Event Execution Timeline
                  </h4>
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
                    {selectedLog.details.timeline.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-slate-400 font-bold text-[11px] w-16">{step.time}</span>
                        <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                        <span className="font-semibold text-slate-800">{step.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. TECHNICAL DETAILS (COLLAPSIBLE ACCORDION) */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    Technical Details
                  </span>
                  {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTechnicalDetails && (
                  <div className="p-4 border-t border-slate-200 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-b-2xl overflow-x-auto max-h-64 border-solid leading-relaxed">
                    <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                  </div>
                )}
              </div>

            </div>

            {/* 9. FOOTER ACTIONS */}
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
