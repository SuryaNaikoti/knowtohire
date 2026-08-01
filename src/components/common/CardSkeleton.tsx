import React from 'react';

interface CardSkeletonProps {
  type?: 'job' | 'employer' | 'resource' | 'template';
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ type = 'job', count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 animate-pulse shadow-sm min-h-[220px] flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200" />
              <div className="w-20 h-6 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-5 bg-slate-200 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
            </div>
            {type === 'job' && (
              <div className="flex gap-2 pt-2">
                <div className="h-4 bg-slate-100 rounded w-20" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-8 bg-slate-100 rounded-lg w-20" />
          </div>
        </div>
      ))}
    </>
  );
};
