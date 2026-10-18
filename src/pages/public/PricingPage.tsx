import React, { useState } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { Check, CreditCard, Loader2, CheckCircle2, Shield } from 'lucide-react';

type CheckoutStep = 'idle' | 'cart' | 'processing' | 'success';

interface SelectedPlan {
  tier: 'starter' | 'enterprise';
  name: string;
  amountINR: number;
  billingCycle: 'monthly' | 'annual';
}

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { isAuthenticated, user, profile, role, status, refreshProfile } = useAuth();

  const handleSubscribe = (tier: 'starter' | 'enterprise', amountINR: number) => {
    if (!isAuthenticated) {
      window.location.href = '/register?role=employer';
      return;
    }

    if (role !== 'employer' && role !== 'admin') {
      alert('Employer subscription plans are only available for Employer / Recruiter accounts.');
      return;
    }

    if (role === 'employer' && status === 'pending_onboarding') {
      alert('Please complete your company onboarding before subscribing to an employer plan.');
      window.location.href = '/onboarding/employer';
      return;
    }

    const name = tier === 'starter' ? 'Employer Starter' : 'Enterprise Hiring';
    setSelectedPlan({ tier, name, amountINR, billingCycle });
    setCheckoutStep('cart');
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;

    // CRITICAL: Dismiss the cart dialog BEFORE opening Razorpay.
    // The Dialog component renders a fixed inset-0 z-[999] overlay that blocks
    // the Razorpay checkout iframe from receiving pointer events.
    setCheckoutStep('idle');

    const res = await paymentService.initiateCheckout({
      itemType: 'employer_subscription',
      itemId: `sub_${selectedPlan.tier}_${selectedPlan.billingCycle}`,
      itemName: `KnowToHire ${selectedPlan.name} (${selectedPlan.billingCycle})`,
      amountINR: selectedPlan.amountINR,
      provider: 'razorpay',
      userId: user?.id,
      customer: {
        email: user?.email,
        name: profile?.full_name || (user?.user_metadata?.full_name as string),
      },
      onSuccess: async (payId) => {
        setTransactionId(payId);
        setCheckoutStep('success');
        try {
          await refreshProfile();
        } catch {
          // ignore
        }
      },
      onCancel: () => {
        setCheckoutStep('idle');
      },
    });

    if (res.error) {
      setCheckoutStep('idle');
    }
  };

  const handleCloseModal = () => {
    setCheckoutStep('idle');
    setSelectedPlan(null);
    setTransactionId(null);
  };

  const handleGoToDashboard = async () => {
    const latestProfile = await refreshProfile().catch(() => profile);
    const effectiveRole = latestProfile?.role || role || 'employer';
    const effectiveStatus = latestProfile?.status || status || 'active';

    if (effectiveRole === 'employer') {
      if (effectiveStatus === 'pending_onboarding') {
        window.location.href = '/onboarding/employer';
      } else {
        window.location.href = '/employer';
      }
    } else if (effectiveRole === 'creator') {
      window.location.href = '/creator';
    } else {
      window.location.href = effectiveStatus === 'pending_onboarding' ? '/onboarding/candidate' : '/candidate';
    }
  };

  // Determine role-based view partitioning
  const isCandidateUser = isAuthenticated && role === 'candidate';
  const isCreatorUser = isAuthenticated && role === 'creator';
  const isEmployerUser = isAuthenticated && (role === 'employer' || role === 'admin');

  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText={isCreatorUser ? "Creator Earnings" : isCandidateUser ? "Candidate Membership" : "Platform Subscriptions"}
          badgeVariant="indigo"
          title={
            isCreatorUser
              ? "Creator Terms & Royalty Share"
              : isCandidateUser
              ? "Candidate Free Tier & Benefits"
              : "Simple, Transparent Subscriptions in INR (₹)"
          }
          subtitle={
            isCreatorUser
              ? "Publish study resources and document templates to earn guaranteed 70% commission."
              : isCandidateUser
              ? "KnowToHire candidate memberships are 100% free forever for verified job applications and career study guides."
              : "Choose the right subscription plan for enterprise talent acquisition and verified recruitment in India."
          }
          align="center"
        />

        {/* Toggle (Only shown when viewing employer plans) */}
        {!isCandidateUser && !isCreatorUser && (
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
        )}

        {/* Creator View */}
        {isCreatorUser && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 flex flex-col justify-between border-2 border-kth-primary-600">
              <div>
                <Badge variant="indigo" className="mb-3">
                  Verified Content Creator
                </Badge>
                <h3 className="font-display text-2xl font-bold text-kth-slate-900 mb-2">Creator Royalty Program</h3>
                <p className="text-sm text-kth-slate-600 mb-6">
                  Content creators never pay subscription fees. You earn 70% commission on every resource and template sold.
                </p>
                <div className="font-mono text-3xl font-extrabold text-kth-primary-600 mb-6">
                  70% <span className="text-xs font-normal text-kth-slate-500">Royalty Share</span>
                </div>
                <ul className="space-y-3 text-xs text-kth-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Submit study guides, interview packs & templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Admin moderation review & quality indexing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Payout withdrawal at ₹1,500 threshold
                  </li>
                </ul>
              </div>
              <Button variant="primary" className="w-full" onClick={() => (window.location.href = '/creator')}>
                Go to Creator Studio
              </Button>
            </Card>
          </div>
        )}

        {/* Pricing Cards Grid (Hidden for Creator) */}
        {!isCreatorUser && (
          <div className={`grid grid-cols-1 ${isCandidateUser ? 'max-w-md mx-auto' : isEmployerUser ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-8`}>
            {/* Candidate Free (Only for Public or Candidates) */}
            {(!isAuthenticated || isCandidateUser) && (
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
                <Button variant="secondary" className="w-full" onClick={() => (window.location.href = isCandidateUser ? '/candidate' : '/register?role=candidate')}>
                  {isCandidateUser ? 'Go to Candidate Portal' : 'Create Free Account'}
                </Button>
              </Card>
            )}

            {/* Employer Starter (Only for Public or Employers) */}
            {(!isAuthenticated || isEmployerUser) && (
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
                  onClick={() => handleSubscribe('starter', billingCycle === 'annual' ? 14388 : 1499)}
                >
                  Get Employer Starter
                </Button>
              </Card>
            )}

            {/* Enterprise (Only for Public or Employers) */}
            {(!isAuthenticated || isEmployerUser) && (
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
            )}
          </div>
        )}
      </div>

      {/* ========== SUBSCRIPTION CHECKOUT: Cart Step ========== */}
      <Dialog
        isOpen={checkoutStep === 'cart'}
        onClose={handleCloseModal}
        title="Subscription Checkout"
        maxWidth="md"
      >
        {selectedPlan && (
          <div className="py-2">
            <div className="bg-kth-slate-50 rounded-lg border border-kth-slate-200 p-4 mb-5">
              <h4 className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider mb-3">Subscription Summary</h4>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-kth-primary-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-kth-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-kth-slate-900">{selectedPlan.name}</p>
                  <p className="text-xs text-kth-slate-500">
                    {selectedPlan.billingCycle === 'annual' ? 'Annual billing (save 20%)' : 'Monthly billing'}
                  </p>
                </div>
                <div className="font-mono text-base font-bold text-kth-slate-900 shrink-0">
                  ₹{selectedPlan.amountINR.toLocaleString()}
                </div>
              </div>
              <div className="border-t border-kth-slate-200 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-kth-slate-700 uppercase">
                  {selectedPlan.billingCycle === 'annual' ? 'Annual Total' : 'Monthly Total'}
                </span>
                <span className="font-mono text-lg font-extrabold text-kth-primary-600">
                  ₹{selectedPlan.amountINR.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-kth-slate-500 mb-5">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-kth-primary-600" />
                <span>Cancel Anytime</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={handleConfirmPayment}
              >
                Subscribe Now
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========== SUBSCRIPTION CHECKOUT: Processing Step ========== */}
      <Dialog
        isOpen={checkoutStep === 'processing'}
        onClose={() => {}}
        title="Processing Subscription"
        maxWidth="sm"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-kth-primary-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin" />
          </div>
          <h4 className="font-bold text-base text-kth-slate-900 mb-2">Activating your subscription...</h4>
          <p className="text-xs text-kth-slate-500">
            Please wait while we set up your {selectedPlan?.name} plan.
          </p>
        </div>
      </Dialog>

      {/* ========== SUBSCRIPTION CHECKOUT: Success Step ========== */}
      <Dialog
        isOpen={checkoutStep === 'success'}
        onClose={handleCloseModal}
        title="Subscription Active"
        maxWidth="sm"
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-lg text-kth-slate-900 mb-1">Subscription Activated! 🎉</h4>
          <p className="text-xs text-kth-slate-500 mb-2">
            Your <strong>{selectedPlan?.name}</strong> plan is now active.
          </p>
          {transactionId && (
            <p className="text-[10px] font-mono text-kth-slate-400 mb-4">
              Transaction ID: {transactionId}
            </p>
          )}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-5">
            <p className="text-xs text-emerald-700">
              <strong>✓</strong> You now have full access to all {selectedPlan?.name} features. Head to your dashboard to get started.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
