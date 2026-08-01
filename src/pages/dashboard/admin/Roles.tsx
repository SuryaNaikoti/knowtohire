import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { supabase } from '../../../lib/supabase';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface UserRoleSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin' | 'super_admin';
}

export const Roles: React.FC = () => {
  const [users, setUsers] = useState<UserRoleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .order('first_name', { ascending: true });

      if (err) throw err;
      setUsers(data as UserRoleSummary[]);
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
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError('Failed to update workspace user role permissions.');
    }
  };

  if (loading) return <Loading label="Loading access configuration registries..." />;

  const tableHeaders = [
    { key: 'name', label: 'User Details' },
    { key: 'email', label: 'Email Address' },
    { key: 'role', label: 'Current Role' },
    { key: 'actions', label: 'Assign Role' },
  ];

  const roleOptions = [
    { value: 'candidate', label: 'Candidate' },
    { value: 'employer', label: 'Employer' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Access Configuration
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Configure security credentials, manage roles, and review authentication tokens.
        </p>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}
      {success && <Alert type="success" title="Success">{success}</Alert>}

      <Card>
        <CardContent className="p-0">
          <Table headers={tableHeaders}>
            {users.map((u) => {
              const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User';
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-semibold">{u.email}</TableCell>
                  <TableCell>
                    <span className="text-[10px] bg-slate-50 text-slate-700 font-extrabold px-2 py-0.5 rounded-md border border-solid border-gray-150 uppercase tracking-wider">
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      options={roleOptions}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs w-40"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roles;
