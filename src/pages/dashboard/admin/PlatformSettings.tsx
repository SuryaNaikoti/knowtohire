import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { StaggerGrid, StaggerItem } from '../../../components/ui/Motion';
import {
  Settings as SettingsIcon,
  ToggleLeft,
  ToggleRight,
  Save,
  ShieldCheck,
  Cpu,
  Database,
  Mail,
  Server,
  Zap,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Globe
} from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  const [flags, setFlags] = useState({
    aiMatching: true,
    stripeSimulation: true,
    emailNotifications: true,
    candidateScouting: true,
    moderationQueue: true,
    realtimeAlerts: true,
  });

  const [success, setSuccess] = useState('');
  const [purging, setPurging] = useState(false);

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSuccess('Platform feature flags and system configuration synced successfully.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handlePurgeCache = () => {
    setPurging(true);
    setTimeout(() => {
      setPurging(false);
      setSuccess('CDN cache & Redis telemetry buffers flushed successfully.');
      setTimeout(() => setSuccess(''), 4000);
    }, 1200);
  };

  const activeCount = useMemo(() => {
    return Object.values(flags).filter(Boolean).length;
  }, [flags]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <SettingsIcon className="w-6 h-6" />
            </div>
            Platform Settings & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure active module toggles, modify system telemetry thresholds, and edit feature gates.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Settings Synchronized">{success}</Alert>}

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Active Feature Gates</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{activeCount} / 6 Enabled</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Global System Toggles</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">API Telemetry Uptime</p>
            <h3 className="text-2xl sm:text-3xl font-black text-sky-600 font-heading mt-1.5">99.98%</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">High Availability Status</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Database Engine</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">Postgres RLS</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Row-Level Security Active</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Outbound Mailer</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-heading mt-1.5">SMTP Active</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Applicant Status Alerts</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Feature Flags */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-sm font-black font-heading text-slate-900">Global Feature Flags</CardTitle>
              </div>
              <Badge variant="success" size="sm">Operational</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {[
                { key: 'aiMatching', label: 'AI Match Engine v2.0', desc: 'Runs semantic matching algorithms against active vacancies.' },
                { key: 'stripeSimulation', label: 'Stripe Sandbox Transactions', desc: 'Allows mock checkouts for template purchases.' },
                { key: 'emailNotifications', label: 'Outbound SMTP Mailer', desc: 'Sends confirmation logs and applicant status alerts.' },
                { key: 'candidateScouting', label: 'Talent Scout Public Beta', desc: 'Allows employers to search candidate portfolios.' },
                { key: 'moderationQueue', label: 'Ad-hoc Job Post Moderation', desc: 'Requires new job vacancies to be approved before publishing.' },
                { key: 'realtimeAlerts', label: 'Realtime In-App Notification Broadcasts', desc: 'Delivers instant WebSocket bell alerts to active user sessions.' },
              ].map((flag) => {
                const isEnabled = flags[flag.key as keyof typeof flags];
                return (
                  <div key={flag.key} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-slate-900">{flag.label}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-md">{flag.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlag(flag.key as keyof typeof flags)}
                      className="text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                    >
                      {isEnabled ? (
                        <ToggleRight className="w-9 h-9 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-slate-300" />
                      )}
                    </button>
                  </div>
                );
              })}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                  <Save className="w-4 h-4 mr-1.5" /> Save System Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Cols: Telemetry & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" /> System Telemetry
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-500">Node Runtime</span>
                <span className="font-mono font-bold text-slate-900">v20.11.0 LTS</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-500">Supabase Region</span>
                <span className="font-bold text-slate-900">ap-south-1 (Mumbai)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-500">SSL Certificate</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">✓ TLS v1.3</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-500">Database RLS</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">✓ Active Policies</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePurgeCache}
                disabled={purging}
                className="w-full text-xs font-bold text-slate-700 justify-center h-10"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${purging ? 'animate-spin' : ''}`} />
                {purging ? 'Flushing Buffers...' : 'Flush CDN & Telemetry Cache'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
