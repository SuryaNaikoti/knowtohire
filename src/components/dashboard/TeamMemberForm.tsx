import React, { useState, useEffect } from 'react';
import { employerService } from '../../lib/services/employerService';
import type { CompanyTeamMember } from '../../lib/services/employerService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';

interface TeamMemberFormProps {
  companyId: string;
  memberToEdit: CompanyTeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  companyId,
  memberToEdit,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [role, setRole] = useState<'Admin' | 'Recruiter' | 'Viewer'>('Recruiter');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setRole(memberToEdit.member_role);
      setFirstName(memberToEdit.first_name || '');
      setLastName(memberToEdit.last_name || '');
      setJobTitle(memberToEdit.job_title || '');
    } else {
      setRole('Recruiter');
      setFirstName('');
      setLastName('');
      setJobTitle('');
    }
    setError('');
  }, [memberToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !jobTitle) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (memberToEdit) {
        // Edit Role
        const success = await employerService.updateTeamMemberRole(companyId, memberToEdit.id, role);
        if (success) {
          onSaveSuccess();
          onClose();
        } else {
          setError('Failed to update team member role.');
        }
      } else {
        // Create simulated employer profile and link
        const simulatedEmployerId = `emp_${Math.random().toString(36).substring(2, 9)}`;
        
        // Seed simulated profile in local storage
        localStorage.setItem(`kth_employer_profile_${simulatedEmployerId}`, JSON.stringify({
          id: simulatedEmployerId,
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle,
          phone_number: '+1 (555) 000-0000'
        }));

        const success = await employerService.addTeamMember({
          company_id: companyId,
          employer_id: simulatedEmployerId,
          member_role: role,
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle
        });

        if (success) {
          onSaveSuccess();
          onClose();
        } else {
          setError('Failed to add team member.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Update Team Member Role' : 'Invite Recruiter Team Member'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" className="text-xs" title="Team Registry Alert">{error}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="e.g. Michael"
            required
            disabled={!!memberToEdit}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Choi"
            required
            disabled={!!memberToEdit}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          label="Corporate Job Title"
          placeholder="e.g. Technical Recruiter"
          required
          disabled={!!memberToEdit}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />

        <Select
          label="Workspace Permission Role"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="Admin">Admin (Full edit access & billing settings)</option>
          <option value="Recruiter">Recruiter (Can update profiles & list jobs)</option>
          <option value="Viewer">Viewer (Read-only access)</option>
        </Select>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm" className="bg-white text-xs font-bold">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} size="sm" className="text-xs font-bold">
            {memberToEdit ? 'Save Changes' : 'Invite Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
