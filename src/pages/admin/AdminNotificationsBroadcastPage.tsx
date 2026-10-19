import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { supabase } from '@/lib/supabase';
import { adminService } from '@/services/adminService';
import {
  Bell,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Radio,
  Users,
  GraduationCap,
  Building2,
  PenTool,
  Zap,
  Clock,
  ShieldCheck,
  Smartphone,
  Laptop,
  Check,
  RefreshCw,
  AlertTriangle,
  Flame,
  Wrench,
  PartyPopper,
  Bookmark
} from 'lucide-react';

export interface AdminNotificationsBroadcastPageProps {
  onNavigate?: (path: string) => void;
}

interface TemplatePreset {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'announcement' | 'system';
  title: string;
  message: string;
  actionUrl: string;
  tag: string;
}

const PRESET_TEMPLATES: TemplatePreset[] = [
  {
    label: 'Platform Maintenance',
    icon: Wrench,
    category: 'system',
    tag: 'System',
    title: 'Scheduled Platform Maintenance: Tonight at 11:00 PM IST',
    message: 'KnowToHire will undergo routine infrastructure upgrades for approximately 25 minutes. All active sessions will automatically persist upon completion.',
    actionUrl: '/help/maintenance',
  },
  {
    label: 'Feature Launch',
    icon: Sparkles,
    category: 'announcement',
    tag: 'Feature',
    title: 'New Feature: AI Resume Matcher & Instant Skill Fit is Live!',
    message: 'We have just deployed our next-gen Resume Intelligence engine. Check out your candidate profile or job posting dashboard to view instant match scores.',
    actionUrl: '/jobs',
  },
  {
    label: 'Hiring Surge',
    icon: Flame,
    category: 'announcement',
    tag: 'Spotlight',
    title: 'Hiring Spotlight: 150+ Verified Tech & Product Roles Added',
    message: 'Top-tier tech startups and enterprises just posted new remote and hybrid vacancies. Browse priority openings before applications close this Friday.',
    actionUrl: '/jobs?sort=latest',
  },
  {
    label: 'Community Note',
    icon: PartyPopper,
    category: 'announcement',
    tag: 'Community',
    title: 'Community Milestone: Welcome to 25,000+ Verified Members',
    message: 'Thank you for growing with KnowToHire! Explore free career guide templates in the Knowledge Hub to accelerate your tech hiring and job search.',
    actionUrl: '/resources',
  },
];

