import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export const ErrorLogs: React.FC = () => {
  const errors = [
    { id: 1, message: 'JWT token expired on auth payload renewal request', context: 'AuthCallback.tsx:42', count: 12, time: '2 mins ago' },
    { id: 2, message: 'Supabase network call timed out fetching templates details', context: 'templateService.ts:184', count: 3, time: '14 mins ago' },
    { id: 3, message: 'Cannot read property view_count of null', context: 'BlogPostDetail.tsx:180', count: 1, time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
          Application Error Logs
        </h2>
        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Error Details</th>
              <th className="px-4 py-3 text-left">Location / Context</th>
              <th className="px-4 py-3 text-center">Hits</th>
              <th className="px-4 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-mono text-xs">
            {errors.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-red-600 truncate max-w-xs">{e.message}</td>
                <td className="px-4 py-3 text-slate-600">{e.context}</td>
                <td className="px-4 py-3 text-center text-slate-500 font-semibold">{e.count}</td>
                <td className="px-4 py-3 text-right text-slate-400">{e.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorLogs;
