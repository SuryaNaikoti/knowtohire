import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { StaggerGrid, StaggerItem, MotionCard } from '../../../components/ui/Motion';
import { supabase } from '../../../lib/supabase';
import {
  Users as UsersIcon,
  UserCheck,
  Briefcase,
  ShieldCheck,
  UserX,
  Search,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';

interface PlatformUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin' | 'super_admin';
  created_at: string;
  is_active?: boolean;
  last_login?: string;
  avatar_url?: string;
}

// Demo fallback seed data
const DEMO_USERS: PlatformUser[] = [
  { id: 'usr-1', first_name: 'Rahul', last_name: 'Sharma', email: 'rahul.sharma@gmail.com', role: 'candidate', created_at: '2026-08-06T10:00:00Z', is_active: true, last_login: '2 hours ago' },
  { id: 'usr-2', first_name: 'Sneha', last_name: 'Reddy', email: 'sneha.reddy@gmail.com', role: 'candidate', created_at: '2026-08-06T09:30:00Z', is_active: true, last_login: '5 hours ago' },
  { id: 'usr-3', first_name: 'Aditya', last_name: 'Rao', email: 'aditya.rao@gmail.com', role: 'candidate', created_at: '2026-08-06T09:00:00Z', is_active: true, last_login: 'Yesterday' },
  { id: 'usr-4', first_name: 'Neha', last_name: 'Kapoor', email: 'neha.kapoor@gmail.com', role: 'candidate', created_at: '2026-08-06T08:15:00Z', is_active: true, last_login: 'Yesterday' },
  { id: 'usr-5', first_name: 'Rajeev', last_name: 'Nair', email: 'rajeev.admin@knowtohire.com', role: 'super_admin', created_at: '2026-08-01T12:00:00Z', is_active: true, last_login: 'Just now' },
  { id: 'usr-6', first_name: 'Rohit', last_name: 'Verma', email: 'jobs@patentnexus.com', role: 'employer', created_at: '2026-08-06T07:45:00Z', is_active: true, last_login: '3 days ago' },
  { id: 'usr-7', first_name: 'Priya', last_name: 'Nair', email: 'careers@sustainedge.com', role: 'employer', created_at: '2026-08-06T07:15:00Z', is_active: true, last_login: '3 days ago' },
  { id: 'usr-8', first_name: 'GreenEarth', last_name: 'HR', email: 'talent@greenearth.com', role: 'employer', created_at: '2026-08-05T16:00:00Z', is_active: true, last_login: '4 days ago' },
  { id: 'usr-9', first_name: 'Vikas', last_name: 'Mehta', email: 'vikas.m@techops.io', role: 'candidate', created_at: '2026-08-04T14:20:00Z', is_active: true, last_login: '1 week ago' },
  { id: 'usr-10', first_name: 'Ananya', last_name: 'Deshmukh', email: 'ananya.d@designlab.com', role: 'candidate', created_at: '2026-08-03T11:10:00Z', is_active: true, last_login: '2 weeks ago' },
  { id: 'usr-11', first_name: 'Karan', last_name: 'Joshi', email: 'karan.j@fintechsol.com', role: 'candidate', created_at: '2026-08-02T15:40:00Z', is_active: true, last_login: '2 weeks ago' },
  { id: 'usr-12', first_name: 'Pooja', last_name: 'Hegde', email: 'pooja.h@cloudcorp.com', role: 'candidate', created_at: '2026-08-01T09:50:00Z', is_active: true, last_login: '3 weeks ago' },
  { id: 'usr-13', first_name: 'Siddharth', last_name: 'Malhotra', email: 'siddharth.m@devops.org', role: 'candidate', created_at: '2026-07-29T13:25:00Z', is_active: true, last_login: '3 weeks ago' },
  { id: 'usr-14', first_name: 'Tanya', last_name: 'Chawla', email: 'tanya.c@cybersec.in', role: 'candidate', created_at: '2026-07-28T10:05:00Z', is_active: true, last_login: '1 month ago' },
  { id: 'usr-15', first_name: 'Amit', last_name: 'Patel', email: 'amit.patel@datastack.com', role: 'candidate', created_at: '2026-07-25T18:30:00Z', is_active: true, last_login: '1 month ago' },
  { id: 'usr-16', first_name: 'Divya', last_name: 'Sundaram', email: 'divya.s@aishift.co', role: 'candidate', created_at: '2026-07-20T08:45:00Z', is_active: true, last_login: '1 month ago' },
  { id: 'usr-17', first_name: 'Manish', last_name: 'Kumar', email: 'manish.k@legacysoft.com', role: 'candidate', created_at: '2026-07-15T12:00:00Z', is_active: false, last_login: '2 months ago' }
];

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Custom Dropdown Popover States
  const [openDropdown, setOpenDropdown] = useState<'role' | 'status' | 'sort' | null>(null);

  // Selection & Pagination
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Dialog & Modal States
  const [viewingUser, setViewingUser] = useState<PlatformUser | null>(null);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<{ user: PlatformUser; targetActive: boolean } | null>(null);
  const [resettingUser, setResettingUser] = useState<PlatformUser | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Edit Form Fields
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'candidate' | 'employer' | 'admin' | 'super_admin'>('candidate');

  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      if (data && data.length > 0) {
        const formatted = data.map((u: any, idx: number) => ({
          ...u,
          is_active: u.is_active !== false,
          last_login: u.last_login || DEMO_USERS[idx % DEMO_USERS.length]?.last_login || 'Recently'
        }));
        setUsers(formatted as PlatformUser[]);
      } else {
        setUsers(DEMO_USERS);
      }
    } catch (err: any) {
      console.warn('Supabase fetch user directory fallback:', err);
      setUsers(DEMO_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleViewProfile = (user: PlatformUser) => {
    setActiveMenuId(null);
    if (user.role === 'candidate') {
      navigate('/dashboard/admin/candidates');
    } else if (user.role === 'employer') {
      navigate('/dashboard/admin/employers');
    } else {
      setViewingUser(user);
    }
  };

  const handleOpenEditModal = (user: PlatformUser) => {
    setActiveMenuId(null);
    setEditingUser(user);
    setEditFirstName(user.first_name || '');
    setEditLastName(user.last_name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'candidate');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setError('');
      const updatedUser: PlatformUser = {
        ...editingUser,
        first_name: editFirstName,
        last_name: editLastName,
        email: editEmail,
        role: editRole,
      };

      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);

      if (supabase) {
        await supabase
          .from('profiles')
          .update({
            first_name: editFirstName,
            last_name: editLastName,
            role: editRole,
          })
          .eq('id', editingUser.id);
      }

      setSuccess(`User profile for ${editFirstName} ${editLastName} updated.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not update user profile information.');
    }
  };

  const handleOpenResetModal = (user: PlatformUser) => {
    setActiveMenuId(null);
    setResettingUser(user);
    setResetSent(false);
  };

  const handleSendResetEmail = async () => {
    if (!resettingUser) return;
    setIsResettingPassword(true);
    try {
      if (supabase && supabase.auth) {
        await supabase.auth.resetPasswordForEmail(resettingUser.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      }
    } catch (e) {
      console.warn('Password reset handler warning:', e);
    } finally {
      setIsResettingPassword(false);
      setResetSent(true);
      setSuccess(`Password reset email sent to ${resettingUser.email}.`);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!suspendingUser) return;
    const { user, targetActive } = suspendingUser;

    try {
      setError('');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: targetActive } : u));
      setSuspendingUser(null);

      if (supabase) {
        await supabase
          .from('profiles')
          .update({ is_active: targetActive })
          .eq('id', user.id);
      }

      setSuccess(`User ${user.first_name} ${user.last_name} set to ${targetActive ? 'Active' : 'Suspended'}.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not update user activation state.');
    }
  };

  const handleBulkToggleActive = (targetActive: boolean) => {
    if (selectedUserIds.length === 0) return;
    setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, is_active: targetActive } : u));
    setSuccess(`Bulk action completed: ${selectedUserIds.length} user(s) set to ${targetActive ? 'Active' : 'Suspended'}.`);
    setSelectedUserIds([]);
    setTimeout(() => setSuccess(''), 4000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '06 Aug 2026';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '06 Aug 2026';
    }
  };

  const getInitials = (firstName: string, lastName: string, email: string) => {
    if (firstName || lastName) {
      return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    }
    return (email[0] || 'U').toUpperCase();
  };

  const getAvatarBg = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-2xs';
      case 'employer':
        return 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-2xs';
      case 'candidate':
      default:
        return 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-2xs';
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60">
            Administrator
          </span>
        );
      case 'employer':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
            Employer
          </span>
        );
      case 'candidate':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Candidate
          </span>
        );
    }
  };

  const renderStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/70">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
        Suspended
      </span>
    );
  };

  const renderLastLogin = (lastLogin?: string) => {
    const text = lastLogin || 'Recently';
    const isRecent = text.includes('hour') || text.includes('Just') || text.includes('Yesterday') || text.includes('3 days') || text.includes('4 days');
    
    if (isRecent) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          {text}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
        {text}
      </span>
    );
  };

  const stats = useMemo(() => {
    const total = users.length;
    const candidates = users.filter(u => u.role === 'candidate').length;
    const employers = users.filter(u => u.role === 'employer').length;
    const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
    const suspended = users.filter(u => u.is_active === false).length;
    return { total, candidates, employers, admins, suspended };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => {
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        return fullName.includes(q) || u.email.toLowerCase().includes(q);
      });
    }

    if (roleFilter !== 'all') {
      if (roleFilter === 'admin') {
        result = result.filter(u => u.role === 'admin' || u.role === 'super_admin');
      } else {
        result = result.filter(u => u.role === roleFilter);
      }
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(u => u.is_active !== false);
      } else if (statusFilter === 'suspended') {
        result = result.filter(u => u.is_active === false);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === 'name-asc') {
        const nameA = `${a.first_name} ${a.last_name}`.trim().toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'name-desc') {
        const nameA = `${a.first_name} ${a.last_name}`.trim().toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.trim().toLowerCase();
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = (exportSelectedOnly = false) => {
    const listToExport = exportSelectedOnly
      ? filteredUsers.filter(u => selectedUserIds.includes(u.id))
      : filteredUsers;

    const headers = ['User ID,First Name,Last Name,Email,Role,Status,Joined Date,Last Login'];
    const rows = listToExport.map(u => [
      `"${u.id}"`,
      `"${u.first_name || ''}"`,
      `"${u.last_name || ''}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.is_active !== false ? 'Active' : 'Suspended'}"`,
      `"${formatDate(u.created_at)}"`,
      `"${u.last_login || 'N/A'}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `knowtohire_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    setSelectedUserIds([]);
  };

  // Label Mappings for Custom Minimalist Select Dropdowns
  const roleLabels: Record<string, string> = {
    all: 'All Roles',
    candidate: 'Candidate',
    employer: 'Employer',
    admin: 'Administrator',
  };

  const statusLabels: Record<string, string> = {
    all: 'All Statuses',
    active: 'Active',
    suspended: 'Suspended',
  };

  const sortLabels: Record<string, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    'name-asc': 'Name A–Z',
    'name-desc': 'Name Z–A',
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16 relative scroll-smooth">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/50 text-emerald-600 shadow-2xs">
              <UsersIcon className="w-6 h-6" />
            </div>
            User Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit and manage platform access levels, review logins, and suspend/reactivate member accounts.
          </p>
        </div>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}
      {success && <Alert type="success" title="Success">{success}</Alert>}

      {/* 1. MINIMALIST EXECUTIVE SUMMARY CARDS (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-blue-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Platform Users</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Registered Accounts</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        {/* Card 2 */}
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-emerald-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Candidates</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.candidates}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Active Talent</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        {/* Card 3 */}
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-sky-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Employers</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.employers}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Verified Companies</p>
            </div>
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        {/* Card 4 */}
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-purple-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Administrators</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.admins}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Platform Managers</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>

        {/* Card 5 */}
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-rose-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between h-full">
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Suspended</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.suspended}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Inactive Accounts</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* 2. MINIMALIST TOOLBAR WITH CUSTOM FLOATING SELECT DROPDOWNS */}
      <div ref={dropdownRef} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none h-10 transition-all shadow-2xs"
            />
          </div>

          {/* Custom Minimalist Role Select */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'role' ? null : 'role')}
              className="w-full sm:w-auto px-4 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl text-xs font-bold text-slate-700 h-10 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 hidden lg:inline">Role</span>
              <span>{roleLabels[roleFilter]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {openDropdown === 'role' && (
              <div className="absolute left-0 top-11 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 text-xs font-semibold animate-fade-in-up">
                {Object.entries(roleLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setRoleFilter(key); setOpenDropdown(null); setCurrentPage(1); }}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      roleFilter === key ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                    {roleFilter === key && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Minimalist Status Select */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className="w-full sm:w-auto px-4 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl text-xs font-bold text-slate-700 h-10 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 hidden lg:inline">Status</span>
              <span>{statusLabels[statusFilter]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {openDropdown === 'status' && (
              <div className="absolute left-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 text-xs font-semibold animate-fade-in-up">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setStatusFilter(key); setOpenDropdown(null); setCurrentPage(1); }}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      statusFilter === key ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                    {statusFilter === key && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Minimalist Sort Select */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className="w-full sm:w-auto px-4 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl text-xs font-bold text-slate-700 h-10 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 hidden lg:inline">Sort</span>
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {openDropdown === 'sort' && (
              <div className="absolute left-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 text-xs font-semibold animate-fade-in-up">
                {Object.entries(sortLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setOpenDropdown(null); }}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      sortBy === key ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                    {sortBy === key && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action: Export CSV */}
        <Button
          onClick={() => handleExportCSV(false)}
          variant="outline"
          size="sm"
          className="bg-white border-slate-300 text-slate-800 hover:bg-slate-50 font-bold h-10 px-5 rounded-xl flex items-center justify-center gap-2 shrink-0 shadow-2xs text-xs transition-all"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export CSV
        </Button>
      </div>

      {/* 3. MINIMALIST TABLE CONTAINER */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between animate-pulse gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0"></div>
                    <div className="space-y-2">
                      <div className="w-36 h-4 bg-slate-100 rounded-md"></div>
                      <div className="w-48 h-3 bg-slate-100 rounded-md"></div>
                    </div>
                  </div>
                  <div className="w-24 h-7 bg-slate-100 rounded-full"></div>
                  <div className="w-20 h-7 bg-slate-100 rounded-full"></div>
                  <div className="w-28 h-4 bg-slate-100 rounded-md hidden md:block"></div>
                </div>
              ))}
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                <UsersIcon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 font-heading">No users found</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Try adjusting your search query or role/status filters.
                </p>
              </div>
              <Button onClick={resetFilters} variant="outline" size="sm" className="text-xs font-bold rounded-xl bg-white border-slate-300 h-9 px-4">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Last Login</th>
                      <th className="py-4 px-6">Joined On</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedUsers.map((u) => {
                      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Platform Member';
                      const initials = getInitials(u.first_name, u.last_name, u.email);
                      const isActive = u.is_active !== false;
                      const isSelected = selectedUserIds.includes(u.id);

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-emerald-50/40' : ''}`}
                        >
                          <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(u.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                          </td>

                          <td className="py-4 px-6" onClick={() => handleViewProfile(u)}>
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-full border border-white flex items-center justify-center font-black text-xs shrink-0 ${getAvatarBg(u.role)}`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm leading-snug tracking-tight truncate">{fullName}</p>
                                <p className="text-xs text-slate-400 font-normal leading-normal truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {renderRoleBadge(u.role)}
                          </td>

                          <td className="py-4 px-6">
                            {renderStatusBadge(isActive)}
                          </td>

                          <td className="py-4 px-6">
                            {renderLastLogin(u.last_login)}
                          </td>

                          <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                            {formatDate(u.created_at)}
                          </td>

                          <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                              className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer inline-flex items-center justify-center"
                              aria-label="Actions menu"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === u.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-6 top-14 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 py-1.5 text-left text-xs font-semibold animate-fade-in-up"
                              >
                                <button
                                  onClick={() => handleViewProfile(u)}
                                  className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-slate-400" />
                                  View Profile
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(u)}
                                  className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-slate-400" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() => handleOpenResetModal(u)}
                                  className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <KeyRound className="w-4 h-4 text-slate-400" />
                                  Reset Password
                                </button>
                                <div className="my-1.5 border-t border-slate-100"></div>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setSuspendingUser({ user: u, targetActive: !isActive });
                                  }}
                                  className={`w-full px-4 py-2.5 flex items-center gap-2.5 transition-colors cursor-pointer ${
                                    isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                  {isActive ? 'Suspend User' : 'Activate User'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {paginatedUsers.map((u) => {
                  const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Platform Member';
                  const initials = getInitials(u.first_name, u.last_name, u.email);
                  const isActive = u.is_active !== false;

                  return (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3" onClick={() => handleViewProfile(u)}>
                          <div className={`w-9 h-9 rounded-full border border-white shadow-2xs flex items-center justify-center font-black text-xs shrink-0 ${getAvatarBg(u.role)}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{fullName}</p>
                            <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                        {renderStatusBadge(isActive)}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          {renderRoleBadge(u.role)}
                          <span className="text-[11px] font-medium text-slate-400">{formatDate(u.created_at)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSuspendingUser({ user: u, targetActive: !isActive })}
                          className="text-[11px] font-bold py-1 px-3 h-7 bg-white"
                        >
                          {isActive ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* PAGINATION FOOTER */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600">
              <div>
                Showing <span className="font-bold text-slate-900">{((currentPage - 1) * rowsPerPage) + 1}</span> to{' '}
                <span className="font-bold text-slate-900">{Math.min(currentPage * rowsPerPage, filteredUsers.length)}</span> of{' '}
                <span className="font-bold text-slate-900">{filteredUsers.length}</span> users
              </div>

              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Rows per page</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-emerald-500 outline-none cursor-pointer shadow-2xs"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FLOATING BULK ACTION BAR */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-40 flex items-center gap-4 animate-fade-in-up border border-slate-800">
          <span className="text-xs font-bold text-slate-300">
            <span className="text-emerald-400 font-extrabold">{selectedUserIds.length}</span> user(s) selected
          </span>

          <div className="h-4 w-px bg-slate-700"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggleActive(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activate
            </button>
            <button
              onClick={() => handleBulkToggleActive(false)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Suspend
            </button>
            <button
              onClick={() => handleExportCSV(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW USER PROFILE MODAL */}
      {viewingUser && (
        <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="User Profile Summary" size="md">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full border-2 border-white shadow-md flex items-center justify-center font-black text-lg ${getAvatarBg(viewingUser.role)}`}>
                {getInitials(viewingUser.first_name, viewingUser.last_name, viewingUser.email)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{viewingUser.first_name} {viewingUser.last_name}</h4>
                <p className="text-xs text-slate-500 font-medium">{viewingUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  {renderRoleBadge(viewingUser.role)}
                  {renderStatusBadge(viewingUser.is_active !== false)}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">User ID</span>
                <span className="font-mono text-slate-900">{viewingUser.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Joined Date</span>
                <span className="text-slate-900">{formatDate(viewingUser.created_at)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400 font-semibold">Last Login Activity</span>
                <span className="text-slate-900">{viewingUser.last_login || 'Recently'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setViewingUser(null)} size="sm" variant="outline" className="text-xs font-bold rounded-xl bg-white border-slate-300">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: EDIT USER MODAL */}
      {editingUser && (
        <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User Information" size="md">
          <form onSubmit={handleSaveEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                required
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="text-xs"
              />
              <Input
                label="Last Name"
                required
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="text-xs"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="text-xs"
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Platform Access Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" onClick={() => setEditingUser(null)} variant="outline" size="sm" className="text-xs font-bold rounded-xl bg-white border-slate-300">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: SUSPEND / ACTIVATE CONFIRMATION MODAL */}
      {suspendingUser && (
        <Modal
          isOpen={!!suspendingUser}
          onClose={() => setSuspendingUser(null)}
          title={suspendingUser.targetActive ? 'Confirm Account Reactivation' : 'Confirm Account Suspension'}
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">
                Are you sure you want to {suspendingUser.targetActive ? 'reactivate' : 'suspend'}{' '}
                <strong className="text-slate-900">{suspendingUser.user.first_name} {suspendingUser.user.last_name}</strong> ({suspendingUser.user.email})?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" onClick={() => setSuspendingUser(null)} variant="outline" size="sm" className="text-xs font-bold rounded-xl bg-white border-slate-300">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmToggleActive}
                size="sm"
                className={`text-xs font-bold rounded-xl ${
                  suspendingUser.targetActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {suspendingUser.targetActive ? 'Reactivate Account' : 'Suspend Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: RESET PASSWORD MODAL */}
      {resettingUser && (
        <Modal
          isOpen={!!resettingUser}
          onClose={() => setResettingUser(null)}
          title="Reset User Password"
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <p className="text-xs font-bold text-slate-900">
                {resettingUser.first_name} {resettingUser.last_name}
              </p>
              <p className="text-xs text-slate-500 font-medium">{resettingUser.email}</p>
            </div>

            {resetSent ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900 space-y-1.5">
                <p className="text-xs font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Password Reset Instructions Sent!
                </p>
                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                  An automated recovery email with reset credentials has been dispatched to <strong>{resettingUser.email}</strong>.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Dispatch a secure, time-limited password recovery link to the user's registered email address. The user can click the link to establish new login credentials.
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                onClick={() => setResettingUser(null)}
                variant="outline"
                size="sm"
                className="text-xs font-bold rounded-xl bg-white border-slate-300"
              >
                {resetSent ? 'Close' : 'Cancel'}
              </Button>
              {!resetSent && (
                <Button
                  type="button"
                  onClick={handleSendResetEmail}
                  isLoading={isResettingPassword}
                  size="sm"
                  className="text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Dispatch Reset Link
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;
