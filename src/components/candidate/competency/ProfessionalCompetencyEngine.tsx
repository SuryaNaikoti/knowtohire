import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CompetencyEngineProvider } from '../../../context/CompetencyEngineContext';
import { CompetencyEngineWorkspaceContent } from './CompetencyEngineWorkspaceContent';

export const ProfessionalCompetencyEngine: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <CompetencyEngineProvider candidateId={candidateId}>
      <CompetencyEngineWorkspaceContent />
    </CompetencyEngineProvider>
  );
};

export default ProfessionalCompetencyEngine;
