import React from 'react';
import { Database, HardDrive, ShieldCheck, Zap } from 'lucide-react';

export const DatabaseMetrics: React.FC = () => {
  const metrics = [
    { label: 'Active Pool Connections', value: '4 / 20', pct: 20, icon: Zap, color: 'text-amber-600 bg-amber-50' },
    { label: 'Data Disk Usage', value: '18.4 MB / 500 MB', pct: 4, icon: HardDrive, color: 'text-blue-600 bg-blue-50' },
    { label: 'Index Cache Hit Rate', value: '99.8%', pct: 100, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Database className="w-5 h-5 text-emerald-600" />
        PostgreSQL Performance Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-800">{m.value}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-2">{m.label}</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatabaseMetrics;
