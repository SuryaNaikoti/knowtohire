import React, { useState } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubscribe = async (tier: 'starter' | 'enterprise', amountINR: number) => {
    if (!isAuthenticated) {
      window.location.href = '/register?role=employer';
      return;
    }

    setIsProcessing(true);
    await paymentService.initiateCheckout({
      itemType: 'employer_subscription',
      itemId: `sub_${tier}_${billingCycle}`,
      itemName: `KnowToHire Employer ${tier === 'starter' ? 'Starter' : 'Enterprise'} (${billingCycle})`,
      amountINR,
      onSuccess: () => {
        setIsProcessing(false);
        window.location.href = '/employer';
      },
      onCancel: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Transparent Platform Plans"
          badgeVariant="indigo"
          title="Simple, Transparent Pricing in INR (₹)"
          subtitle="Choose the right plan for candidate career growth or enterprise talent acquisition in India."
          align="center"
        />

        {/* Toggle */}
        <div className="flex justify-center items-center gap-3 mb-12">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-kth-slate-900' : 'text-kth-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 rounded-full bg-kth-primary-600 p-1 flex items-center transition-colors cursor-pointer"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${billingCycle === 'annual' ? 'text-kth-slate-900' : 'text-kth-slate-500'}`}>
            Annual Billing <span className="text-emerald-600 text-[10px] font-extrabold ml-1">(Save 20%)</span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Candidate Free */}
          <Card className="p-8 flex flex-col justify-between">
            <div>
              <Badge variant="slate" className="mb-3">
                Candidate Basic
              </Badge>
              <h3 className="font-display text-xl font-bold text-kth-slate-900 mb-1">Free Forever</h3>
              <p className="text-xs text-kth-slate-500 mb-6">For candidates exploring jobs and free study resources.</p>
              <div className="font-mono text-3xl font-extrabold text-kth-slate-900 mb-6">₹0</div>
              <ul className="space-y-3 text-xs text-kth-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited job applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Access to free E-Books & Compliance Handbooks
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Application tracker timeline & notifications
                </li>
              </ul>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/register?role=candidate')}>
              Create Free Account
            </Button>
          </Card>

          {/* Employer Starter */}
          <Card variant="interactive" className="p-8 flex flex-col justify-between border-2 border-kth-primary-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="indigo" className="bg-kth-primary-600 text-white shadow-xs">
                Most Popular for Hiring
              </Badge>
            </div>
            <div>
              <Badge variant="emerald" className="mb-3">
                Employer Growth
              </Badge>
              <h3 className="font-display text-xl font-bold text-kth-slate-900 mb-1">Employer Starter</h3>
              <p className="text-xs text-kth-slate-500 mb-6">For growing companies hiring sustainability & patent talent.</p>
              <div className="font-mono text-3xl font-extrabold text-kth-primary-600 mb-6">
                {billingCycle === 'annual' ? '₹1,199' : '₹1,499'}
                <span className="text-xs font-normal text-kth-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 text-xs text-kth-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Post up to 5 Active Job Listings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Full Candidate Pipeline ATS Kanban
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Explainable Skill Match analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Verified Employer Badge & Search Boost
                </li>
              </ul>
            </div>
            <Button
              variant="primary"
              className="w-full"
              isLoading={isProcessing}
              onClick={() => handleSubscribe('starter', billingCycle === 'annual' ? 14388 : 1499)}
            >
              Get Employer Starter
            </Button>
          </Card>

          {/* Enterprise */}
          <Card className="p-8 flex flex-col justify-between">
            <div>
              <Badge variant="cyan" className="mb-3">
                Enterprise ATS
              </Badge>
              <h3 className="font-display text-xl font-bold text-kth-slate-900 mb-1">Enterprise Hiring</h3>
              <p className="text-xs text-kth-slate-500 mb-6">For large enterprises needing custom talent pipelines.</p>
              <div className="font-mono text-3xl font-extrabold text-kth-slate-900 mb-6">
                {billingCycle === 'annual' ? '₹3,999' : '₹4,999'}
                <span className="text-xs font-normal text-kth-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 text-xs text-kth-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited Job Postings & ATS Pipelines
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Dedicated Account Manager & SLAs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Custom legal agreements & GST billing
                </li>
              </ul>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/contact')}>
              Contact Enterprise Sales
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
