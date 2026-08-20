import React from 'react';
import { Button } from '@/components/ui/Button';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  description = "There are currently no records available in this section.",
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="w-full p-10 rounded-lg border border-dashed border-kth-slate-300 bg-kth-slate-50 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-kth-slate-200/80 text-kth-slate-500 flex items-center justify-center mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="font-display font-bold text-base text-kth-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-kth-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
