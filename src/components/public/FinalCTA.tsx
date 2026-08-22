import React from 'react';
import { Button } from '@/components/ui/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-10 sm:py-16 md:py-24 bg-white border-b border-kth-slate-200/80 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-kth-slate-900 tracking-tight text-balance leading-tight">
          Know More. Hire Better. Grow Faster.
        </h2>
        <p className="text-kth-slate-600 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-normal text-pretty px-2">
          Join thousands of professionals, sustainability analysts, and enterprises using KnowToHire to discover opportunities and verified domain resources.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 max-w-md mx-auto sm:max-w-none">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-bold px-6 text-xs sm:text-sm h-11 sm:h-10"
            onClick={() => window.location.href = '/jobs'}
          >
            Explore KnowToHire
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto px-6 text-xs sm:text-sm h-11 sm:h-10"
            onClick={() => window.location.href = '/pricing'}
          >
            Post a Job Opportunity
          </Button>
        </div>
      </div>
    </section>
  );
};

