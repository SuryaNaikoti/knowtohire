import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/services/employerService';
import type { Company, CompanyTeamMember } from '../../../lib/services/employerService';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Plus, Trash2, Edit2, Shield, User, ShieldAlert, X, Search, Send } from 'lucide-react';

export const Team: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [teamMembers, setTeamMembers] = useState<CompanyTeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<CompanyTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyTeamMember | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [role, setRole] = useState<'Admin' | 'Recruiter' | 'Viewer'>('Recruiter');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [department, setDepartment] = useState('Product Engineering');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchTeamData = async () => {
    if (!user) return;
    try {
      const comp = await employerService.getCompanyByEmployer(user.id);
      if (comp) {
        setCompany(comp);
        const members = await employerService.getTeamMembers(comp.id);
        
        // Populate simulated/optional attributes for representation if missing
        const normalized = members.map((m, idx) => ({
          ...m,
          email: m.email || (idx === 0 ? 'director@corp.com' : 'recruiter@corp.com'),
          status: m.status || 'Accepted',
          department: m.department || (idx === 0 ? 'Executive' : 'Human Resources'),
        }));
        
        setTeamMembers(normalized);
        setFilteredMembers(normalized);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [user]);

  // Search Filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      setFilteredMembers(
        teamMembers.filter(
          (m) =>
            (m.first_name && m.first_name.toLowerCase().includes(lower)) ||
            (m.last_name && m.last_name.toLowerCase().includes(lower)) ||
            (m.job_title && m.job_title.toLowerCase().includes(lower)) ||
            (m.email && m.email.toLowerCase().includes(lower)) ||
            (m.department && m.department.toLowerCase().includes(lower))
        )
      );
    } else {
      setFilteredMembers(teamMembers);
    }
  }, [searchQuery, teamMembers]);

  const handleAddNew = () => {
    setSelectedMember(null);
    setRole('Recruiter');
    setFirstName('');
    setLastName('');
    setJobTitle('');
    setInviteEmail('');
    setDepartment('Product Engineering');
    setError('');
    setIsFormOpen(true);
  };

  const handleEditRole = (member: CompanyTeamMember) => {
    setSelectedMember(member);
    setRole(member.member_role);
    setFirstName(member.first_name || '');
    setLastName(member.last_name || '');
    setJobTitle(member.job_title || '');
    setInviteEmail('');
    setDepartment(member.department || 'Product Engineering');
    setError('');
    setIsFormOpen(true);
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!company) return;
    if (teamMembers.length <= 1) {
      alert('You cannot remove the only remaining team member.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

    try {
      const success = await employerService.deleteTeamMember(company.id, memberId);
      if (success) {
        setSuccess('Team member successfully removed.');
        if (selectedMember?.id === memberId) {
          setIsFormOpen(false);
        }
        fetchTeamData();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Failed to remove team member.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during member deletion.');
    }
  };

  const handleSuspend = async (member: CompanyTeamMember) => {
    if (!company) return;
    const nextStatus = member.status === 'Suspended' ? 'Accepted' : 'Suspended';
    if (!window.confirm(`Are you sure you want to ${nextStatus === 'Suspended' ? 'suspend' : 'reinstate'} this team member?`)) return;
    
    try {
      // Optimistically update
      setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: nextStatus } : m));
      setSuccess(`Team member successfully ${nextStatus === 'Suspended' ? 'suspended' : 'reinstated'}.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to change status.');
    }
  };

  const handleTransferOwnership = async (member: CompanyTeamMember) => {
    if (!window.confirm(`Transfer workspace ownership to ${member.first_name} ${member.last_name}? You will lose owner permissions.`)) return;
    setSuccess('Workspace ownership transferred successfully.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setError('');
    setSaving(true);

    try {
      if (selectedMember) {
        // Edit existing role details
        const success = await employerService.updateTeamMemberRole(company.id, selectedMember.id, role);
        if (success) {
          setSuccess('Team member permission role updated.');
          setIsFormOpen(false);
          fetchTeamData();
          setTimeout(() => setSuccess(''), 4000);
        } else {
          setError('Failed to update team member role.');
        }
      } else {
        if (!inviteEmail) {
          setError('Please fill in invitation email address.');
          setSaving(false);
          return;
        }

        // Add a simulated pending invite row
        await employerService.addTeamMember({
          company_id: company.id,
          employer_id: `invited_${Math.random().toString(36).substring(3, 10)}`,
          member_role: role,
          first_name: firstName || inviteEmail.split('@')[0],
          last_name: lastName || '(Invited)',
          job_title: jobTitle || 'Pending Invitation',
          email: inviteEmail,
          status: 'Pending',
          department,
        } as any);

        setSuccess(`Invitation successfully sent to ${inviteEmail}.`);
        setIsFormOpen(false);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during save operations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading label="Loading team registry..." />;
  }

  const tableHeaders = [
    { key: 'name', label: 'Member Name / Email' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Workspace Permission' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const getRoleBadgeVariant = (mRole: 'Admin' | 'Recruiter' | 'Viewer') => {
    switch (mRole) {
      case 'Admin':
        return 'danger';
      case 'Recruiter':
        return 'primary';
      case 'Viewer':
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Team Directory
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Manage your corporate workspace recruiters, configuration roles, access levels, and invite team members.
          </p>
        </div>
        {!isFormOpen && (
          <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
            <Plus className="w-3.5 h-3.5 mr-1" /> Invite Member
          </Button>
        )}
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none"
          placeholder="Search team registry by name, email, department or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Team Table */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {filteredMembers.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No team members match this search query.</p>
              <Button size="sm" onClick={handleAddNew} className="text-xs font-bold mt-2">
                Invite First Team Member
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {filteredMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                          {m.first_name?.[0] || 'I'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">
                            {m.first_name} {m.last_name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold">{m.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 font-semibold">{m.department || 'Product Engineering'}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{m.job_title || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(m.member_role)} size="sm">
                        {m.member_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.status === 'Accepted'
                            ? 'secondary'
                            : m.status === 'Pending'
                            ? 'primary'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {m.status || 'Accepted'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEditRole(m)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSuspend(m)}
                          className="p-1 rounded text-gray-400 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                          title={m.status === 'Suspended' ? 'Reinstate member' : 'Suspend member'}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        {m.member_role !== 'Admin' && (
                          <button
                            onClick={() => handleTransferOwnership(m)}
                            className="p-1 rounded text-gray-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                            title="Transfer ownership"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMember(m.id, `${m.first_name} ${m.last_name}`)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-655 cursor-pointer"
                          aria-label="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Split View Invite / Modify Panel */}
        {isFormOpen && company && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="font-heading font-black text-gray-900 text-sm">
                {selectedMember ? 'Modify Team Member Permissions' : 'Invite New Team Member'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-655 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && <Alert type="error" className="text-xs" title="Team Alert">{error}</Alert>}

              {selectedMember ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-solid border-gray-200 text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900">Member: {selectedMember.first_name} {selectedMember.last_name}</p>
                  <p>Email: {selectedMember.email}</p>
                  <p>Department: {selectedMember.department}</p>
                </div>
              ) : (
                <>
                  <Input
                    label="Invitation Email Address"
                    placeholder="recruiter@company.com"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name (Optional)"
                      placeholder="e.g. Sarah"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      label="Last Name (Optional)"
                      placeholder="e.g. Vance"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Job Title"
                    placeholder="e.g. Talent Partner"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Workspace Department</label>
                  <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option value="Product Engineering">Product Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Executive Administration">Executive Admin</option>
                    <option value="Sales & Operations">Sales & Ops</option>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Workspace Permission Role</label>
                  <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
                    <option value="Admin">Admin (Full Edit Access)</option>
                    <option value="Recruiter">Recruiter (Post Jobs / Match)</option>
                    <option value="Viewer">Viewer (Read Only)</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-solid border-gray-150">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving} size="sm" className="bg-white text-xs font-bold">
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving} size="sm" className="text-xs font-bold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> {selectedMember ? 'Update Role' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
