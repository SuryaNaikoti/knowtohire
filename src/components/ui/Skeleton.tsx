import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-5 shadow-sm text-left">
      <div className="flex justify-between items-center">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5 rounded" />
        <Skeleton className="w-1/2 h-4 rounded" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="w-24 h-4 rounded" />
        <Skeleton className="w-16 h-5 rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <div className="h-3.5 bg-slate-200 rounded w-full" />
          <div className="h-2.5 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-16" />
    </div>
  );
};

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm flex flex-col space-y-4 pb-6">
      <Skeleton className="w-full aspect-[16/10]" />
      <div className="px-6 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-5/6 h-5 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-16 h-3 rounded" />
          </div>
          <Skeleton className="w-12 h-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction
}) => {
  return (
    <div className="text-center py-16 bg-white border border-slate-250 rounded-[24px] p-8 shadow-sm space-y-4 max-w-md mx-auto">
      {icon && <div className="mx-auto flex justify-center text-slate-450">{icon}</div>}
      <div className="space-y-2 text-center">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 text-xs font-bold shadow-sm inline-flex items-center justify-center transition-all cursor-pointer border-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  onRetry
}) => {
  return (
    <div className="text-center py-16 bg-red-50/50 border border-red-200 rounded-[24px] p-8 shadow-sm space-y-4 max-w-md mx-auto text-left">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-650 mx-auto">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-base font-bold text-red-900">{title}</h3>
        <p className="text-xs text-red-800 leading-relaxed font-semibold">{description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 h-10 text-xs font-bold shadow-sm inline-flex items-center justify-center transition-all cursor-pointer border-none mx-auto"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
