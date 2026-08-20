import React from 'react';
import { Card } from '@/components/ui/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 space-y-6 text-sm text-kth-slate-700 leading-relaxed">
          <div className="border-b border-kth-slate-200 pb-4">
            <h1 className="font-display text-3xl font-extrabold text-kth-slate-900 mb-2">Terms & Conditions of Service</h1>
            <p className="text-xs text-kth-slate-500">Last updated: August 12, 2026 • KnowToHire.com</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">1. Acceptance of Terms</h3>
            <p>By accessing or using KnowToHire, candidates, employers, and visitors agree to abide by these terms of service and platform community standards.</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">2. Employer Job Posting Rules</h3>
            <p>All job postings must represent genuine employment opportunities in India and comply with equal opportunity standards.</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">3. Template & Knowledge Resource Licenses</h3>
            <p>Purchased or downloaded document templates are licensed for individual or corporate internal use only and may not be resold.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