export const AdminNotificationsBroadcastPage: React.FC<AdminNotificationsBroadcastPageProps> = ({
  onNavigate,
}) => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'candidates' | 'employers' | 'creators'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [category, setCategory] = useState<'announcement' | 'system'>('announcement');
  const [previewTab, setPreviewTab] = useState<'inapp' | 'push'>('inapp');

  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string; count?: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Audience counts (estimated or live)
  const [audienceCounts, setAudienceCounts] = useState<{
    all: number;
    candidates: number;
    employers: number;
    creators: number;
  }>({
    all: 0,
    candidates: 0,
    employers: 0,
    creators: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAudienceMetrics = async () => {
      setCountsLoading(true);
      try {
        // Query profiles and admin service for verified platform counts
        const [profTotal, profCand, profEmp, profCreator, adminMetricsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'candidate'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'employer'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
          adminService.getAdminDashboardMetrics(),
        ]);

        const adminMetrics = adminMetricsRes.data;

        // Take highest authentic count between profiles table and blended adminService
        const total = Math.max(profTotal.count || 0, adminMetrics?.totalUsers || 0);
        const candidates = Math.max(profCand.count || 0, adminMetrics?.totalCandidates || 0);
        const employers = Math.max(profEmp.count || 0, adminMetrics?.totalEmployers || 0);
        const creators = profCreator.count || 0;

        if (isMounted) {
          setAudienceCounts({
            all: total,
            candidates: candidates,
            employers: employers,
            creators: creators,
          });
        }
      } catch {
        // Fallback gracefully without breaking UI
      } finally {
        if (isMounted) setCountsLoading(false);
      }
    };

    fetchAudienceMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  const audienceOptions = [
    {
      id: 'all',
      label: 'All Platform Users',
      sublabel: 'Candidates, Employers & Creators',
      desc: 'Send an immediate broadcast across the entire verified user base.',
      icon: Users,
      badge: countsLoading ? '...' : `${audienceCounts.all > 0 ? audienceCounts.all.toLocaleString() : 'All Active'} users`,
      accent: 'emerald',
    },
    {
      id: 'candidates',
      label: 'Candidates Only',
      sublabel: 'Job Seekers & Applicants',
      desc: 'Target active candidates seeking tech, design, and product roles.',
      icon: GraduationCap,
      badge: countsLoading ? '...' : `${audienceCounts.candidates > 0 ? audienceCounts.candidates.toLocaleString() : 'Active'} candidates`,
      accent: 'blue',
    },
    {
      id: 'employers',
      label: 'Employers Only',
      sublabel: 'Recruiters & Hiring Leads',
      desc: 'Deliver announcements to verified talent acquisition teams.',
      icon: Building2,
      badge: countsLoading ? '...' : `${audienceCounts.employers > 0 ? audienceCounts.employers.toLocaleString() : 'Active'} employers`,
      accent: 'amber',
    },
    {
      id: 'creators',
      label: 'Creators Only',
      sublabel: 'Knowledge Hub & Template Authors',
      desc: 'Reach community authors, mentors, and content creators.',
      icon: PenTool,
      badge: countsLoading ? '...' : `${audienceCounts.creators > 0 ? audienceCounts.creators.toLocaleString() : 'Active'} creators`,
      accent: 'purple',
    },
  ];

  const applyPreset = (preset: TemplatePreset) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setActionUrl(preset.actionUrl);
    setCategory(preset.category);
  };

  const handleBroadcast = async () => {
    if (!title.trim()) {
      setResultMessage({ type: 'error', text: 'Please provide an announcement title.' });
      return;
    }
    if (!message.trim()) {
      setResultMessage({ type: 'error', text: 'Please provide an announcement message.' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setResultMessage({ type: 'error', text: 'Administrative authentication token missing. Please re-login.' });
        setLoading(false);
        setShowConfirmModal(false);
        return;
      }

      const response = await fetch('/api/admin-broadcast-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          target_audience: targetAudience,
          action_url: actionUrl.trim() || undefined,
          category,
        }),
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        setResultMessage({
          type: 'error',
          text: resJson.error || 'Failed to broadcast notification.',
        });
      } else {
        const count = resJson.count || 0;
        setResultMessage({
          type: 'success',
          text: resJson.message || `Broadcast delivered to ${count} active account(s) in real-time.`,
          count,
        });
        setTitle('');
        setMessage('');
        setActionUrl('');
        setShowConfirmModal(false);

        // Notify local app so admin's own bell updates if included
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kth_notifications_changed'));
        }
      }
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err?.message || 'A network error occurred while broadcasting.',
      });
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const activeAudienceObj = audienceOptions.find((a) => a.id === targetAudience) || audienceOptions[0];

  return (
    <AdminShell currentPath="/admin/notifications" onNavigate={onNavigate} title="Broadcast Announcements">
      <div className="max-w-6xl mx-auto space-y-5 px-3 sm:px-6 pb-16">
        {/* Reworked Cohesive Header Banner - Unified with KnowToHire Slate & Emerald Design System */}
        <div className="rounded-2xl bg-gradient-to-r from-kth-slate-900 via-kth-slate-800 to-kth-slate-900 text-white p-5 sm:p-7 shadow-sm border border-kth-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left Content */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold tracking-wide uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Platform Broadcast Engine
                </span>
                <span className="text-[11px] font-medium text-kth-slate-400 bg-kth-slate-800/80 px-2 py-0.5 rounded-md border border-kth-slate-700/60">
                  Realtime & In-App Alerts
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
                Push Live Announcements to Users
              </h1>

              <p className="text-xs sm:text-sm text-kth-slate-300 leading-relaxed max-w-xl">
                Deliver instant announcements directly into the notification feeds of candidates, employers, and creators across KnowToHire with durable 90-day retention.
              </p>
            </div>

            {/* Responsive Telemetry Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto lg:shrink-0 pt-2 lg:pt-0 border-t border-kth-slate-800/80 lg:border-t-0 lg:border-l lg:border-kth-slate-800 lg:pl-6">
              <div className="bg-kth-slate-800/80 rounded-xl p-2.5 sm:p-3 border border-kth-slate-700/70 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-kth-slate-400 mb-0.5">
                  <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Reach</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white">
                  {countsLoading ? '...' : audienceCounts.all > 0 ? audienceCounts.all.toLocaleString() : 'Platform'}
                </div>
                <div className="text-[10px] text-kth-slate-400 truncate">Active Users</div>
              </div>

              <div className="bg-kth-slate-800/80 rounded-xl p-2.5 sm:p-3 border border-kth-slate-700/70 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-kth-slate-400 mb-0.5">
                  <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Speed</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-emerald-400">&lt; 150ms</div>
                <div className="text-[10px] text-kth-slate-400 truncate">Realtime Ping</div>
              </div>

              <div className="bg-kth-slate-800/80 rounded-xl p-2.5 sm:p-3 border border-kth-slate-700/70 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-kth-slate-400 mb-0.5">
                  <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Auth</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white">Superuser</div>
                <div className="text-[10px] text-kth-slate-400 truncate">RBAC Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Toast Alert */}
        {resultMessage && (
          <div
            className={`p-3.5 sm:p-4 rounded-xl flex items-start gap-3 border transition-all ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-rose-50 text-rose-950 border-rose-200'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-kth-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold">
                {resultMessage.type === 'success' ? 'Announcement Successfully Dispatched' : 'Broadcast Error'}
              </h4>
              <p className="text-xs text-kth-slate-600 mt-0.5 break-words">{resultMessage.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setResultMessage(null)}
              className="text-xs text-kth-slate-400 hover:text-kth-slate-700 font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1-Click Quick Template Presets - Scrollable on Mobile */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-kth-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-kth-emerald-600" />
              <span className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider">
                Quick Template Presets
              </span>
            </div>
            <span className="text-[11px] text-kth-slate-400 hidden sm:inline">Click any card to pre-fill announcement form</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_TEMPLATES.map((tmpl, idx) => {
              const Icon = tmpl.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(tmpl)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-kth-slate-200 hover:border-kth-emerald-600 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-kth-slate-100 group-hover:bg-kth-emerald-100 group-hover:text-kth-emerald-700 text-kth-slate-600 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-kth-slate-900 group-hover:text-kth-emerald-800 truncate">
                      {tmpl.label}
                    </div>
                    <div className="text-[11px] text-kth-slate-500 truncate mt-0.5">
                      {tmpl.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Form Composer (7 cols on lg, full on mobile) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 bg-white p-4 sm:p-7 rounded-2xl border border-kth-slate-200 shadow-xs">
            {/* Step 1: Target Audience Selection */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <label className="text-xs sm:text-sm font-bold text-kth-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-kth-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                    1
                  </span>
                  Select Target Audience
                </label>
                <span className="text-xs text-kth-slate-500">
                  Targeting: <strong className="text-kth-slate-800">{activeAudienceObj.badge}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {audienceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = targetAudience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTargetAudience(opt.id as any)}
                      className={`relative text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-kth-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-kth-slate-200 hover:border-kth-slate-300 bg-white hover:bg-kth-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-kth-emerald-600 text-white'
                                : 'bg-kth-slate-100 text-kth-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-kth-slate-900 truncate">{opt.label}</div>
                            <div className="text-[10px] text-kth-slate-500 truncate">{opt.sublabel}</div>
                          </div>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-kth-emerald-600 bg-kth-emerald-600 text-white'
                              : 'border-kth-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-kth-slate-500 line-clamp-2 leading-relaxed">
                        {opt.desc}
                      </p>

                      <div className="mt-2 pt-2 border-t border-kth-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-kth-slate-400">Audience size</span>
                        <span className="font-semibold text-kth-slate-700 bg-kth-slate-100 px-2 py-0.5 rounded-md">
                          {opt.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Title and Category */}
            <div className="space-y-3 pt-3 border-t border-kth-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-bold text-kth-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-kth-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                    2
                  </span>
                  Announcement Header & Category
                </label>
                <div className="flex items-center gap-1 bg-kth-slate-100 p-1 rounded-lg self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCategory('announcement')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      category === 'announcement'
                        ? 'bg-white text-kth-slate-900 shadow-xs'
                        : 'text-kth-slate-500 hover:text-kth-slate-800'
                    }`}
                  >
                    Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('system')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      category === 'system'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-kth-slate-500 hover:text-kth-slate-800'
                    }`}
                  >
                    System Notice
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Scheduled Maintenance / Platform Feature Update"
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 bg-kth-slate-50/40 text-kth-slate-900 placeholder:text-kth-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 focus:border-transparent text-xs sm:text-sm transition-all font-medium pr-14"
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono text-kth-slate-400 pointer-events-none">
                  {title.length}/200
                </span>
              </div>
            </div>

            {/* Step 3: Message Content */}
            <div className="space-y-2 pt-3 border-t border-kth-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-kth-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-kth-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                    3
                  </span>
                  Message Content <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-kth-slate-400">
                  {message.length}/2000
                </span>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write the clear announcement that will appear in user notification bells..."
                maxLength={2000}
                className="w-full px-3.5 py-2.5 rounded-xl border border-kth-slate-300 bg-kth-slate-50/40 text-kth-slate-900 placeholder:text-kth-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 focus:border-transparent text-xs sm:text-sm transition-all leading-relaxed"
              />
            </div>

            {/* Step 4: Action Link */}
            <div className="space-y-2 pt-3 border-t border-kth-slate-100">
              <label className="text-xs sm:text-sm font-bold text-kth-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-kth-slate-900 text-white text-[11px] flex items-center justify-center font-mono">
                  4
                </span>
                Call-to-Action Link
                <span className="text-xs text-kth-slate-400 font-normal">(Optional)</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-kth-slate-400">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="e.g., /jobs, /resources, or https://example.com"
                  maxLength={255}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-kth-slate-300 bg-kth-slate-50/40 text-kth-slate-900 placeholder:text-kth-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-kth-emerald-500 focus:border-transparent text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-kth-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-kth-slate-500 order-2 sm:order-1 text-center sm:text-left">
                <ShieldCheck className="w-4 h-4 text-kth-emerald-600 shrink-0" />
                <span>Encrypted delivery via Supabase Service-Role</span>
              </div>

              <button
                type="button"
                disabled={loading || !title.trim() || !message.trim()}
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-kth-emerald-700 hover:bg-kth-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Review & Broadcast ({activeAudienceObj.label})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Responsive Interactive Live Preview (5 cols on lg, full on mobile) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-kth-slate-200 shadow-xs overflow-hidden sticky top-6">
              {/* Preview Header & Tabs */}
              <div className="p-3.5 sm:p-4 border-b border-kth-slate-100 flex items-center justify-between bg-kth-slate-50/70">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-kth-emerald-600" />
                  <span className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider">
                    Live Preview
                  </span>
                </div>

                <div className="flex items-center bg-white border border-kth-slate-200 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('inapp')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                      previewTab === 'inapp'
                        ? 'bg-kth-emerald-600 text-white shadow-xs'
                        : 'text-kth-slate-600 hover:text-kth-slate-900'
                    }`}
                  >
                    <Laptop className="w-3 h-3" />
                    In-App Feed
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('push')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                      previewTab === 'push'
                        ? 'bg-kth-emerald-600 text-white shadow-xs'
                        : 'text-kth-slate-600 hover:text-kth-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    OS Push
                  </button>
                </div>
              </div>

              {/* Preview Viewport Canvas */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-kth-slate-100/80 to-kth-slate-200/50 min-h-[340px] flex flex-col justify-center">
                {previewTab === 'inapp' ? (
                  /* In-App Notification Bell Dropdown Mockup */
                  <div className="bg-white rounded-xl shadow-xl border border-kth-slate-200 overflow-hidden max-w-sm mx-auto w-full transition-all">
                    {/* Mock Dropdown Navbar Header */}
                    <div className="px-3.5 py-2.5 border-b border-kth-slate-100 flex items-center justify-between bg-kth-slate-50">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-kth-slate-700" />
                        <span className="text-xs font-bold text-kth-slate-900">Notifications</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          1 New
                        </span>
                      </div>
                      <span className="text-[10px] text-kth-slate-400">Mark all read</span>
                    </div>

                    {/* Active Live Broadcast Item */}
                    <div className="p-3 sm:p-3.5 bg-emerald-50/40 border-l-4 border-l-kth-emerald-600">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-kth-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          {category === 'system' ? (
                            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-kth-emerald-700">
                              {category === 'system' ? 'System Broadcast' : 'Platform Announcement'}
                            </span>
                            <span className="text-[10px] text-kth-slate-400 font-medium">Just now</span>
                          </div>

                          <h5 className="text-xs font-bold text-kth-slate-900 mt-0.5 leading-snug">
                            {title.trim() || 'Announcement Title Will Appear Here'}
                          </h5>

                          <p className="text-xs text-kth-slate-600 mt-1 leading-relaxed line-clamp-3">
                            {message.trim() || 'Your broadcast message preview will update instantaneously in real-time as you write...'}
                          </p>

                          {actionUrl.trim() && (
                            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-kth-emerald-700 hover:text-kth-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                              <span className="truncate max-w-[170px]">{actionUrl.trim()}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Faded Ghost Notification */}
                    <div className="p-3 border-t border-kth-slate-100 opacity-40">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-kth-slate-200" />
                        <div className="flex-1 space-y-1">
                          <div className="h-2.5 bg-kth-slate-200 rounded-sm w-3/4" />
                          <div className="h-2 bg-kth-slate-100 rounded-sm w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* OS Native Push Banner Mockup */
                  <div className="bg-kth-slate-900 text-white rounded-2xl p-4 shadow-xl border border-kth-slate-800 max-w-sm mx-auto w-full transition-all">
                    <div className="flex items-center justify-between text-xs text-kth-slate-400 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-kth-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                          K
                        </div>
                        <span className="font-semibold text-kth-slate-300">KNOWTOHIRE</span>
                      </div>
                      <span className="text-[10px]">NOW</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-kth-slate-800 border border-kth-slate-700 text-kth-emerald-400 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white leading-tight">
                          {title.trim() || 'Announcement Title'}
                        </div>
                        <div className="text-xs text-kth-slate-300 mt-1 line-clamp-3 leading-relaxed">
                          {message.trim() || 'Message preview will show notification body text here...'}
                        </div>
                        {actionUrl.trim() && (
                          <div className="mt-2 text-[10px] text-emerald-400 font-mono truncate">
                            {actionUrl.trim()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Footnote / Guardrails */}
              <div className="p-3.5 sm:p-4 bg-kth-slate-50 border-t border-kth-slate-100 space-y-1.5">
                <div className="flex items-start gap-2 text-xs text-kth-slate-600">
                  <ShieldCheck className="w-4 h-4 text-kth-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Direct database insert into <code className="text-kth-slate-800 font-mono text-[11px] bg-kth-slate-200/60 px-1 py-0.2 rounded">notifications</code> table batched in 500-recipient chunks.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-kth-slate-600">
                  <Clock className="w-4 h-4 text-kth-slate-500 shrink-0 mt-0.5" />
                  <span>
                    Auto-expires after 90 days via platform maintenance cron.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-kth-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-kth-slate-900">
                    Authorize Live Platform Broadcast?
                  </h3>
                  <p className="text-xs text-kth-slate-500 mt-0.5">
                    This notification will be transmitted immediately to all matching accounts via Supabase Realtime channels.
                  </p>
                </div>
              </div>

              {/* Target & Content Summary */}
              <div className="p-3.5 bg-kth-slate-50 rounded-xl border border-kth-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-kth-slate-200/60">
                  <span className="text-kth-slate-500">Audience Segment:</span>
                  <span className="font-bold text-kth-slate-900 bg-white px-2 py-0.5 rounded border border-kth-slate-200">
                    {activeAudienceObj.label} ({activeAudienceObj.badge})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-kth-slate-200/60">
                  <span className="text-kth-slate-500">Classification:</span>
                  <span className="font-bold capitalize text-kth-slate-900">
                    {category}
                  </span>
                </div>
                <div>
                  <span className="text-kth-slate-500 block mb-0.5">Title:</span>
                  <div className="font-semibold text-kth-slate-800 text-xs sm:text-sm">{title}</div>
                </div>
                <div>
                  <span className="text-kth-slate-500 block mb-0.5">Message:</span>
                  <div className="text-kth-slate-600 line-clamp-3 leading-relaxed bg-white p-2 rounded border border-kth-slate-200">
                    {message}
                  </div>
                </div>
                {actionUrl.trim() && (
                  <div>
                    <span className="text-kth-slate-500 block mb-0.5">Destination Link:</span>
                    <span className="font-mono text-emerald-700 break-all">{actionUrl.trim()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-kth-slate-200 text-xs font-semibold text-kth-slate-700 hover:bg-kth-slate-100 transition-colors cursor-pointer"
                >
                  Cancel & Edit
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleBroadcast}
                  className="px-4 py-2 rounded-xl bg-kth-emerald-700 hover:bg-kth-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Confirm & Send Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};
