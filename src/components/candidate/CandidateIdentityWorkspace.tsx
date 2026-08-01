import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { IdentityWorkspaceProvider } from '../../context/IdentityWorkspaceContext';
import { CandidateIdentityWorkspaceContent } from './CandidateIdentityWorkspaceContent';

export const CandidateIdentityWorkspace: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <IdentityWorkspaceProvider candidateId={candidateId}>
      <CandidateIdentityWorkspaceContent />
    </IdentityWorkspaceProvider>
  );
};

export default CandidateIdentityWorkspace;
