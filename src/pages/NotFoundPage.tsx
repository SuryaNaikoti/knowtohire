import React from 'react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-kth-slate-50">
      <div className="w-16 h-16 rounded-full bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center font-display font-extrabold text-2xl mb-4">
        404
      </div>
      <h1 className="font-display text-3xl font-extrabold text-kth-slate-900 mb-2">Page Not Found</h1>
      <p className="text-xs text-kth-slate-500 max-w-sm mb-6 leading-relaxed">
        The public page or resource you requested could not be located on KnowToHire.
      </p>
      <Button variant="primary" onClick={() => window.location.href = '/'}>
        Return to Homepage
      </Button>
    </div>
  );
};
