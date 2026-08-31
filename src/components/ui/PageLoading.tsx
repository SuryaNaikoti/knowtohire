import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading KnowToHire...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-kth-primary-50 border border-kth-primary-100 flex items-center justify-center shadow-xs">
          <Loader2 className="w-6 h-6 text-kth-primary-600 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-kth-slate-500 tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export default PageLoading;
