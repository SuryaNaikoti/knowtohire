import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { useAuth } from '../../../context/AuthContext';
import { Briefcase, Download, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { dashboardService } from '../../../lib/services/dashboardService';
import type { CandidateKPIs } from '../../../lib/services/dashboardService';
import { ProfileCompletionMeter } from '../../../components/dashboard/ProfileCompletionMeter';
import { Loading } from '../../../components/ui/Loading';

export const CandidateDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<CandidateKPIs | null>(null);

  const headers = [
    { key: 'company', label: 'Company / Role' },
    { key: 'match', label: 'Stack Match' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Applied' },
  ];

  useEffect(() => {
    const fetchCandidateMetrics = async () => {
      if (!profile) return;
      try {
        setLoading(true);
        const data = await dashboardService.getCandidateKPIs(profile.id);
        setKpis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateMetrics();
  }, [profile]);

  if (loading || !kpis) {
    return <Loading label="Fetching workspace metrics..." />;
  }

  const stats = [
    { label: 'Active Applications', value: kpis.activeAppsCount.toString(), icon: <Briefcase className="w-5 h-5 text-primary" />, desc: '+1 this week' },
    { label: 'CV Downloads', value: kpis.cvDownloadsCount.toString(), icon: <Download className="w-5 h-5 text-secondary" />, desc: 'By 6 companies' },
    { label: 'Profile Views', value: kpis.profileViewsCount.toString(), icon: <Eye className="w-5 h-5 text-accent" />, desc: 'Top 10% in SaaS' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <Badge className="bg-white/20 text-white border-none py-0.5" size="sm">Candidate Portfolio</Badge>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-tight">
            Welcome back, {profile?.first_name || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            Your technical profile match index is outstanding this quarter. Recruiters are actively scouting candidates with your verified stack credentials.
          </p>
        </div>
      </div>

      {/* Completion Meter Row */}
      <ProfileCompletionMeter percentage={kpis.profileStrength} breakdown={kpis.breakdown} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hoverEffect>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <div className="p-2 bg-gray-50 border border-gray-100 border-solid rounded-lg">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-heading text-gray-900 leading-none mb-1">{stat.value}</div>
              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-secondary" /> {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid: Applications & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Applications List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">Active Applications</h2>
            <Badge variant="primary" size="sm">Updated 10m ago</Badge>
          </div>
          <Table headers={headers}>
            {kpis.applications.map((app, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{app.role}</p>
                    <p className="text-[11px] text-gray-400 font-medium leading-tight">{app.company}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm">{app.match}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      app.status === 'Offer Received'
                        ? 'secondary'
                        : app.status === 'Interviewing'
                        ? 'primary'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-400 font-semibold">{app.date}</TableCell>
              </TableRow>
            ))}
          </Table>
        </div>

        {/* Intelligence Side Widget */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">Career Insights</h2>
          <Card hoverEffect className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-b border-gray-100 border-solid pb-3">
                <p className="text-xs font-bold text-gray-900 leading-tight">Skill Delta Detected</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Adding **TypeScript Decorators** or **Supabase Sync triggers** will increase matching rates for 12 roles.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-900 leading-tight">Recommended Template</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Download our **Full-Stack SaaS Cover Letter Blueprint** to accelerate review cycles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
