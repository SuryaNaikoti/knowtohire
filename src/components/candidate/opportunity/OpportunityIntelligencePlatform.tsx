import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { OpportunityWorkspaceProvider } from '../../../context/OpportunityWorkspaceContext';
import { OpportunityIntelligencePlatformContent } from './OpportunityIntelligencePlatformContent';

export const OpportunityIntelligencePlatform: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <OpportunityWorkspaceProvider candidateId={candidateId}>
      <OpportunityIntelligencePlatformContent />
    </OpportunityWorkspaceProvider>
  );
};

export default OpportunityIntelligencePlatform;
