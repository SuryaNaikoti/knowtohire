import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { supabase } from '../../../lib/supabase';
import { Users as UsersIcon, CheckCircle2, UserX } from 'lucide-react';

interface PlatformUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin' | 'super_admin';
  created_at: string;
  is_active?: boolean;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setUsers(data as PlatformUser[]);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch user directory from server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userId: string, currentStatus = true) => {
    try {
      setError('');
      setSuccess('');
      const targetStatus = !currentStatus;
      
      const { error: err } = await supabase
        .from('profiles')
        .update({ is_active: targetStatus })
        .eq('id', userId);

      if (err) throw err;
      
      setSuccess(`User status successfully ${targetStatus ? 'restored' : 'suspended'}.`);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError('Could not update user activation state.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return <Badge variant="danger" className="bg-red-50 text-red-750 border-red-200">Admin</Badge>;
      case 'employer':
        return <Badge variant="primary">Employer</Badge>;
      case 'candidate':
      default:
        return <Badge variant="secondary">Candidate</Badge>;
    }
  };

  if (loading) return <Loading label="Retrieving user directory database..." />;

  const tableHeaders = [
    { key: 'name', label: 'User Details' },
    { key: 'role', label: 'Access Level' },
    { key: 'joined', label: 'Joined' },
    { key: 'status', label: 'Account State' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-primary" /> User Directory
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Audit and manage platform access levels, review logins, and suspend/reactivate member accounts.
        </p>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}
      {success && <Alert type="success" title="Success">{success}</Alert>}

      <Card>
        <CardContent className="p-0">
          <Table headers={tableHeaders}>
            {users.map((u) => {
              const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User';
              const isActive = u.is_active !== false;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold leading-tight">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell className="text-xs text-gray-500 font-semibold">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-650 font-bold">
                        <UserX className="w-4 h-4" /> Suspended
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={isActive ? 'outline' : 'primary'}
                      onClick={() => handleToggleActive(u.id, isActive)}
                      className="text-[10px] px-3 py-1 font-bold h-8"
                    >
                      {isActive ? 'Suspend' : 'Reactivate'}
                    </Button>
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

export default Users;
