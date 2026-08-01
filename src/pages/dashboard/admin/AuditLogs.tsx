import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { supabase } from '../../../lib/supabase';
import { Eye, Terminal } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: string | null;
  created_at: string;
  details: any;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

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
      setLogs(data as AuditLogEntry[]);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch activity logs registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <Loading label="Loading security audit trails..." />;

  const tableHeaders = [
    { key: 'action', label: 'Action Event' },
    { key: 'ip', label: 'IP Address' },
    { key: 'date', label: 'Timestamp' },
    { key: 'actions', label: 'Details', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" /> Audit Logs Tracker
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Review system security audits, API modifications, updates, and user action trails.
        </p>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      <Card>
        <CardContent className="p-0">
          <Table headers={tableHeaders}>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div>
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{l.action}</p>
                    <p className="text-[10px] text-gray-400 font-semibold leading-tight mt-0.5">ID: {l.id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-gray-650">{l.ip_address || 'System Internal'}</TableCell>
                <TableCell className="text-xs text-gray-500 font-semibold">
                  {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLog(l)}
                    className="text-[10px] px-2.5 py-1 font-bold h-8 flex items-center gap-1.5 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" /> Parse
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </CardContent>
      </Card>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 relative border border-solid border-gray-150 animate-fade-in-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">
                  Log Entry Details
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">Action: {selectedLog.action}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer" onClick={() => setSelectedLog(null)}>
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Metadata payload</h4>
                <pre className="mt-2 p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto max-h-60 leading-relaxed border border-solid border-slate-800">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-solid border-gray-100 gap-3">
              <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => setSelectedLog(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
