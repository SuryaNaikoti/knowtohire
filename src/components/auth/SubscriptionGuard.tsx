import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { SubscriptionTier } from '@/services/subscriptionEntitlementService';

export interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
  onNavigate?: (path: string) => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredTier = 'starter',
  onNavigate,
  fallbackTitle,
  fallbackDescription,
}) => {
  const { isActive, tier, isLoading, isExpired } = useSubscription();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Verifying subscription status...</p>
        </div>
      </div>
    );
  }

  // Access permitted if:
  // 1. Subscription is active AND
  // 2. Either requiredTier is 'starter' and user has 'starter' or 'enterprise'
  //    OR requiredTier is 'enterprise' and user has 'enterprise'
  const hasAccess =
    isActive &&
    (requiredTier === 'starter' ? (tier === 'starter' || tier === 'enterprise') : tier === 'enterprise');

  if (hasAccess) {
    return <>{children}</>;
  }

  const isUpgradeRequired = isActive && tier === 'starter' && requiredTier === 'enterprise';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          {isUpgradeRequired ? <Sparkles className="w-8 h-8 text-amber-500" /> : <Lock className="w-8 h-8 text-indigo-600" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {fallbackTitle || (isUpgradeRequired
              ? 'Enterprise Plan Required'
              : isExpired
              ? 'Subscription Expired'
              : 'Employer Subscription Required')}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {fallbackDescription || (isUpgradeRequired
              ? 'This capability requires an Enterprise Hiring subscription tier. Upgrade your company plan to unlock unlimited postings, dedicated account support, and enterprise tooling.'
              : isExpired
              ? 'Your company subscription has expired. Please renew your plan to reactivate access to employer recruitment tools and active candidate pipelines.'
              : 'Unlock full access to the KnowToHire recruitment workspace, verified candidate matching, ATS pipeline, and direct interview scheduling.')}
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-800">What’s included with KnowToHire Employer:</div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600">
            <li>Post active job listings with verified skill indexing</li>
            <li>Interactive ATS Kanban candidate tracking</li>
            <li>Explainable candidate matching analytics</li>
            <li>Interview scheduling with automated candidate notifications</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-1/2"
            onClick={() => navigate('/employer/company-profile')}
          >
            Company Profile
          </Button>
          <Button
            className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
            onClick={() => navigate('/pricing')}
          >
            <span>{isUpgradeRequired ? 'Upgrade Plan' : 'View Plans'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
