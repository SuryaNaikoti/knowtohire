import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { StaggerGrid, StaggerItem, MotionCard } from '../../../components/ui/Motion';
import {
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  RotateCcw,
  Users,
  Building2,
  Lock,
  Key,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  User,
  Sparkles
} from 'lucide-react';

export interface UserRoleSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin' | 'super_admin';
  avatar_url?: string;
}

export const Roles: React.FC = () => {
  const [users, setUsers] = useState<UserRoleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, avatar_url')
        .order('first_name', { ascending: true });

      if (err) throw err;
      setUsers((data || []) as UserRoleSummary[]);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch user profiles for role configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setError('');
      setSuccess('');

      const { error: err } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (err) throw err;

      setSuccess('User workspace role permissions updated successfully.');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update workspace user role permissions.');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    return result;
  }, [search, roleFilter, users]);

  const stats = useMemo(() => {
    const total = users.length;
    const candidates = users.filter(u => u.role === 'candidate').length;
    const employers = users.filter(u => u.role === 'employer').length;
    const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
    return { total, candidates, employers, admins };
  }, [users]);

  const getInitials = (user: UserRoleSummary) => {
    const fn = user.first_name || '';
    const ln = user.last_name || '';
    if (!fn && !ln) return user.email.slice(0, 2).toUpperCase();
    return `${fn[0] || ''}${ln[0] || ''}`.toUpperCase();
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            Access Configuration & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure security credentials, manage user roles, and enforce role-based access control policies.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Accounts</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Registered Identity Accounts</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Candidate Tier</p>
            <h3 className="text-2xl sm:text-3xl font-black text-sky-600 font-heading mt-1.5">{stats.candidates}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Jobseekers & Applicants</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-purple-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Employer Managers</p>
            <h3 className="text-2xl sm:text-3xl font-black text-purple-600 font-heading mt-1.5">{stats.employers}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Recruiters & Hiring Managers</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Privileged Admins</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.admins}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Full System Access</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search identity records by name, email address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
            />
          </div>

          <div className="lg:col-span-4">
            <Select
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { value: 'all', label: 'All Identity Roles' },
                { value: 'candidate', label: 'Candidate' },
                { value: 'employer', label: 'Employer' },
                { value: 'admin', label: 'Admin' },
                { value: 'super_admin', label: 'Super Admin' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <span>Showing <strong className="text-slate-900 font-bold">{filteredUsers.length}</strong> identities</span>
          {(search || roleFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Identity Table & Mobile Card List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Retrieving identity access profiles...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching identity profiles found</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS LIST (Visible on small screens md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.map((u) => {
              const initials = getInitials(u);
              const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User';
              return (
                <div key={u.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={fullName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-2xs border border-white">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{fullName}</h3>
                      <p className="text-[11px] font-medium text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Badge variant={u.role === 'admin' || u.role === 'super_admin' ? 'secondary' : u.role === 'employer' ? 'warning' : 'neutral'} size="sm" className="uppercase font-extrabold">
                      {u.role}
                    </Badge>

                    <div className="w-36">
                      <Select
                        value={u.role}
                        onChange={(newVal) => handleRoleChange(u.id, newVal)}
                        options={[
                          { value: 'candidate', label: 'Candidate' },
                          { value: 'employer', label: 'Employer' },
                          { value: 'admin', label: 'Admin' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW MODE (Visible on tablet/desktop md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">User Details</th>
                    <th className="py-4 px-5">Email Address</th>
                    <th className="py-4 px-5">Current Role</th>
                    <th className="py-4 px-5 min-w-[180px]">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredUsers.map((u) => {
                    const initials = getInitials(u);
                    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={fullName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-2xs border border-white">
                                {initials}
                              </div>
                            )}
                            <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {fullName}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-600">{u.email}</div>
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap">
                          <Badge variant={u.role === 'admin' || u.role === 'super_admin' ? 'secondary' : u.role === 'employer' ? 'warning' : 'neutral'} size="sm" className="uppercase font-extrabold">
                            {u.role}
                          </Badge>
                        </td>

                        <td className="py-4 px-5 min-w-[180px]">
                          <Select
                            value={u.role}
                            onChange={(newVal) => handleRoleChange(u.id, newVal)}
                            options={[
                              { value: 'candidate', label: 'Candidate' },
                              { value: 'employer', label: 'Employer' },
                              { value: 'admin', label: 'Admin' },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VALUABLE RBAC CAPABILITY MATRIX SECTION */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white p-6 space-y-4">
        <h3 className="text-sm font-black font-heading text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" /> Platform Role Capability Matrix (RBAC)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Feature / Permission</th>
                <th className="py-3 px-4 text-center">Candidate</th>
                <th className="py-3 px-4 text-center">Employer</th>
                <th className="py-3 px-4 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              <tr>
                <td className="py-3 px-4">Apply for Vacancies & Portfolio Builder</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-3 px-4 text-center text-slate-300">━</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Post Vacancies & Manage Applicants</td>
                <td className="py-3 px-4 text-center text-slate-300">━</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Publish CMS Resources & Blog Articles</td>
                <td className="py-3 px-4 text-center text-slate-300">━</td>
                <td className="py-3 px-4 text-center text-slate-300">━</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-3 px-4">User Role Promotion & Security Audits</td>
                <td className="py-3 px-4 text-center text-slate-300">━</td>
                <td className="py-3 px-4 text-center text-slate-300">━</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Roles;
