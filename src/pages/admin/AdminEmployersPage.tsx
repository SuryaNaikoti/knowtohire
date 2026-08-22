import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminCompanyRecord } from '@/services/adminService';
import { Building2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const AdminEmployersPage: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompanyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const handleUpdateStatus = async (companyId: string, status: 'verified' | 'rejected' | 'pending_review') => {
    await adminService.updateCompanyVerification(companyId, status);
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, verification_status: status } : c))
    );
  };

  return (
    <AdminShell title="Employer Enterprise Verification" currentPath="/admin/employers">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">Registered Enterprise Employers</h2>
            <p className="text-xs text-kth-slate-500">Review verification certificates, corporate details, and grant ATS publishing rights.</p>
          </div>
          <span className="text-xs font-mono text-kth-slate-500 font-bold">{companies.length} Companies</span>
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading employer enterprises...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">
              No registered enterprise employers found.
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-kth-slate-100">
                {companies.map((c) => (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-kth-primary-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-kth-slate-900">{c.name}</h4>
                          <p className="text-xs text-kth-slate-500">{c.industry || 'Environmental & ESG'}</p>
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

                    <div className="text-xs text-kth-slate-600 flex items-center justify-between">
                      <span>HQ: {c.headquarters_location || 'India'}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {c.verification_status !== 'verified' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 min-h-[38px]"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(c.id, 'verified')}
                        >
                          Verify
                        </Button>
                      )}
                      {c.verification_status !== 'rejected' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 min-h-[38px]"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
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
                      <th className="p-4">Enterprise Name</th>
                      <th className="p-4">Industry Sector</th>
                      <th className="p-4">Headquarters</th>
                      <th className="p-4">Verification Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kth-slate-100">
                    {companies.map((c) => (
                      <tr key={c.id} className="hover:bg-kth-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-kth-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-kth-primary-600" />
                          {c.name}
                        </td>
                        <td className="p-4 text-kth-slate-600">{c.industry || 'Environmental & ESG'}</td>
                        <td className="p-4 text-kth-slate-600">{c.headquarters_location || 'India'}</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              c.verification_status === 'verified'
                                ? 'emerald'
                                : c.verification_status === 'rejected'
                                ? 'rose'
                                : 'amber'
                            }
                            className="capitalize"
                          >
                            {c.verification_status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {c.verification_status !== 'verified' && (
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                onClick={() => handleUpdateStatus(c.id, 'verified')}
                              >
                                Verify
                              </Button>
                            )}
                            {c.verification_status !== 'rejected' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                leftIcon={<XCircle className="w-3.5 h-3.5" />}
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
