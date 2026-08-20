import React from 'react';
import { Button } from '@/components/ui/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 bg-white border-b border-kth-slate-200/80 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-kth-slate-900 tracking-tight text-balance leading-tight">
          Know More. Hire Better. Grow Faster.
        </h2>
        <p className="text-kth-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal text-pretty">
          Join thousands of professionals, sustainability analysts, and enterprises using KnowToHire to discover opportunities and verified domain resources.
        </p>
        <div className="flex justify-center gap-3.5 pt-2 flex-wrap">
          <Button
            variant="primary"
            size="md"
            className="font-bold px-6"
            onClick={() => window.location.href = '/jobs'}
          >
            Explore KnowToHire
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="px-6"
            onClick={() => window.location.href = '/pricing'}
          >
            Post a Job Opportunity
          </Button>
        </div>
      </div>
    </section>
  );
};

