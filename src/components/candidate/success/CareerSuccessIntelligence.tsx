import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CareerSuccessProvider } from '../../../context/CareerSuccessContext';
import { CareerSuccessIntelligenceContent } from './CareerSuccessIntelligenceContent';

export const CareerSuccessIntelligence: React.FC = () => {
  const { user } = useAuth();
  const candidateId = user?.id || '';

  return (
    <CareerSuccessProvider candidateId={candidateId}>
      <CareerSuccessIntelligenceContent />
    </CareerSuccessProvider>
  );
};

export default CareerSuccessIntelligence;
