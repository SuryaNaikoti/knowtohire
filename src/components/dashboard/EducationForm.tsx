import React, { useState, useEffect } from 'react';
import { candidateService } from '../../lib/services/candidateService';
import type { CandidateEducation } from '../../lib/services/candidateService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';

interface EducationFormProps {
  candidateId: string;
  educationToEdit: CandidateEducation | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  candidateId,
  educationToEdit,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (educationToEdit) {
      setInstitution(educationToEdit.institution);
      setDegree(educationToEdit.degree);
      setFieldOfStudy(educationToEdit.field_of_study);
      setStartDate(educationToEdit.start_date);
      setEndDate(educationToEdit.end_date || '');
      setDescription(educationToEdit.description || '');
    } else {
      setInstitution('');
      setDegree('');
      setFieldOfStudy('');
      setStartDate('');
      setEndDate('');
      setDescription('');
    }
    setError('');
  }, [educationToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !degree || !fieldOfStudy || !startDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date must precede the graduation date.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        id: educationToEdit?.id,
        candidate_id: candidateId,
        institution,
        degree,
        field_of_study: fieldOfStudy,
        start_date: startDate,
        end_date: endDate || null,
        description,
      };

      const success = await candidateService.upsertEducation(payload as any);
      if (success) {
        onSaveSuccess();
        onClose();
      } else {
        setError('Failed to save education details.');
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
      title={educationToEdit ? 'Edit Education Record' : 'Add Education Record'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" className="text-xs" title="Education Alert">{error}</Alert>}

        <Input
          label="School / Institution Name"
          placeholder="e.g. Stanford University"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Degree / Diploma"
            placeholder="e.g. Bachelor of Science"
            required
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
          <Input
            label="Field of Study"
            placeholder="e.g. Computer Science"
            required
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Graduation Date (Expected / Actual)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 tracking-wide">
            Description / Activities
          </label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[100px] outline-none"
            placeholder="Honors, relevant coursework, major projects, student organizations..."
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
