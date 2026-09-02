import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminMetrics } from '@/services/adminService';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Users,
  Building2,
  Briefcase,
  BookOpen,
  FileCheck,
  HelpCircle,
  Newspaper,
  Calendar,
  FileText,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';

export interface AdminDashboardPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    totalResources: 0,
    totalTemplates: 0,
    totalRequests: 0,
    totalBlogPosts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const isLiveConnected = isSupabaseConfigured();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const fetchMetrics = useCallback(async () => {
    const res = await adminService.getAdminDashboardMetrics();
    if (res.data) {
      setMetrics(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    adminService.getAdminDashboardMetrics().then((res) => {
      if (!isMounted) return;
      if (res.data) {
        setMetrics(res.data);
      }
      setIsLoading(false);
    });

    // Reactive listeners across recruitment, content, and profile domains
    const handleSync = () => {
      fetchMetrics();
    };

    window.addEventListener('kth_jobs_changed', handleSync);
    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('kth_interviews_changed', handleSync);
    window.addEventListener('kth_resources_changed', handleSync);
    window.addEventListener('kth_templates_changed', handleSync);
    window.addEventListener('kth_requests_changed', handleSync);
    window.addEventListener('kth_blog_changed', handleSync);
    window.addEventListener('kth_users_changed', handleSync);
    window.addEventListener('kth_employers_changed', handleSync);
    window.addEventListener('kth_company_profile_updated', handleSync);
    window.addEventListener('kth_taxonomy_changed', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('kth_jobs_changed', handleSync);
      window.removeEventListener('kth_applications_changed', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
      window.removeEventListener('kth_resources_changed', handleSync);
      window.removeEventListener('kth_templates_changed', handleSync);
      window.removeEventListener('kth_requests_changed', handleSync);
      window.removeEventListener('kth_blog_changed', handleSync);
      window.removeEventListener('kth_users_changed', handleSync);
      window.removeEventListener('kth_employers_changed', handleSync);
      window.removeEventListener('kth_company_profile_updated', handleSync);
      window.removeEventListener('kth_taxonomy_changed', handleSync);
    };
  }, [fetchMetrics]);

  const metricCards = [
    { label: 'Total Platform Users', value: metrics.totalUsers, icon: Users, link: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Registered Candidates', value: metrics.totalCandidates, icon: FileText, link: '/admin/users', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Enterprise Employers', value: metrics.totalEmployers, icon: Building2, link: '/admin/employers', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Published Jobs', value: metrics.activeJobs, icon: Briefcase, link: '/admin/jobs', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Job Applications', value: metrics.totalApplications, icon: FileCheck, link: '/admin/applications', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Scheduled Interviews', value: metrics.totalInterviews, icon: Calendar, link: '/admin/applications', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Knowledge Resources', value: metrics.totalResources, icon: BookOpen, link: '/admin/resources', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Marketplace Templates', value: metrics.totalTemplates, icon: FileCheck, link: '/admin/templates', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'On-Demand Requests', value: metrics.totalRequests, icon: HelpCircle, link: '/admin/requests', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Editorial Articles', value: metrics.totalBlogPosts, icon: Newspaper, link: '/admin/blog', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <AdminShell title="Superuser Master Dashboard" currentPath="/admin">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-kth-slate-900 via-kth-slate-800 to-kth-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isLiveConnected ? (
                <>
                  <Badge variant="emerald" hasPulse>Live PostgREST Feed</Badge>
                  <Badge variant="slate">PostgreSQL RLS Protected</Badge>
                </>
              ) : (
                <>
                  <Badge variant="emerald">Canonical Data Engine</Badge>
                  <Badge variant="slate">Master Governance Scope</Badge>
                </>
              )}
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white mb-1">
              Platform Master Operations
            </h2>
            <p className="text-xs text-kth-slate-300">
              Aggregated real-time metrics across recruitment pipelines, digital content, and verified user accounts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto justify-center text-xs" onClick={() => handleNavigate('/admin/employers')}>
              Verify Employers
            </Button>
            <Button variant="primary" size="sm" className="w-full sm:w-auto justify-center text-xs" onClick={() => handleNavigate('/admin/resources')}>
              Manage Hub CMS
            </Button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Querying platform database metrics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {metricCards.map((m, idx) => {
              const Icon = m.icon;
              return (
                <Card
                  key={idx}
                  variant="interactive"
                  onClick={() => handleNavigate(m.link)}
                  className="p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${m.bg} flex items-center justify-center ${m.color}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-kth-slate-300" />
                  </div>
                  <div>
                    <div className="font-mono text-xl sm:text-2xl font-extrabold text-kth-slate-900 mb-0.5">
                      {m.value.toLocaleString()}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-kth-slate-500 leading-tight block truncate">
                      {m.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-display font-bold text-sm text-kth-slate-900 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> Employer Verification
            </h3>
            <p className="text-xs text-kth-slate-600 leading-relaxed mb-4">
              Review pending employer company registrations, certificate numbers, and grant verified recruiter status.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigate('/admin/employers')}>
              Review Employers
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-bold text-sm text-kth-slate-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" /> Job Post Moderation
            </h3>
            <p className="text-xs text-kth-slate-600 leading-relaxed mb-4">
              Moderate published jobs, manage approval status, pause listings, or archive closed corporate postings.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigate('/admin/jobs')}>
              Moderate Listings
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-bold text-sm text-kth-slate-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-600" /> Content Requests
            </h3>
            <p className="text-xs text-kth-slate-600 leading-relaxed mb-4">
              Inspect user submissions for custom study handbooks, legal templates, and attach deliverable files.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigate('/admin/requests')}>
              View Requests
            </Button>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
};
