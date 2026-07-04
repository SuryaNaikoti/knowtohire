import React, { useState, useEffect } from 'react';
import { candidateService } from '../../lib/services/candidateService';
import type { CandidateCertification } from '../../lib/services/candidateService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';

interface CertificationFormProps {
  candidateId: string;
  certificationToEdit: CandidateCertification | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const CertificationForm: React.FC<CertificationFormProps> = ({
  candidateId,
  certificationToEdit,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [name, setName] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certificationToEdit) {
      setName(certificationToEdit.name);
      setIssuingOrg(certificationToEdit.issuing_organization);
      setIssueDate(certificationToEdit.issue_date);
      setExpirationDate(certificationToEdit.expiration_date || '');
      setCredentialId(certificationToEdit.credential_id || '');
      setCredentialUrl(certificationToEdit.credential_url || '');
    } else {
      setName('');
      setIssuingOrg('');
      setIssueDate('');
      setExpirationDate('');
      setCredentialId('');
      setCredentialUrl('');
    }
    setError('');
  }, [certificationToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !issuingOrg || !issueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (expirationDate && new Date(issueDate) > new Date(expirationDate)) {
      setError('Issue date must precede the expiration date.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        id: certificationToEdit?.id,
        candidate_id: candidateId,
        name,
        issuing_organization: issuingOrg,
        issue_date: issueDate,
        expiration_date: expirationDate || null,
        credential_id: credentialId,
        credential_url: credentialUrl,
      };

      const success = await candidateService.upsertCertification(payload as any);
      if (success) {
        onSaveSuccess();
        onClose();
      } else {
        setError('Failed to save certification details.');
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
      title={certificationToEdit ? 'Edit Certification' : 'Add Certification'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" className="text-xs" title="Certification Alert">{error}</Alert>}

        <Input
          label="Certification Name"
          placeholder="e.g. AWS Certified Solutions Architect"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Issuing Organization"
          placeholder="e.g. Amazon Web Services"
          required
          value={issuingOrg}
          onChange={(e) => setIssuingOrg(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Issue Date"
            type="date"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
          <Input
            label="Expiration Date (if applicable)"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Credential ID"
            placeholder="e.g. AWS-12345"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
          />
          <Input
            label="Credential URL"
            type="url"
            placeholder="e.g. https://verify.aws.com/12345"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
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
