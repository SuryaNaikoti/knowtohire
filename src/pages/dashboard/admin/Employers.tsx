// KnowToHire V1.0 — Employer Directory & Governance (Redesigned)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { StaggerGrid, StaggerItem } from '../../../components/ui/Motion';
import { supabase } from '../../../lib/supabase';
import {
  Building2,
  Globe,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  ShieldCheck,
  Clock,
  ChevronRight,
  Briefcase,
  ChevronDown,
  Check,
  Download,
  Calendar,
  Users
} from 'lucide-react';

interface EmployerCompanyDetail {
  id: string;
  name: string;
  industry: string;
  website_url?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  company_size?: string;
  created_at?: string;
  manager?: string;
  active_jobs?: number;
  recruiter_count?: number;
}

const DEMO_EMPLOYERS: EmployerCompanyDetail[] = [
  { id: 'comp-1', name: 'GreenEarth Consultants Pvt Ltd', industry: 'Environmental & ESG Advisory', website_url: 'https://greenearth.com', verification_status: 'verified', company_size: '250–500 Employees', created_at: '2026-07-15T10:00:00Z', manager: 'Rajeev Nair', active_jobs: 14, recruiter_count: 8 },
  { id: 'comp-2', name: 'PatentNexus India', industry: 'Legal & Intellectual Property', website_url: 'https://patentnexus.in', verification_status: 'verified', company_size: '50–200 Employees', created_at: '2026-07-20T10:00:00Z', manager: 'Unassigned', active_jobs: 6, recruiter_count: 3 },
  { id: 'comp-3', name: 'SustainEdge Solutions', industry: 'Sustainability Consulting', website_url: 'https://sustainedge.com', verification_status: 'pending', company_size: '10–50 Employees', created_at: '2026-08-01T10:00:00Z', manager: 'Unassigned', active_jobs: 3, recruiter_count: 2 },
  { id: 'comp-4', name: 'CloudStack Technologies', industry: 'Information Technology', website_url: 'https://cloudstack.io', verification_status: 'verified', company_size: '500–1000 Employees', created_at: '2026-06-10T10:00:00Z', manager: 'Rajeev Nair', active_jobs: 27, recruiter_count: 12 },
  { id: 'comp-5', name: 'FinTech Dynamics Ltd', industry: 'Financial Technology', website_url: 'https://fintechdyn.com', verification_status: 'pending', company_size: '50–200 Employees', created_at: '2026-08-05T10:00:00Z', manager: 'Unassigned', active_jobs: 8, recruiter_count: 4 },
  { id: 'comp-6', name: 'AeroSpace Innovations', industry: 'Aerospace & Defense', website_url: 'https://aerospace-inn.com', verification_status: 'rejected', company_size: '1000+ Employees', created_at: '2026-07-01T10:00:00Z', manager: 'Unassigned', active_jobs: 0, recruiter_count: 0 },
  { id: 'comp-7', name: 'HealthPlus Diagnostics', industry: 'Healthcare & Life Sciences', website_url: 'https://healthplus.co', verification_status: 'verified', company_size: '200–500 Employees', created_at: '2026-06-25T10:00:00Z', manager: 'Rajeev Nair', active_jobs: 11, recruiter_count: 5 },
];

