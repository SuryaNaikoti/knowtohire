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
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">1. Nature of Platform & Acceptance of Terms</h3>
            <p>
              KnowToHire is an educational technology and software-as-a-service (SaaS) recruitment-tech platform. We provide candidate ATS workflow tools, skill assessments, and career digital assets. KnowToHire is NOT a manpower placement agency or consultancy and does not guarantee job placements or charge commission for hiring. By using our website and services, you agree to these Terms.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">2. SaaS Software Subscriptions & Job Posting Rules</h3>
            <p>
              Employers utilize our SaaS application to manage their applicants and post legitimate employment listings. All listings must represent genuine business opportunities in India.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">3. Template & Knowledge Resource Licenses</h3>
            <p>
              Purchased or downloaded document templates and study guides are licensed for individual or corporate internal use only and may not be redistributed or resold.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">4. Payments, Cancellations & Refunds</h3>
            <p>
              All online payments, subscription renewals, and refund requests are governed by our official <a href="/refund" className="text-kth-primary-600 font-semibold underline">Cancellation & Refund Policy</a> in accordance with Indian banking and payment gateway guidelines.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
