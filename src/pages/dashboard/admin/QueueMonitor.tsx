import React from 'react';
import { Layers, Play, CheckCircle } from 'lucide-react';

export const QueueMonitor: React.FC = () => {
  const queues = [
    { name: 'Weekly Digest Dispatcher', size: 0, active: false, status: 'Idle', lastRun: '2 hours ago' },
    { name: 'Analytics Summary Aggregation', size: 14, active: true, status: 'Processing', lastRun: '5 mins ago' },
    { name: 'Newsletter CRM Sync', size: 0, active: false, status: 'Idle', lastRun: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Layers className="w-5 h-5 text-emerald-600" />
        Task Queue Monitor
      </h2>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Queue Name</th>
              <th className="px-4 py-3 text-center">Pending Size</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Last Execution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {queues.map((q) => (
              <tr key={q.name} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{q.name}</td>
                <td className="px-4 py-3 text-center text-slate-600 font-mono">{q.size}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    q.status === 'Processing' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {q.status === 'Processing' ? (
                      <Play className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-400 text-xs">{q.lastRun}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueueMonitor;