export const Employers: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<EmployerCompanyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search/Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<'status' | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (err) throw err;

      const formatted = (data || []).map((comp: any) => {
        const localStatus = localStorage.getItem(`kth_comp_status_${comp.id}`) as any;
        const manager = localStorage.getItem(`kth_comp_manager_${comp.id}`) || 'Unassigned';

        return {
          id: comp.id,
          name: comp.name || 'GreenEarth Consultants Pvt Ltd',
          industry: comp.industry || 'Environmental Consulting',
          website_url: comp.website_url || 'https://greenearth.com',
          verification_status: localStatus || comp.verification_status || 'verified',
          company_size: comp.company_size || '50–200 Employees',
          created_at: comp.created_at || new Date().toISOString(),
          manager,
          active_jobs: comp.active_jobs || 0,
          recruiter_count: comp.recruiter_count || 0,
        };
      });

      setCompanies(formatted.length > 0 ? formatted : DEMO_EMPLOYERS);
    } catch (err: any) {
      console.error(err);
      setCompanies(DEMO_EMPLOYERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.industry.toLowerCase().includes(lower) ||
        (c.website_url || '').toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.verification_status === statusFilter);
    }
    return result;
  }, [search, statusFilter, companies]);

  const stats = useMemo(() => {
    const total = companies.length;
    const verified = companies.filter(c => c.verification_status === 'verified').length;
    const pending = companies.filter(c => c.verification_status === 'pending').length;
    const rejected = companies.filter(c => c.verification_status === 'rejected').length;
    return { total, verified, pending, rejected };
  }, [companies]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '06 Aug 2026';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '06 Aug 2026';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase() || 'CO';
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/70">
          <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/70">
        <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Audit
      </span>
    );
  };

  const statusLabels: Record<string, string> = {
    all: 'All Verification States',
    verified: 'Verified',
    pending: 'Pending Audit',
    rejected: 'Rejected',
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 rounded-2xl border border-sky-200/70 text-sky-600 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            Employer Directory & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit employer credentials, manage account verification, and oversee corporate governance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold h-9 px-4 rounded-xl border-slate-200 bg-white gap-2"
            onClick={() => {
              const csv = ['Company,Industry,Status,Registered'].concat(
                companies.map(c => `"${c.name}","${c.industry}","${c.verification_status}","${formatDate(c.created_at)}"`)
              ).join('\n');
              const a = document.createElement('a');
              a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
              a.download = 'employers.csv';
              a.click();
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">Total Employers</p>
              <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.total}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Registered Entities</p>
            </div>
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">Verified Partners</p>
              <h3 className="text-3xl font-black text-emerald-600 font-heading mt-2">{stats.verified}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Audited & Approved</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">Pending Audit</p>
              <h3 className="text-3xl font-black text-amber-600 font-heading mt-2">{stats.pending}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Awaiting Review</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">Rejected</p>
              <h3 className="text-3xl font-black text-rose-600 font-heading mt-2">{stats.rejected}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Failed Verification</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-11 pr-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none h-10 transition-all shadow-2xs"
            placeholder="Search by company name, industry, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Custom Status Dropdown */}
        <div className="relative w-full sm:w-auto" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className="w-full sm:w-56 px-4 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl text-xs font-bold text-slate-700 h-10 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>{statusLabels[statusFilter]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {openDropdown === 'status' && (
            <div className="absolute left-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 text-xs font-semibold animate-fade-in-up">
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setStatusFilter(key); setOpenDropdown(null); }}
                  className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${statusFilter === key ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {label}
                  {statusFilter === key && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {(search || statusFilter !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="text-xs font-bold h-9 px-3 rounded-xl border-slate-200 bg-white gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Company Table */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between animate-pulse gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                    <div className="space-y-2">
                      <div className="w-40 h-4 bg-slate-100 rounded-md" />
                      <div className="w-24 h-3 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-slate-100 rounded-full" />
                  <div className="w-24 h-8 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 font-heading">No employers found</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Try adjusting your search query or verification filter.
                </p>
              </div>
              <Button onClick={() => { setSearch(''); setStatusFilter('all'); }} variant="outline" size="sm" className="text-xs font-bold rounded-xl h-9 px-4">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-5">Company</th>
                      <th className="py-4 px-5">Industry & Scale</th>
                      <th className="py-4 px-5">Active Jobs</th>
                      <th className="py-4 px-5">Verification</th>
                      <th className="py-4 px-5">Registered</th>
                      <th className="py-4 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCompanies.map((comp) => {
                      const initials = getInitials(comp.name);
                      return (
                        <tr
                          key={comp.id}
                          onClick={() => navigate(`/dashboard/admin/employers/${comp.id}`)}
                          className="hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer group"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 border-2 border-white shadow-2xs flex items-center justify-center font-black text-xs shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm leading-snug truncate group-hover:text-emerald-600 transition-colors">{comp.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                                  <Globe className="w-3 h-3 text-slate-300 shrink-0" />
                                  {comp.website_url?.replace('https://', '')}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <p className="font-semibold text-slate-800 leading-snug">{comp.industry}</p>
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-slate-300" />
                              {comp.company_size}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {comp.active_jobs ?? 0} Jobs
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            {getStatusBadge(comp.verification_status)}
                          </td>

                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              {formatDate(comp.created_at)}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              className="bg-slate-900 hover:bg-slate-700 text-white font-bold text-xs shadow-xs gap-1.5 rounded-xl h-8 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/admin/employers/${comp.id}`);
                              }}
                            >
                              Audit Profile <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredCompanies.map((comp) => {
                  const initials = getInitials(comp.name);
                  return (
                    <div
                      key={comp.id}
                      onClick={() => navigate(`/dashboard/admin/employers/${comp.id}`)}
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm leading-snug truncate">{comp.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">{comp.industry}</p>
                        </div>
                        {getStatusBadge(comp.verification_status)}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-medium text-slate-400">{comp.company_size} · {comp.active_jobs ?? 0} Active Jobs</span>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">Audit Profile <ChevronRight className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer count */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-500">
                  Showing <strong className="text-slate-900">{filteredCompanies.length}</strong> of <strong className="text-slate-900">{companies.length}</strong> employer entities
                </span>
                {(search || statusFilter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setStatusFilter('all'); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employers;
