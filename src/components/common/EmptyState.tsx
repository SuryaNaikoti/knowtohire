import React from 'react';
import { SearchX, FilterX, Briefcase, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'filter' | 'job';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Opportunities Found',
  description = 'We couldn\'t find any matches for your selected criteria. Try resetting your filters or using broader search terms.',
  actionLabel = 'Reset All Filters',
  onAction,
  icon = 'filter',
  className = '',
}) => {
  const IconComponent = icon === 'search' ? SearchX : icon === 'job' ? Briefcase : FilterX;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-slate-250 rounded-[28px] max-w-xl mx-auto space-y-5 my-8 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
        <IconComponent className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-bold font-heading text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      {onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          leftIcon={<RefreshCw className="w-4 h-4 text-emerald-600" />}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl px-6 font-bold"
          eventName="empty_state_action_clicked"
          eventCategory="Listings"
          eventLabel={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
