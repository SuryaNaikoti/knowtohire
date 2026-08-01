import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { UnifiedIntelligenceProvider } from '../../../context/UnifiedIntelligenceContext';
import { UnifiedCareerIntelligenceEngineContent } from './UnifiedCareerIntelligenceEngineContent';

export const UnifiedCareerIntelligenceEngine: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <UnifiedIntelligenceProvider candidateId={candidateId}>
      <UnifiedCareerIntelligenceEngineContent />
    </UnifiedIntelligenceProvider>
  );
};

export default UnifiedCareerIntelligenceEngine;
