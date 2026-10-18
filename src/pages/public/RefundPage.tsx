import React from 'react';
import { Card } from '@/components/ui/Card';

export const RefundPage: React.FC = () => {
  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 space-y-6 text-sm text-kth-slate-700 leading-relaxed shadow-sm border border-kth-slate-200">
          <div className="border-b border-kth-slate-200 pb-4">
            <h1 className="font-display text-3xl font-extrabold text-kth-slate-900 mb-2">Cancellation & Refund Policy</h1>
            <p className="text-xs text-kth-slate-500">Last updated: October 18, 2026 • KnowToHire (Operated under Registered Business Entity)</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">1. Nature of Services</h3>
            <p>
              KnowToHire is a digital B2B software-as-a-service (SaaS) and career educational technology platform. We provide candidate ATS workflow software tools, downloadable digital interview preparation guides, and resume templates. KnowToHire is not an employment placement agency and does not charge recruitment fees.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">2. Subscription Plans (Employer Starter & Enterprise)</h3>
            <p>
              Subscribers may cancel their monthly or annual recurring SaaS subscription at any time via their Employer Account Billing settings. Upon cancellation, your subscription will remain active until the end of the current billing cycle, and no further renewal charges will be deducted.
            </p>
            <p className="mt-2">
              If an accidental renewal occurs or you experience technical non-delivery of SaaS features, you may request a full refund within <strong>7 days</strong> of the billing date by contacting our support team at <a href="mailto:support@knowtohire.com" className="text-kth-primary-600 font-semibold underline">support@knowtohire.com</a>.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">3. Digital Downloads (Templates & Guides)</h3>
            <p>
              Because digital assets (such as resume templates and interview preparation resources) are accessible immediately upon purchase, refund requests are honored if:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The file is corrupted or technically defective and cannot be replaced within 48 hours.</li>
              <li>A duplicate transaction occurred due to a network or payment gateway error.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">4. Refund Processing Time</h3>
            <p>
              Approved refunds will be processed back to the original payment source (Credit/Debit Card, Net Banking, or UPI) within <strong>5 to 7 business days</strong> as per banking and Razorpay settlement standards.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-2">5. Contact for Billing & Refunds</h3>
            <p>
              For any billing inquiries, cancellation, or refund assistance:
            </p>
            <div className="mt-2 p-4 bg-kth-slate-100 rounded-md text-xs space-y-1">
              <p><strong>Email:</strong> support@knowtohire.com</p>
              <p><strong>Phone:</strong> +91 80 4920 1800</p>
              <p><strong>Operating Hours:</strong> Monday – Friday, 9:30 AM to 6:30 PM IST</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
