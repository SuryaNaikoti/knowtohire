import React from 'react';
import { Activity, Cpu, Server, Wifi } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  const healthChecks = [
    { name: 'API Server Connection', status: 'Healthy', latency: '42ms', icon: Wifi, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Database Replication', status: 'Healthy', latency: '2ms', icon: Server, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Edge Aggregation Tasks', status: 'Healthy', latency: '120ms', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'CPU Load Check', status: 'Nominal', latency: '8%', icon: Cpu, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Server className="w-5 h-5 text-emerald-600" />
        System Health Diagnostics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthChecks.map((check) => {
          const Icon = check.icon;
          return (
            <div key={check.name} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${check.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{check.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-full">
                    {check.status}
                  </span>
                  <span className="text-xs text-slate-400">| Latency: {check.latency}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHealth;
