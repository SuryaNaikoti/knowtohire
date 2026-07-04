import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { useAuth } from '../../../context/AuthContext';
import { Users, FileText, Calendar, TrendingUp, ShieldAlert, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { dashboardService } from '../../../lib/services/dashboardService';
import type { EmployerKPIs } from '../../../lib/services/dashboardService';
import { employerService } from '../../../lib/services/employerService';
import type { Company } from '../../../types/employer.types';
import { CompanyCompletionMeter } from '../../../components/dashboard/CompanyCompletionMeter';
import { Loading } from '../../../components/ui/Loading';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<EmployerKPIs | null>(null);

  const headers = [
    { key: 'name', label: 'Candidate / Role' },
    { key: 'exp', label: 'Experience' },
    { key: 'match', label: 'Match Index' },
    { key: 'status', label: 'Stage' },
  ];

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const comp = await employerService.getCompanyByEmployer(user.id);
        setCompany(comp);
        const data = await dashboardService.getEmployerKPIs(user.id);
        setKpis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  if (loading || !kpis) {
    return <Loading label="Fetching employer workspace..." />;
  }

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-250 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified Listing</Badge>;
      case 'rejected':
        return <Badge variant="danger" className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="accent" className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Pending Verification</Badge>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-500/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <Badge className="bg-white/20 text-white border-none py-0.5" size="sm">Employer Workspace</Badge>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-tight">
              Manage {company?.name || 'InnoTech Solutions'} Talent
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Vetting, intelligence reports, and team collaboration modules.
            </p>
          </div>
          <div className="shrink-0 self-start">
            {getVerificationBadge(company?.verification_status)}
          </div>
        </div>
      </div>

      {/* Completion Meter */}
      <CompanyCompletionMeter percentage={kpis.completionScore} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {[
          { label: 'Active Postings', value: kpis.activePostingsCount.toString(), icon: <FileText className="w-5 h-5 text-primary" />, desc: 'Approved vacancies' },
          { label: 'Recruiters Vetted', value: kpis.teamCount.toString(), icon: <Users className="w-5 h-5 text-secondary" />, desc: 'Active team seats' },
          { label: 'Interviews Booked', value: kpis.interviewsCount.toString(), icon: <Calendar className="w-5 h-5 text-accent" />, desc: 'Next: Today at 2:00 PM' },
        ].map((stat) => (
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

      {/* Grid: Candidates & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Candidates List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">Active Candidates</h2>
            <Badge variant="primary" size="sm">Updated 10m ago</Badge>
          </div>
          <Table headers={headers}>
            {kpis.applicants.map((app, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{app.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium leading-tight">{app.role}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-600 font-semibold">{app.experience}</TableCell>
                <TableCell>
                  <Badge variant="primary" size="sm">{app.match}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm">{app.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>

        {/* Talent Scout Widget */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">Talent Scout Query</h2>
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-accent uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Smart filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-b border-gray-100 border-solid pb-3">
                <p className="text-xs font-bold text-gray-900">Compensation Audit</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Average engineering salaries in SF decreased **2%** this quarter. Adjust listings to increase volume.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-900">Scout Match triggers</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  3 candidates with verified **Supabase sync profiles** match your Open stack requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
