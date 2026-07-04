import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Calendar, Hammer, Building, Users, Star, ArrowRight, ShieldCheck, Mail, Sparkles, MessageSquare } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-employers" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-employers)" />
    </svg>
  </div>
);

export const ComingSoon: React.FC = () => {
  const [searchParams] = useSearchParams();
  const featureName = searchParams.get('feature') || 'Feature Module';

  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If the requested coming soon feature is NOT Employers, render a generic clean coming soon state.
  // Otherwise, render the full Employer marketing landing page.
  const isEmployerFeature = featureName.toLowerCase() === 'employers' || featureName.toLowerCase() === 'postjob';

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setWaitlistSuccess(true);
      setWaitlistEmail('');
    }, 1200);
  };

  if (!isEmployerFeature) {
    return (
      <div className="flex-1 bg-slate-50/30 flex items-center justify-center py-24 px-4 animate-fade-in-up">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Hammer className="w-8 h-8" />
          </div>

          <div className="space-y-3 text-center">
            <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
              Sprint 2 Roadmap
            </span>
            <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              {featureName} Coming Soon
            </h1>
            <p className="text-sm text-slate-500 font-normal leading-relaxed">
              The {featureName} dashboard and search systems are scheduled for development in **Sprint 2**. The current build is focusing on the design system, navigation structures, and authentication shells.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 text-left space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-350" /> Sprint Roadmap
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 font-semibold">
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                <span>Sprint 1: Platform Foundation (Completed)</span>
              </li>
              <li className="flex items-center gap-2 text-emerald-700">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>Sprint 2: Jobs, Hubs & Scouting Engine (Active)</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link to="/">
              <Button className="w-full text-xs font-bold h-11 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-md" variant="primary">
                Back to Home
              </Button>
            </Link>
            <Link to="/about">
              <Button className="w-full text-xs font-bold h-11 border-slate-200 hover:bg-slate-50 rounded-xl" variant="outline">
                Read Timelines
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Employer Landing waitlist page v4.0
  return (
    <div className="flex flex-col w-full bg-white animate-fade-in-up">
      {/* Hero waitlist banner */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.08),transparent_50%)] pointer-events-none" />
        <DotGrid className="text-white opacity-5" />

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column — 7/12 */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Building className="w-3.5 h-3.5" />
              <span>KnowToHire for Employers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight leading-none text-white">
              Hire Smarter with <span className="kth-gradient-text">Career Intelligence.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-350 max-w-xl font-medium leading-relaxed">
              Find, screen, and manage candidates across 15+ industries. Filter by verified match scores, candidate portfolios, and credentials.
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-slate-350 font-bold pt-2">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated CV Parsing</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-400" /> Vetted Portfolios</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-emerald-400" /> Talent Match Index</span>
            </div>
          </div>

          {/* Right Column — Waitlist Form Card — 5/12 */}
          <div className="lg:col-span-5 w-full">
            <Card className="bg-white/5 border border-white/10 p-8 rounded-[24px] shadow-2xl relative overflow-hidden backdrop-blur-md text-left">
              <div className="absolute top-4 right-4 text-emerald-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>

              {waitlistSuccess ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Waitlist Registration Successful</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Thank you! We will notify you at your professional address as soon as developer scouting access opens in **Sprint 2**.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Scouting Access Waitlist</p>
                    <h3 className="text-lg font-bold text-white">Register for Scouting Access</h3>
                    <p className="text-xs text-slate-300 leading-normal font-semibold">
                      Join the waitlist of 250+ top companies waiting for Sprint 2 hiring features.
                    </p>
                  </div>

                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-11 w-full rounded-xl text-sm"
                    aria-label="Waitlist email"
                  />

                  <Button type="submit" isLoading={loading} className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5">
                    <span>Join waiting list</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-650 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recruiting Suite</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
            Enterprise Recruiting Features
          </h2>
          <p className="text-base text-slate-500 font-medium max-w-2xl mx-auto">
            Everything you need to find, track, and hire top-tier talent in one unified dashboard interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Talent Match Index', desc: 'Sort candidates by proprietary AI match scores based on resume parsing and credential verification.', icon: Star, color: 'from-blue-500 to-indigo-500' },
            { title: 'Kanban Recruiting Pipeline', desc: 'Drag and drop candidate cards across custom stages from Application, Screen, Technical to Offer.', icon: Hammer, color: 'from-emerald-500 to-teal-500' },
            { title: 'Response SLA Guarantees', desc: 'Our platform coordinates communication logs automatically to ensure candidate support loops stay active.', icon: MessageSquare, color: 'from-purple-500 to-pink-500' }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hoverEffect className="bg-white border border-slate-200 p-8 rounded-[24px] shadow-sm flex flex-col justify-between group text-left">
                <div className="space-y-6">
                  <div className="relative w-12 h-12">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-slate-800" />
                    </div>
                    <div className={`absolute -inset-1 rounded-xl bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-15 blur-sm transition-opacity`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">{feat.title}</h3>
                    <p className="text-sm text-slate-500 font-normal leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ComingSoon;
