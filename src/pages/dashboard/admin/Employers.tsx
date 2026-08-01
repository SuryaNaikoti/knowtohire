import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { Building2, Globe, CheckCircle2, AlertOctagon, XCircle, ChevronRight, X, User } from 'lucide-react';

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
  const [filteredCompanies, setFilteredCompanies] = useState<EmployerCompanyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<EmployerCompanyDetail | null>(null);

  // Search/Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedManager, setAssignedManager] = useState('');

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
        // Load simulated fields from localStorage
        const localStatus = localStorage.getItem(`kth_comp_status_${comp.id}`) as any;
        const manager = localStorage.getItem(`kth_comp_manager_${comp.id}`) || 'None';

        return {
          id: comp.id,
          name: comp.name || 'Anonymous Employer',
          industry: comp.industry || 'Tech Stack Vetting',
          website_url: comp.website_url || '',
          verification_status: localStatus || comp.verification_status || 'pending',
          company_size: comp.company_size || '10-49 Employees',
          created_at: comp.created_at,
          manager,
        };
      });

      setCompanies(formatted);
      setFilteredCompanies(formatted);
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

  useEffect(() => {
    let result = companies;
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) ||
        c.industry.toLowerCase().includes(lower) ||
        (c.website_url && c.website_url.toLowerCase().includes(lower))
      );
    }
    if (statusFilter) {
      result = result.filter(c => c.verification_status === statusFilter);
    }
    setFilteredCompanies(result);
  }, [search, statusFilter, companies]);

  const handleUpdateVerification = (compId: string, status: 'verified' | 'rejected' | 'pending') => {
    localStorage.setItem(`kth_comp_status_${compId}`, status);
    setCompanies(prev => prev.map(c => c.id === compId ? { ...c, verification_status: status } : c));
    if (selectedCompany && selectedCompany.id === compId) {
      setSelectedCompany(prev => prev ? { ...prev, verification_status: status } : null);
    }
    setSuccess(`Company verification status successfully updated to ${status}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAssignManager = () => {
    if (!selectedCompany) return;
    localStorage.setItem(`kth_comp_manager_${selectedCompany.id}`, assignedManager);
    setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? { ...c, manager: assignedManager } : c));
    setSelectedCompany(prev => prev ? { ...prev, manager: assignedManager } : null);
    setSuccess(`Account manager assigned successfully.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  useEffect(() => {
    if (selectedCompany) {
      setAssignedManager(selectedCompany.manager || 'None');
    }
  }, [selectedCompany]);

  if (loading) return <Loading label="Retrieving corporate profiles..." />;

  const tableHeaders = [
    { key: 'details', label: 'Company details' },
    { key: 'industry', label: 'Sector & Scale' },
    { key: 'status', label: 'Moderation status' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Employer Administration
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Audit employer accounts, review company details, verify RLS states, and manage verification badges.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Controls toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none"
            placeholder="Search companies by name, website, sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Companies list */}
        <div className={`${selectedCompany ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {filteredCompanies.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <AlertOctagon className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No companies matched your filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {filteredCompanies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">{c.name}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> {c.website_url || 'No Website'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 font-semibold">{c.industry}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">{c.company_size}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.verification_status === 'verified'
                            ? 'secondary'
                            : c.verification_status === 'rejected'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {c.verification_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="bg-white text-[10px] font-bold" onClick={() => setSelectedCompany(c)}>
                        Manage <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Company Details Workspace Panel */}
        {selectedCompany && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-solid border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {selectedCompany.name}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">{selectedCompany.industry}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setSelectedCompany(null)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Account Manager Assignment */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" /> Account Manager
                </label>
                <div className="flex gap-2">
                  <Select
                    value={assignedManager}
                    onChange={(e) => setAssignedManager(e.target.value)}
                    className="flex-1 bg-white text-xs h-9"
                  >
                    <option value="None">Unassigned</option>
                    <option value="Sarah Vance">Sarah Vance (Enterprise Lead)</option>
                    <option value="Alex Chen">Alex Chen (Account Manager)</option>
                    <option value="Jessica Miller">Jessica Miller (Support)</option>
                  </Select>
                  <Button size="sm" onClick={handleAssignManager} className="text-[10px] font-bold h-9">
                    Assign
                  </Button>
                </div>
              </div>

              {/* API and Integration Keys */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200 border-solid">
                <h4 className="text-xs font-black text-gray-700">Developer Integrations</h4>
                <p className="text-[10px] text-gray-400 font-medium">Verify or reset API credentials for job scraping triggers.</p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="password"
                    disabled
                    value="••••••••••••••••••••••••••••••••"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 bg-gray-100 border-solid"
                  />
                  <Button size="sm" variant="outline" className="bg-white text-[10px] font-bold h-8" onClick={() => alert('API credentials reset successfully!')}>
                    Reset Key
                  </Button>
                </div>
              </div>
            </div>

            {/* Verification status controls */}
            <div className="border-t border-solid border-gray-100 pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold bg-white text-emerald-700 border-emerald-250 hover:bg-emerald-50"
                  onClick={() => handleUpdateVerification(selectedCompany.id, 'verified')}
                  disabled={selectedCompany.verification_status === 'verified'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify Entity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold bg-white text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => handleUpdateVerification(selectedCompany.id, 'rejected')}
                  disabled={selectedCompany.verification_status === 'rejected'}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Entity
                </Button>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-bold border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => handleUpdateVerification(selectedCompany.id, 'pending')}
                disabled={selectedCompany.verification_status === 'pending'}
              >
                Reset to Pending Review
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employers;
