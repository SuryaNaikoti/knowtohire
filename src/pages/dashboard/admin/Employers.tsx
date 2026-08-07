import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { StaggerGrid, StaggerItem, MotionCard } from '../../../components/ui/Motion';
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
  X,
  UserCheck,
  Briefcase
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
}

export const Employers: React.FC = () => {
  const [companies, setCompanies] = useState<EmployerCompanyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<EmployerCompanyDetail | null>(null);

  // Search/Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedManager, setAssignedManager] = useState('Unassigned');

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
          company_size: comp.company_size || '50-200 Employees',
          created_at: comp.created_at || new Date().toISOString(),
          manager,
        };
      });

      setCompanies(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch corporate entities database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) ||
        c.industry.toLowerCase().includes(lower)
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
    const enterprise = companies.filter(c => (c.company_size || '').includes('50') || (c.company_size || '').includes('200')).length;
    return { total, verified, pending, enterprise };
  }, [companies]);

  const handleUpdateStatus = (compId: string, status: 'verified' | 'rejected') => {
    localStorage.setItem(`kth_comp_status_${compId}`, status);
    setCompanies(prev => prev.map(c => c.id === compId ? { ...c, verification_status: status } : c));
    if (selectedCompany && selectedCompany.id === compId) {
      setSelectedCompany(prev => prev ? { ...prev, verification_status: status } : null);
    }
    setSuccess(`Corporate verification state set to ${status}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAssignManager = (compId: string, mgr: string) => {
    localStorage.setItem(`kth_comp_manager_${compId}`, mgr);
    setCompanies(prev => prev.map(c => c.id === compId ? { ...c, manager: mgr } : c));
    if (selectedCompany && selectedCompany.id === compId) {
      setSelectedCompany(prev => prev ? { ...prev, manager: mgr } : null);
    }
    setSuccess(`Account manager allocated to ${mgr}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  useEffect(() => {
    if (selectedCompany) {
      setAssignedManager(selectedCompany.manager || 'Unassigned');
    }
  }, [selectedCompany]);

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

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 rounded-2xl border border-sky-200/70 text-sky-600 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            Employer Directory & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit employer credentials, assign strategic account managers, and verify corporate entities.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Summary Cards (Staggered Motion Entrance) */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Employer Entities</p>
              <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.total}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Verified Organizations</p>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Verified Partners</p>
              <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.verified}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Audited Employers</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Pending Audit</p>
              <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.pending}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Awaiting Review</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-purple-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Enterprise Scale</p>
              <h3 className="text-3xl font-black text-slate-900 font-heading mt-2">{stats.enterprise}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">50+ Member Tier</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-11 pr-4 bg-slate-50/90 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none h-10 transition-all"
            placeholder="Search employers by company name, industry, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'all', label: 'All Verification States' },
              { value: 'verified', label: 'Verified' },
              { value: 'pending', label: 'Pending Audit' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Employers Table */}
        <div className={`${selectedCompany ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between animate-pulse gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-4 bg-slate-100 rounded"></div>
                          <div className="w-48 h-3 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-5">Company Entity</th>
                        <th className="py-4 px-5">Industry & Scale</th>
                        <th className="py-4 px-5">Verification</th>
                        <th className="py-4 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredCompanies.map((comp) => {
                        const initials = getInitials(comp.name);
                        const isSelected = selectedCompany?.id === comp.id;

                        return (
                          <tr
                            key={comp.id}
                            onClick={() => setSelectedCompany(comp)}
                            className={`hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-sky-50/40' : ''}`}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 border-2 border-white shadow-2xs flex items-center justify-center font-black text-xs shrink-0">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 text-sm leading-snug truncate">{comp.name}</p>
                                  <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                                    <Globe className="w-3 h-3 text-slate-400" /> {comp.website_url}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <p className="font-semibold text-slate-800 leading-snug">{comp.industry}</p>
                              <span className="text-[10px] text-slate-500 font-medium">{comp.company_size}</span>
                            </td>

                            <td className="py-4 px-5">
                              {comp.verification_status === 'verified' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/90 px-2.5 py-1 rounded-full border border-emerald-200/70">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified
                                </span>
                              ) : comp.verification_status === 'rejected' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50/90 px-2.5 py-1 rounded-full border border-rose-200/70">
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50/90 px-2.5 py-1 rounded-full border border-amber-200/70">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5 text-right">
                              <Button size="sm" variant="outline" className="text-xs font-bold h-8 px-3 rounded-xl bg-white border-slate-200">
                                Audit <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Employer Audit Side-Panel */}
        {selectedCompany && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" /> Employer Verification Audit
              </h3>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">{selectedCompany.name}</h4>
              <p className="text-xs font-medium text-slate-500">{selectedCompany.industry} • {selectedCompany.company_size}</p>
              <p className="text-xs text-sky-600 font-semibold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> {selectedCompany.website_url}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Governance Actions</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleUpdateStatus(selectedCompany.id, 'verified')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 rounded-xl flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Grant Verification
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedCompany.id, 'rejected')}
                  size="sm"
                  variant="outline"
                  className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 text-xs font-bold h-9 px-4 rounded-xl flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Reject Organization
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700">Account Manager Allocation</label>
                <select
                  value={assignedManager}
                  onChange={(e) => {
                    setAssignedManager(e.target.value);
                    handleAssignManager(selectedCompany.id, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Rajeev Nair (Super Admin)">Rajeev Nair (Super Admin)</option>
                  <option value="Priya Sharma (Senior CSM)">Priya Sharma (Senior CSM)</option>
                  <option value="Vikram Sethi (Enterprise Lead)">Vikram Sethi (Enterprise Lead)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employers;
