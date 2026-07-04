import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { subscriptionService } from '../../../lib/services/subscriptionService';
import type { SubscriptionPlan, UserSubscription } from '../../../lib/services/subscriptionService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Sparkles, Check, ShieldAlert } from 'lucide-react';

export const Subscriptions: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSub, setActiveSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [canceling, setCanceling] = useState(false);

  const loadSubscriptions = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const [allPlans, sub] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(profile.id)
      ]);
      setPlans(allPlans);
      setActiveSub(sub);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [profile]);

  const handleSubscribe = (planId: string) => {
    navigate(`/marketplace/checkout?itemId=${planId}&itemType=subscription_plan`);
  };

  const handleCancel = async () => {
    if (!profile || !activeSub || !window.confirm('Cancel your subscription?')) return;
    setCanceling(true);
    try {
      await subscriptionService.cancelSubscription(profile.id, activeSub.id);
      setSuccessMsg('Your subscription will end at the current billing cycle.');
      await loadSubscriptions();
    } catch (err) {
      console.error(err);
    } finally {
      setCanceling(false);
    }
  };

  const handleRenew = async () => {
    if (!profile || !activeSub) return;
    try {
      await subscriptionService.renewSubscription(profile.id, activeSub.id);
      setSuccessMsg('Your subscription has been renewed successfully!');
      await loadSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading label="Loading subscriptions..." />;

  // Filter plans based on roles: candidates only see candidate plans, employers only see employer plans
  const isEmployer = profile?.role === 'employer';
  const rolePlans = plans.filter(p => isEmployer ? p.slug.includes('employer') : p.slug.includes('candidate'));

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-gray-200 border-solid pb-5 text-left">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" /> Subscriptions & Upgrade
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Upgrade your account to unlock premium match indexing, ESG templates, and additional seats.
        </p>
      </div>

      {successMsg && <Alert type="success" title="Success">{successMsg}</Alert>}

      {/* Active Subscription Status Banner */}
      {activeSub ? (
        <Card className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-solid border-slate-800 text-left">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-solid border-emerald-500/20">
                Active Membership
              </span>
              <div>
                <h3 className="font-heading font-black text-lg">{activeSub.plan_name}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Renews: {new Date(activeSub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {activeSub.cancel_at_period_end ? (
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-lg border border-solid border-amber-400/25">
                    <ShieldAlert className="w-4 h-4" /> Set to cancel at end of period
                  </span>
                  <Button onClick={handleRenew} className="text-xs font-bold py-2">
                    Keep Auto-Renew
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleCancel}
                  isLoading={canceling}
                  variant="outline"
                  className="text-xs font-bold bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
          {rolePlans.map((plan) => (
            <Card key={plan.id} className="bg-white border border-solid border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-lg text-slate-900 leading-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">${(plan.price_cents / 100).toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-bold capitalize">/ {plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                </div>
                {plan.description && (
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">{plan.description}</p>
                )}
                <div className="border-t border-solid border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-650 font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> ATS Optimization Engine
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-650 font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Verified Domain Credential Match
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-650 font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Detailed Recruiter Analytics
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSubscribe(plan.id)} className="w-full text-xs font-bold py-2.5">
                Upgrade Now
              </Button>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
export default Subscriptions;
