import React from 'react';
import { Card } from '@/components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 space-y-6 text-sm text-kth-slate-700 leading-relaxed">
          <div className="border-b border-kth-slate-200 pb-4">
            <h1 className="font-display text-3xl font-extrabold text-kth-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-xs text-kth-slate-500">Last updated: August 12, 2026 • KnowToHire India</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">1. Information We Collect</h3>
            <p>KnowToHire collects profile details, educational credentials, resume submissions, and employer contact information to facilitate recruitment and resource delivery across India.</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">2. How We Use Your Information</h3>
            <p>Your candidate information is used solely to provide skill match recommendations, job application forwarding to verified employers, and digital template delivery.</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">3. Data Security & Storage</h3>
            <p>All data is encrypted in transit and at rest in compliance with Indian Information Technology regulations.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
