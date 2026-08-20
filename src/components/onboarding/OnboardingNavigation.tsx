import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface OnboardingNavigationProps {
  onBack: () => void;
  onContinue: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  continueText?: string;
  isSaveSuccess?: boolean;
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  onBack,
  onContinue,
  isFirstStep,
  isLastStep,
  isLoading = false,
  continueText,
  isSaveSuccess = false,
}) => {
  return (
    <div className="pt-8 border-t border-kth-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
      {/* Back Action */}
      <div>
        {!isFirstStep ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onBack}
            disabled={isLoading}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {/* Save indicator & Next / Complete Action */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        {isSaveSuccess && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Progress Saved</span>
          </span>
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onContinue}
          isLoading={isLoading}
          disabled={isLoading}
          rightIcon={!isLastStep ? <ArrowRight className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm min-w-[160px]"
        >
          {continueText || (isLastStep ? 'Complete Setup' : 'Save & Continue')}
        </Button>
      </div>
    </div>
  );
};
