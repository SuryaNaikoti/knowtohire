import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AdminCandidateInspectModal } from '@/components/admin/AdminCandidateInspectModal';
import { AdminEmployerInspectModal } from '@/components/admin/AdminEmployerInspectModal';
import { adminService, AdminUserRecord } from '@/services/adminService';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, Eye, ShieldCheck, UserPlus, AlertTriangle, Trash2 } from 'lucide-react';

export interface AdminUsersPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const { user: currentAdminUser } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Permanent Removal Dialog State
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Candidate Inspection Modal State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Employer Inspection Modal State
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [isEmployerModalOpen, setIsEmployerModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setQueryError(null);
    const res = await adminService.getUsers(searchTerm, roleFilter);
    if (res.error) {
      setQueryError(res.error.message || 'Failed to query user accounts.');
      setUsers([]);
    } else if (res.data) {
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

  useEffect(() => {
    // Purge legacy mock data IDs so only official demo accounts exist cleanly
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const legacyMockIds = ['demo-candidate-001', 'demo-employer-002', 'user-003', 'user-004'];
        const overridesRaw = window.localStorage.getItem('kth_admin_user_status_overrides');
        if (overridesRaw) {
          const overrides = JSON.parse(overridesRaw);
          let changed = false;
          for (const key of legacyMockIds) {
            if (key in overrides) {
              delete overrides[key];
              changed = true;
            }
          }
          if (changed) {
            window.localStorage.setItem('kth_admin_user_status_overrides', JSON.stringify(overrides));
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const promptDeleteUser = (user: AdminUserRecord) => {
    // Prevent self-deletion
    if (currentAdminUser?.id === user.id) {
      alert('Administrators cannot delete their own active account.');
      return;
    }

    // Superuser safety protection
    if (user.id === 'b3b30f73-46dc-43ec-8f5e-6784a8002452' || user.email === 'supportk2h@gmail.com') {
      alert('Master Platform Administrator cannot be removed.');
      return;
    }

    setUserToDelete(user);
    setDeleteConfirmationText('');
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUserPermanently = async () => {
    if (!userToDelete) return;

    if (deleteConfirmationText.trim().toUpperCase() !== 'PERMANENTLY REMOVE') {
      setDeleteError('Please type "PERMANENTLY REMOVE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    const res = await adminService.deleteUserPermanently(userToDelete.id);

    setIsDeleting(false);

    if (res.error) {
      setDeleteError(res.error.message || 'Failed to remove user account.');
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
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
    setSelectedEmployerId(employerId);
    setIsEmployerModalOpen(true);
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
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-kth-slate-500 whitespace-nowrap">
              {users.length} Users Found
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const target = '/admin/users/new';
                if (onNavigate) {
                  onNavigate(target);
                } else {
                  window.history.pushState({}, '', target);
                  window.dispatchEvent(new Event('popstate'));
                }
              }}
              className="text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs whitespace-nowrap"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Create User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Querying user accounts...</p>
            </div>
          ) : queryError ? (
            <div className="p-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600 mb-1">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-rose-900">{queryError}</p>
              <p className="text-xs text-kth-slate-500 max-w-md mx-auto">
                Unable to load live user directory data. Please ensure you are authenticated with an active administrator account.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                className="text-xs mt-2"
              >
                Retry Query
              </Button>
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
                          variant="destructive"
                          size="sm"
                          className="flex-1 min-h-[36px] font-semibold text-xs"
                          onClick={() => promptDeleteUser(u)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Permanently Remove Account
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
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  promptDeleteUser(u);
                                }}
                                className="font-semibold text-xs"
                                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                              >
                                Permanently Remove
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

      {/* Permanent Account Removal Explicit Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }
        }}
        title="Permanently Remove Account"
        maxWidth="md"
      >
        <div className="space-y-4 p-1">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">This administrative action is completely irreversible.</p>
              <p className="text-rose-700">
                The account's Auth identity, login access, resumes, profiles, preferences, and permissions will be permanently erased.
                If this user registers again later, they will start as a completely fresh account and must re-complete onboarding.
              </p>
            </div>
          </div>

          {userToDelete && (
            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-lg p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-kth-slate-500">Target User:</span>
                <span className="font-bold text-kth-slate-900">{userToDelete.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kth-slate-500">Email Address:</span>
                <span className="text-kth-slate-800">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kth-slate-500">Role:</span>
                <span className="uppercase font-bold text-kth-slate-700">{userToDelete.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kth-slate-500">User ID:</span>
                <span className="text-kth-slate-600 truncate max-w-[240px]">{userToDelete.id}</span>
              </div>
            </div>
          )}

          {deleteError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-xs font-semibold text-red-800">
              {deleteError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-kth-slate-700">
              To confirm irreversible removal, type <span className="font-mono font-bold text-rose-600">PERMANENTLY REMOVE</span> below:
            </label>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="PERMANENTLY REMOVE"
              className="font-mono text-xs"
              autoFocus
              disabled={isDeleting}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-kth-slate-200">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'PERMANENTLY REMOVE'}
              onClick={confirmDeleteUserPermanently}
              leftIcon={isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
              {isDeleting ? 'Purging Account...' : 'Permanently Remove Account'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Candidate Profile Detailed Inspection & Verification Modal */}
      <AdminCandidateInspectModal
        candidateId={selectedCandidateId}
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onStatusChanged={(userId, newStatus) => {
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
        }}
        onUserDeleted={(userId) => {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setIsCandidateModalOpen(false);
        }}
      />

      {/* Employer Enterprise Profile Detailed Inspection & Verification Modal */}
      <AdminEmployerInspectModal
        employerId={selectedEmployerId}
        isOpen={isEmployerModalOpen}
        onClose={() => setIsEmployerModalOpen(false)}
        onStatusChanged={(userId, newStatus) => {
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
        }}
        onUserDeleted={(userId) => {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setIsEmployerModalOpen(false);
        }}
        onNavigate={onNavigate}
      />
    </AdminShell>
  );
};

