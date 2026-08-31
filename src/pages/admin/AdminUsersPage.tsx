import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AdminCandidateInspectModal } from '@/components/admin/AdminCandidateInspectModal';
import { adminService, AdminUserRecord } from '@/services/adminService';
import { Search, Loader2, Eye, ShieldCheck } from 'lucide-react';

export interface AdminUsersPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Candidate Inspection Modal State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const res = await adminService.getUsers(searchTerm, roleFilter);
    if (res.data) {
      setUsers(res.data);
    }
    setIsLoading(false);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 250);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  useEffect(() => {
    const handleSync = () => {
      fetchUsers();
    };

    window.addEventListener('kth_users_changed', handleSync);
    window.addEventListener('kth_profile_updated', handleSync);

    return () => {
      window.removeEventListener('kth_users_changed', handleSync);
      window.removeEventListener('kth_profile_updated', handleSync);
    };
  }, [fetchUsers]);

  const handleToggleStatus = async (user: AdminUserRecord) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const res = await adminService.updateUserStatus(user.id, nextStatus);
    if (res.data) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
    }
  };

  const handleVerifyCandidate = async (user: AdminUserRecord) => {
    const res = await adminService.verifyCandidateAccount(user.id);
    if (res.data) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)));
    }
  };

  const handleInspectCandidate = (userId: string) => {
    setSelectedCandidateId(userId);
    setIsCandidateModalOpen(true);
  };

  const handleInspectEmployer = (employerId: string) => {
    const targetPath = `/admin/employers?inspect=${employerId}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <AdminShell title="User Directory Management" currentPath="/admin/users">
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search user by name or email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'candidate', label: 'Candidates' },
                  { value: 'employer', label: 'Employers' },
                  { value: 'admin', label: 'Administrators' },
                ]}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-kth-slate-500 whitespace-nowrap">
            {users.length} Users Found
          </span>
        </div>

        {/* Users Table */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Querying user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">
              No users matching the specified search criteria.
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-kth-slate-100">
                {users.map((u) => (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => u.role === 'candidate' && handleInspectCandidate(u.id)}
                        className={u.role === 'candidate' ? 'cursor-pointer group' : ''}
                      >
                        <h4 className="font-bold text-sm text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors">
                          {u.full_name}
                        </h4>
                        <p className="text-xs text-kth-slate-500 font-mono break-all">{u.email}</p>
                      </div>
                      <Badge
                        variant={u.role === 'admin' ? 'rose' : u.role === 'employer' ? 'indigo' : 'cyan'}
                        className="capitalize font-mono text-[10px] shrink-0"
                      >
                        {u.role}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-kth-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span>Status:</span>
                        <Badge
                          variant={u.status === 'active' ? 'emerald' : u.status === 'suspended' ? 'rose' : 'amber'}
                          className="capitalize text-[10px]"
                        >
                          {u.status}
                        </Badge>
                      </div>
                      <span className="font-mono text-[11px]">
                        {formatDate(u.created_at)}
                      </span>
                    </div>

                    {/* Mobile Actions */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {u.role === 'candidate' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-h-[36px] font-semibold text-xs"
                          onClick={() => handleInspectCandidate(u.id)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Candidate
                        </Button>
                      )}

                      {u.role === 'employer' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-h-[36px] font-semibold text-xs"
                          onClick={() => handleInspectEmployer(u.id)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Employer
                        </Button>
                      )}

                      {u.role === 'candidate' && u.status !== 'active' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 min-h-[36px] font-semibold text-xs"
                          onClick={() => handleVerifyCandidate(u)}
                          leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                        >
                          Verify
                        </Button>
                      )}

                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'active' ? 'destructive' : 'secondary'}
                          size="sm"
                          className="flex-1 min-h-[36px] font-semibold text-xs"
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
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
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kth-slate-100">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-kth-slate-50/70 transition-colors group cursor-pointer"
                        onClick={(e) => {
                          // Ignore if clicking on button
                          if ((e.target as HTMLElement).closest('button, a')) return;
                          if (u.role === 'candidate') {
                            handleInspectCandidate(u.id);
                          } else if (u.role === 'employer') {
                            handleInspectEmployer(u.id);
                          }
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-kth-slate-100 border border-kth-slate-200 text-kth-slate-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-kth-primary-50 group-hover:text-kth-primary-700 transition-colors">
                              {u.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors">
                                {u.full_name}
                              </div>
                              <div className="text-kth-slate-500 text-[11px] font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={u.role === 'admin' ? 'rose' : u.role === 'employer' ? 'indigo' : 'cyan'}
                            className="capitalize font-mono"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={u.status === 'active' ? 'emerald' : u.status === 'suspended' ? 'rose' : 'amber'}
                            className="capitalize"
                          >
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role === 'candidate' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInspectCandidate(u.id);
                                }}
                                className="font-semibold text-xs border-kth-slate-300 hover:border-kth-primary-300 hover:bg-kth-primary-50 hover:text-kth-primary-700"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                View Candidate
                              </Button>
                            )}

                            {u.role === 'employer' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInspectEmployer(u.id);
                                }}
                                className="font-semibold text-xs"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                View Employer
                              </Button>
                            )}

                            {u.role === 'candidate' && u.status !== 'active' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerifyCandidate(u);
                                }}
                                className="font-semibold text-xs"
                                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                              >
                                Verify
                              </Button>
                            )}

                            {u.role !== 'admin' && (
                              <Button
                                variant={u.status === 'active' ? 'destructive' : 'secondary'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(u);
                                }}
                                className="font-semibold text-xs"
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
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

      {/* Candidate Profile Detailed Inspection & Verification Modal */}
      <AdminCandidateInspectModal
        candidateId={selectedCandidateId}
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onStatusChanged={(userId, newStatus) => {
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
        }}
      />
    </AdminShell>
  );
};

