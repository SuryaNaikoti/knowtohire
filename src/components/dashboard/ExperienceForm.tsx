import React, { useState, useEffect } from 'react';
import { candidateService } from '../../lib/services/candidateService';
import type { CandidateExperience } from '../../lib/services/candidateService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';

interface ExperienceFormProps {
  candidateId: string;
  experienceToEdit: CandidateExperience | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  candidateId,
  experienceToEdit,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experienceToEdit) {
      setCompanyName(experienceToEdit.company_name);
      setRoleTitle(experienceToEdit.role_title);
      setLocation(experienceToEdit.location || '');
      setStartDate(experienceToEdit.start_date);
      setEndDate(experienceToEdit.end_date || '');
      setIsCurrent(experienceToEdit.is_current);
      setDescription(experienceToEdit.description || '');
    } else {
      setCompanyName('');
      setRoleTitle('');
      setLocation('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setDescription('');
    }
    setError('');
  }, [experienceToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !roleTitle || !startDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isCurrent && !endDate) {
      setError('Please enter an end date or select "Currently work here".');
      return;
    }

    if (endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date must precede the end date.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        id: experienceToEdit?.id,
        candidate_id: candidateId,
        company_name: companyName,
        role_title: roleTitle,
        location,
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
        is_current: isCurrent,
        description,
      };

      const success = await candidateService.upsertExperience(payload as any);
      if (success) {
        onSaveSuccess();
        onClose();
      } else {
        setError('Failed to save experience details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={experienceToEdit ? 'Edit Work Experience' : 'Add Work Experience'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" className="text-xs" title="Experience Alert">{error}</Alert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Company Name"
            placeholder="e.g. InnoTech"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Role Title"
            placeholder="e.g. Lead Frontend Architect"
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
          />
        </div>

        <Input
          label="Location (City, State / Remote)"
          placeholder="e.g. San Francisco, CA / Remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            disabled={isCurrent}
            required={!isCurrent}
            value={isCurrent ? '' : endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <label className="flex items-center space-x-2.5 cursor-pointer py-1 select-none">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => {
              setIsCurrent(e.target.checked);
              if (e.target.checked) setEndDate('');
            }}
            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-bold text-gray-700">I currently work in this role</span>
        </label>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 tracking-wide">
            Description & Key Contributions
          </label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[100px] outline-none"
            placeholder="Describe your achievements, technical tools utilized, and team collaborations..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm" className="bg-white text-xs font-bold">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} size="sm" className="text-xs font-bold">
            Save Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
