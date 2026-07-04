import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/services/employerService';
import type { Company, CompanyTeamMember } from '../../../lib/services/employerService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { TeamMemberForm } from '../../../components/dashboard/TeamMemberForm';
import { Plus, Trash2, Edit2, Shield, User, ShieldAlert } from 'lucide-react';

export const Team: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [teamMembers, setTeamMembers] = useState<CompanyTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyTeamMember | null>(null);
  const [error, setError] = useState('');

  const fetchTeamData = async () => {
    if (!user) return;
    try {
      const comp = await employerService.getCompanyByEmployer(user.id);
      if (comp) {
        setCompany(comp);
        const members = await employerService.getTeamMembers(comp.id);
        setTeamMembers(members);
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

  const handleAddNew = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEditRole = (member: CompanyTeamMember) => {
    setSelectedMember(member);
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
        fetchTeamData();
      } else {
        alert('Failed to remove team member.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during member deletion.');
    }
  };

  if (loading) {
    return <Loading label="Loading team registry..." />;
  }

  const tableHeaders = [
    { key: 'name', label: 'Member Name' },
    { key: 'title', label: 'Job Title' },
    { key: 'role', label: 'Workspace Permission' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const getRoleBadgeVariant = (role: 'Admin' | 'Recruiter' | 'Viewer') => {
    switch (role) {
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
            Recruiting Team Directory
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Manage your recruiting staff, assign access permissions, and collaborate on hiring intelligence.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Team Member
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 border-solid rounded-xl text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {teamMembers.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
          <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-600">No recruiters in the directory.</p>
          <p className="text-xs text-gray-400 font-medium">Add a recruiting team member to collaborate.</p>
          <Button size="sm" onClick={handleAddNew} className="text-xs font-bold mt-2">
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden sm:block">
            <Table headers={tableHeaders}>
              {teamMembers.map((member) => {
                const name = `${member.first_name} ${member.last_name}`;
                const isCurrentUser = member.employer_id === user?.id;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600 border border-gray-200 border-solid shrink-0">
                          {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">
                            {name}
                            {isCurrentUser && (
                              <span className="ml-2 text-[10px] bg-blue-155 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-md">You</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-semibold">
                      {member.job_title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.member_role)} size="sm">
                        <div className="flex items-center gap-1">
                          {member.member_role === 'Admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {member.member_role}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEditRole(member)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit team member role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, name)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                          aria-label="Remove team member"
                          disabled={isCurrentUser}
                          title={isCurrentUser ? "You cannot remove yourself" : "Remove team member"}
                          style={{ opacity: isCurrentUser ? 0.4 : 1 }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {teamMembers.map((member) => {
              const name = `${member.first_name} ${member.last_name}`;
              const isCurrentUser = member.employer_id === user?.id;
              return (
                <Card key={member.id} className="bg-white">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600 border border-gray-200 border-solid shrink-0">
                        {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {name}
                          {isCurrentUser && (
                            <span className="ml-2 text-[10px] bg-blue-155 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-md">You</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">{member.job_title}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 border-solid pt-3">
                      <Badge variant={getRoleBadgeVariant(member.member_role)} size="sm">
                        <div className="flex items-center gap-1">
                          {member.member_role === 'Admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {member.member_role}
                        </div>
                      </Badge>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditRole(member)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit team member role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, name)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                          aria-label="Remove team member"
                          disabled={isCurrentUser}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {company && (
        <TeamMemberForm
          companyId={company.id}
          memberToEdit={selectedMember}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSaveSuccess={fetchTeamData}
        />
      )}
    </div>
  );
};
