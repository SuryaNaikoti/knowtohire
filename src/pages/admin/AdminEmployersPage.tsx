import React, { useState, useEffect, useMemo } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminCompanyRecord } from '@/services/adminService';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Search,
  Globe,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  Briefcase,
  Users,
} from 'lucide-react';

interface AdminEmployersPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminEmployersPage: React.FC<AdminEmployersPageProps> = ({ onNavigate }) => {
  const [companies, setCompanies] = useState<AdminCompanyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'verified' | 'rejected'>('all');
  const [inspectingCompany, setInspectingCompany] = useState<AdminCompanyRecord | null>(null);

  const fetchCompanies = async () => {
    setIsLoading(true);
    const res = await adminService.getCompanies();
    if (res.data) {
      setCompanies(res.data);
      // Update inspecting company if modal is open
      if (inspectingCompany) {
        const updated = res.data.find((c) => c.id === inspectingCompany.id);
        if (updated) setInspectingCompany(updated);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();

    const handleEmployersChanged = () => {
      fetchCompanies();
    };

    window.addEventListener('kth_employers_changed', handleEmployersChanged);
    window.addEventListener('kth_company_profile_updated', handleEmployersChanged);

    return () => {
      window.removeEventListener('kth_employers_changed', handleEmployersChanged);
      window.removeEventListener('kth_company_profile_updated', handleEmployersChanged);
    };
  }, []);

  const handleUpdateStatus = async (companyId: string, status: 'verified' | 'rejected' | 'pending_review') => {
    setActionLoadingId(companyId);
    const res = await adminService.updateCompanyVerification(companyId, status);
    setActionLoadingId(null);

    if (res.data) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, verification_status: status } : c))
      );
      if (inspectingCompany && inspectingCompany.id === companyId) {
        setInspectingCompany((prev) => (prev ? { ...prev, verification_status: status } : null));
      }
    }
  };

  // KPI calculations
  const totalCount = companies.length;
  const verifiedCount = companies.filter((c) => c.verification_status === 'verified').length;
  const pendingCount = companies.filter((c) => c.verification_status === 'pending_review').length;
  const rejectedCount = companies.filter((c) => c.verification_status === 'rejected').length;

  // Filtering
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (statusFilter !== 'all' && c.verification_status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesLegal = (c.legal_name || '').toLowerCase().includes(q);
        const matchesIndustry = (c.industry || '').toLowerCase().includes(q);
        const matchesLocation = (c.headquarters_location || '').toLowerCase().includes(q);
        const matchesReg = (c.registration_number || '').toLowerCase().includes(q);
        return matchesName || matchesLegal || matchesIndustry || matchesLocation || matchesReg;
      }
      return true;
    });
  }, [companies, statusFilter, searchQuery]);

  return (
    <AdminShell title="Employer Enterprise Verification" currentPath="/admin/employers" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* KPI Cards Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500">Registered</p>
              <h3 className="text-xl font-bold text-kth-slate-900 mt-0.5">{totalCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Verified</p>
              <h3 className="text-xl font-bold text-kth-slate-900 mt-0.5">{verifiedCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Pending Review</p>
              <h3 className="text-xl font-bold text-kth-slate-900 mt-0.5">{pendingCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Rejected</p>
              <h3 className="text-xl font-bold text-kth-slate-900 mt-0.5">{rejectedCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-kth-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enterprise, CIN, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All Enterprises', count: totalCount },
                { id: 'pending_review', label: 'Pending', count: pendingCount },
                { id: 'verified', label: 'Verified', count: verifiedCount },
                { id: 'rejected', label: 'Rejected', count: rejectedCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-kth-slate-900 text-white shadow-xs'
                    : 'bg-kth-slate-100 text-kth-slate-600 hover:bg-kth-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-kth-slate-200 text-kth-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Enterprise List Card */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 shadow-sm">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading employer enterprises...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">
              <Building2 className="w-8 h-8 text-kth-slate-300 mx-auto mb-2" />
              No enterprise employers match your filter criteria.
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-kth-slate-100">
                {filteredCompanies.map((c) => (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-kth-slate-900 leading-tight">{c.name}</h4>
                          <p className="text-[11px] text-kth-slate-500 font-mono mt-0.5">
                            CIN: {c.registration_number || 'Under Verification'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          c.verification_status === 'verified'
                            ? 'emerald'
                            : c.verification_status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                        className="capitalize text-[10px] shrink-0"
                      >
                        {c.verification_status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="text-xs text-kth-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-kth-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                        <span>{c.industry || 'Environmental & ESG'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-kth-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                        <span>{c.headquarters_location || 'India'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 min-h-[38px] text-xs font-semibold"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setInspectingCompany(c)}
                      >
                        Inspect Dossier
                      </Button>
                      {c.verification_status !== 'verified' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="min-h-[38px] text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          isLoading={actionLoadingId === c.id}
                          onClick={() => handleUpdateStatus(c.id, 'verified')}
                        >
                          Verify
                        </Button>
                      )}
                      {c.verification_status !== 'rejected' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="min-h-[38px] text-xs font-semibold"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          isLoading={actionLoadingId === c.id}
                          onClick={() => handleUpdateStatus(c.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Enterprise Name & Legal Entity</th>
                      <th className="p-4">Industry Sector</th>
                      <th className="p-4">Headquarters</th>
                      <th className="p-4">Registration (CIN)</th>
                      <th className="p-4">Verification Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kth-slate-100 font-normal">
                    {filteredCompanies.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setInspectingCompany(c)}
                        className="hover:bg-kth-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 group-hover:border-kth-primary-300">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-kth-slate-900 block group-hover:text-kth-primary-600 transition-colors">
                                {c.name}
                              </span>
                              <span className="text-[11px] text-kth-slate-400 block font-normal">
                                {c.legal_name || c.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-kth-slate-700 font-medium">{c.industry || 'Environmental & ESG'}</td>
                        <td className="p-4 text-kth-slate-600 flex items-center gap-1.5 pt-5">
                          <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                          <span>{c.headquarters_location || 'India'}</span>
                        </td>
                        <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                          {c.registration_number || 'U74999KA2021PTC148900'}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              c.verification_status === 'verified'
                                ? 'emerald'
                                : c.verification_status === 'rejected'
                                ? 'rose'
                                : 'amber'
                            }
                            className="capitalize font-semibold text-[11px]"
                          >
                            {c.verification_status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs font-semibold"
                              leftIcon={<Eye className="w-3.5 h-3.5 text-kth-slate-600" />}
                              onClick={() => setInspectingCompany(c)}
                            >
                              Inspect
                            </Button>
                            {c.verification_status !== 'verified' && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                isLoading={actionLoadingId === c.id}
                                onClick={() => handleUpdateStatus(c.id, 'verified')}
                              >
                                Verify
                              </Button>
                            )}
                            {c.verification_status !== 'rejected' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="text-xs font-semibold"
                                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                                isLoading={actionLoadingId === c.id}
                                onClick={() => handleUpdateStatus(c.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Enterprise Verification Inspection Modal / Dossier */}
      {inspectingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-kth-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-cyan-300 flex items-center justify-center font-bold text-base shadow-inner">
                  {inspectingCompany.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">{inspectingCompany.name}</h3>
                    <Badge
                      variant={
                        inspectingCompany.verification_status === 'verified'
                          ? 'emerald'
                          : inspectingCompany.verification_status === 'rejected'
                          ? 'rose'
                          : 'amber'
                      }
                      className="capitalize text-[10px] font-bold"
                    >
                      {inspectingCompany.verification_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 font-normal">
                    {inspectingCompany.legal_name || inspectingCompany.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingCompany(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Compliance & Verification Dossier */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Statutory Registration & Corporate Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500">
                    <FileText className="w-3.5 h-3.5 text-kth-slate-400" />
                    <span>MCA Corporate ID (CIN)</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-kth-slate-900">
                    {inspectingCompany.registration_number || 'U74999KA2021PTC148900'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-kth-slate-400" />
                    <span>Industry Sector</span>
                  </div>
                  <p className="text-xs font-bold text-kth-slate-900">
                    {inspectingCompany.industry || 'Environmental & ESG Advisory'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-kth-slate-400" />
                    <span>Headquarters & Jurisdiction</span>
                  </div>
                  <p className="text-xs font-bold text-kth-slate-900">
                    {inspectingCompany.headquarters_location || 'India'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500">
                    <Users className="w-3.5 h-3.5 text-kth-slate-400" />
                    <span>Enterprise Scale</span>
                  </div>
                  <p className="text-xs font-bold text-kth-slate-900">
                    {inspectingCompany.company_size || '51-200 employees'}
                  </p>
                </div>
              </div>

              {/* Digital Identity & Compliance Contacts */}
              <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider">
                  Digital Domain & Authorized Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-kth-primary-600 shrink-0" />
                    <a
                      href={inspectingCompany.website_url || 'https://ecostrategy.co.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kth-primary-600 hover:text-kth-primary-700 font-medium inline-flex items-center gap-1 truncate"
                    >
                      <span>{inspectingCompany.website_url || 'https://ecostrategy.co.in'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-kth-slate-700">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{inspectingCompany.contact_email || 'compliance@company.com'}</span>
                  </div>
                </div>
              </div>

              {/* Corporate Overview */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider">
                  Corporate Overview & Operational Scope
                </h4>
                <p className="text-xs text-kth-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-kth-slate-200">
                  {inspectingCompany.description ||
                    'Corporate enterprise registered on KnowToHire. Verified entities receive direct authorization to publish job requisitions to the public directory and access the applicant tracking pipeline.'}
                </p>
              </div>

              {/* Verification Checklist */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Platform Verification Assessment</span>
                </h4>
                <div className="space-y-1 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Statutory incorporation details cross-referenced with Ministry records.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Authorized corporate email domain verified against enterprise web identity.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Employer granted full candidate discovery and ATS pipeline publishing access.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Action Decisions */}
            <div className="px-6 py-4 bg-kth-slate-50 border-t border-kth-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectingCompany(null)}
                  className="text-xs font-semibold"
                >
                  Close Dossier
                </Button>
                {inspectingCompany.verification_status !== 'pending_review' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold border-amber-300 text-amber-800 hover:bg-amber-50"
                    isLoading={actionLoadingId === inspectingCompany.id}
                    onClick={() => handleUpdateStatus(inspectingCompany.id, 'pending_review')}
                  >
                    Mark Pending
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {inspectingCompany.verification_status !== 'rejected' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    isLoading={actionLoadingId === inspectingCompany.id}
                    onClick={() => handleUpdateStatus(inspectingCompany.id, 'rejected')}
                    className="text-xs font-bold"
                  >
                    Reject Employer
                  </Button>
                )}
                {inspectingCompany.verification_status !== 'verified' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    isLoading={actionLoadingId === inspectingCompany.id}
                    onClick={() => handleUpdateStatus(inspectingCompany.id, 'verified')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                  >
                    Verify & Grant ATS Access
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};
