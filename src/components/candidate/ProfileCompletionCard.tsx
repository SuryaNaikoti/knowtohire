import React from 'react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export interface ProfileCompletionCardProps {
  strength: number;
  tip?: string;
  onComplete?: () => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  strength = 0,
  tip,
  onComplete,
}) => {
  const defaultTip =
    strength >= 100
      ? 'Your profile is complete. Keep it updated to stay discoverable.'
      : strength >= 90
      ? 'Almost there — add one more detail to reach 100% and boost discoverability.'
      : 'A complete profile gets 3× more views from verified employers.';

  const displayTip = tip || defaultTip;

  return (
    <Card className="p-5 bg-gradient-to-r from-white to-kth-slate-50 border-kth-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="font-display font-bold text-sm text-kth-slate-900">Profile Strength</h4>
            <span
              className={`font-mono text-xs font-bold ${
                strength >= 90
                  ? 'text-kth-accent-emerald'
                  : strength >= 70
                  ? 'text-kth-primary-600'
                  : 'text-kth-semantic-error'
              }`}
            >
              {strength}% Complete
            </span>
          </div>
          <Progress value={strength} showValue={false} color="emerald" className="mb-2" />
          <p className="text-xs text-kth-slate-500">{displayTip}</p>
        </div>
        {strength < 100 && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={onComplete || (() => {
              window.history.pushState({}, '', '/candidate/profile');
              window.dispatchEvent(new Event('popstate'));
            })}
          >
            Complete Profile <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
};
