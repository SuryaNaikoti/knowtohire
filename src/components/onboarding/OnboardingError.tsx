import React from 'react';
import { Alert } from '@/components/ui/Alert';
import { AlertCircle } from 'lucide-react';

export interface OnboardingErrorProps {
  error: string | null;
  onClear?: () => void;
}

export const OnboardingError: React.FC<OnboardingErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="my-4">
      <Alert variant="error" title="Action Required">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="text-xs text-red-800 font-medium">{error}</span>
        </div>
      </Alert>
    </div>
  );
};
