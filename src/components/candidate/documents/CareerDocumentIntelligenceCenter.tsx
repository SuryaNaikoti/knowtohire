import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DocumentIntelligenceProvider } from '../../../context/DocumentIntelligenceContext';
import { CareerDocumentIntelligenceCenterContent } from './CareerDocumentIntelligenceCenterContent';

export const CareerDocumentIntelligenceCenter: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <DocumentIntelligenceProvider candidateId={candidateId}>
      <CareerDocumentIntelligenceCenterContent />
    </DocumentIntelligenceProvider>
  );
};

export default CareerDocumentIntelligenceCenter;
