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
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Briefcase,
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

  const fetchCompanies = async () => {
    setIsLoading(true);
    const res = await adminService.getCompanies();
    if (res.data) {
      setCompanies(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();

    const handleCompChange = () => {
      fetchCompanies();
    };
    window.addEventListener('kth_companies_changed', handleCompChange);
    return () => {
      window.removeEventListener('kth_companies_changed', handleCompChange);
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
                        onClick={() => {
                          if (onNavigate) onNavigate(`/admin/employers/${c.id}`);
                          else window.location.href = `/admin/employers/${c.id}`;
                        }}
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
                        onClick={() => {
                          if (onNavigate) onNavigate(`/admin/employers/${c.id}`);
                          else window.location.href = `/admin/employers/${c.id}`;
                        }}
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
                              onClick={() => {
                                if (onNavigate) onNavigate(`/admin/employers/${c.id}`);
                                else window.location.href = `/admin/employers/${c.id}`;
                              }}
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
    </AdminShell>
  );
};
