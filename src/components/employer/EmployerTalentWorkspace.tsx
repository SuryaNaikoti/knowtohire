import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiringWorkspaceProvider } from '../../context/HiringWorkspaceContext';
import { EmployerTalentWorkspaceContent } from './EmployerTalentWorkspaceContent';

export const EmployerTalentWorkspace: React.FC = () => {
  const { user } = useAuth();
  const providerId = user?.id || 'prov_1';

  return (
    <HiringWorkspaceProvider providerId={providerId}>
      <EmployerTalentWorkspaceContent />
    </HiringWorkspaceProvider>
  );
};

export default EmployerTalentWorkspace;
