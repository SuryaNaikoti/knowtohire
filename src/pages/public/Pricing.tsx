import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Check, HelpCircle, ArrowRight, ChevronDown, Sparkles, ShieldCheck, Award, CheckCircle } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-pricing" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-pricing)" />
    </svg>
  </div>
);

export const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Talent Basic',
      sub: 'Job Seekers & Professionals',
      price: 0,
      period: 'always free',
      desc: 'Access standard job search, build matching profiles, and check primary resources databases.',
      cta: 'Get Started Free',
      features: [
        'Build ATS-optimized profile & parser upload.',
        'View & search 50,000+ active job openings.',
        'Save up to 10 job bookmarks.',
        'Standard job application submissions.',
        'Access 3 free template files & manuals.'
      ],
      popular: false
    },
    {
      name: 'Talent Pro',
      sub: 'Accelerate Career Transitions',
      price: billingPeriod === 'monthly' ? 999 : 799,
      period: billingPeriod === 'monthly' ? '/ month' : '/ month, billed annually',
      desc: 'Gain advanced matching intelligence, detailed salary analytics, and unlimited templates downloads.',
      cta: 'Unlock Pro Trial',
      features: [
        'Everything in Talent Basic.',
        'Priority matching score highlights (automated insights).',
        'Unlimited template downloads.',
        'Direct message channels with verified employers.',
        'Advanced salary analysis & market intelligence tools.',
        '24/7 priority customer support.'
      ],
      popular: true
    },
    {
      name: 'Employer Scout',
      sub: 'Find & Moderate Elite Candidates',
      price: billingPeriod === 'monthly' ? 4999 : 3999,
      period: billingPeriod === 'monthly' ? '/ month' : '/ month, billed annually',
      desc: 'Complete candidate sourcing suites featuring draggable Kanban workflow boards and matching dossiers.',
      cta: 'Launch Employer Account',
      features: [
        'Post unlimited job slots.',
        'Access candidate matching rating indices.',
        'Full Kanban recruiting pipelines controls.',
        'Detailed dossier analytics and background extraction logs.',
        'Team integration permissions up to 5 members.',
        'Direct templates submissions approval rights.'
      ],
      popular: false
    }
  ];

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen animate-fade-in-up">
      {/* Header Panel */}
      <div className="relative bg-white border-b border-slate-150 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <DotGrid className="text-slate-400 opacity-25" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Predictable Pricing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
            Simple, Value-Driven Plans
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Upgrade to unlock premium career resources, automated templates downloads, or recruiter workflow pipelines.
          </p>

          {/* Toggle Switch */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 rounded-full p-1 shadow-sm select-none">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingPeriod === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  billingPeriod === 'annual'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual <span className="text-[9px] font-black bg-teal-500 text-white px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 w-full flex flex-col space-y-24">
        
        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto w-full">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`hover:shadow-premium transition-all flex flex-col justify-between overflow-hidden relative bg-white shadow-sm rounded-[24px] ${
                plan.popular
                  ? 'border-2 border-emerald-500 shadow-premium lg:scale-105 z-10 kth-animate-pulse-glow'
                  : 'border border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-0 right-6 translate-y-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] uppercase tracking-widest font-black px-3.5 py-1 rounded-full shadow-md z-10">
                  Most Popular
                </span>
              )}
              <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-8 text-left">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                      {plan.sub}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1 font-heading">
                      {plan.name}
                    </h2>
                  </div>
                  
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-4xl font-black text-slate-900 font-heading">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {plan.period}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 font-normal leading-relaxed border-b border-slate-100 pb-6">
                    {plan.desc}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 pt-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/register" className="block w-full pt-4">
                  <Button variant={plan.popular ? 'primary' : 'outline'} className={`w-full py-3 text-xs font-bold shadow-sm rounded-xl flex items-center justify-center gap-1.5 ${
                    plan.popular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' : ''
                  }`}>
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SSL Encrypted</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Cancel Anytime</span>
          <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-emerald-500" /> 30-Day Money Back Guarantee</span>
        </div>

        {/* FAQ Accordion Preview */}
        <section className="max-w-3xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest text-center flex items-center justify-center gap-2 font-heading border-b border-slate-100 pb-5">
            <HelpCircle className="w-4 h-4 text-slate-400" /> Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="group border-b border-slate-100 pb-4 last:border-0 last:pb-0" open>
              <summary className="flex justify-between items-center text-sm font-bold text-slate-700 hover:text-emerald-650 transition-colors cursor-pointer select-none">
                How does the resume parser work?
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed pl-1">
                When uploading your PDF resume inside the CV Hub, our extraction engine parses names, skills tags, and job records, mapping them automatically as editable profile segments.
              </p>
            </details>
            <details className="group border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <summary className="flex justify-between items-center text-sm font-bold text-slate-700 hover:text-emerald-650 transition-colors cursor-pointer select-none">
                Can I cancel my premium subscription at any time?
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed pl-1">
                Yes, premium memberships run on month-to-month contracts and can be modified or canceled anytime directly from the Account Settings panel.
              </p>
            </details>
            <details className="group border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <summary className="flex justify-between items-center text-sm font-bold text-slate-700 hover:text-emerald-650 transition-colors cursor-pointer select-none">
                Is there a custom team plan for corporate divisions?
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed pl-1">
                Yes! We offer customized licensing bundles for large sourcing divisions. You can reach out directly via the Contact page or email our corporate sales team.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
