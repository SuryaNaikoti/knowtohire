import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CareerEvidenceProvider } from '../../../context/CareerEvidenceContext';
import { CareerEvidenceWorkspaceContent } from './CareerEvidenceWorkspaceContent';

export const CareerEvidenceWorkspace: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <CareerEvidenceProvider candidateId={candidateId}>
      <CareerEvidenceWorkspaceContent />
    </CareerEvidenceProvider>
  );
};

export default CareerEvidenceWorkspace;
