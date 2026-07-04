import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { Mail, MapPin, Phone, MessageSquare, Sparkles } from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-contact" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-contact)" />
    </svg>
  </div>
);

export const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Support', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus(null);

    // Simulate network submission
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      setForm({ name: '', email: '', subject: 'General Support', message: '' });
    }, 1200);
  };

  const contactDetails = [
    { label: 'Partnerships & Sales', val: 'partnerships@knowtohire.com', icon: Mail, color: 'from-emerald-500 to-teal-500' },
    { label: 'Phone Assistance', val: '+1 (800) 555-KNOW', icon: Phone, color: 'from-blue-500 to-indigo-500' },
    { label: 'Platform Headquarters', val: 'San Francisco, CA', icon: MapPin, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="flex flex-col w-full bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-slate-50/50 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <DotGrid className="text-slate-400 opacity-25" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Get In Touch</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
            How Can We <span className="kth-gradient-text">Assist You?</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Have questions about dashboard setups, enterprise licensing, or our product roadmap? Our support team is ready to respond.
          </p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Details Column — 4/12 */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <h3 className="text-sm font-extrabold font-heading text-slate-400 tracking-wider uppercase">Contact Details</h3>
            <div className="space-y-4">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div
                    key={detail.label}
                    className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="relative w-10 h-10 shrink-0">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 text-slate-700" />
                      </div>
                      <div className={`absolute -inset-1 rounded-lg bg-gradient-to-br ${detail.color} opacity-0 group-hover:opacity-15 blur-sm transition-opacity`} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{detail.label}</p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{detail.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Column — 8/12 */}
          <div className="lg:col-span-8">
            <Card className="bg-white border border-slate-200 p-8 rounded-[24px] shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-4 right-4 text-emerald-400/30">
                <Sparkles className="w-6 h-6" />
              </div>
              
              <CardHeader className="p-0 pb-6 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900">Inquiry Form</CardTitle>
                <CardDescription className="text-sm text-slate-450 mt-1">Fill out the form below, and we will get back to you within 24 hours.</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === 'success' && (
                    <Alert type="success" title="Inquiry Received" onClose={() => setStatus(null)}>
                      Thank you! Your message was submitted successfully.
                    </Alert>
                  )}
                  {status === 'error' && (
                    <Alert type="error" title="Validation Failed" onClose={() => setStatus(null)}>
                      Please fill out all required fields marked with an asterisk (*).
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your name"
                      className="border-slate-200 focus:border-emerald-500 focus:ring-1 h-11 bg-slate-50/50 rounded-xl"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@company.com"
                      className="border-slate-200 focus:border-emerald-500 focus:ring-1 h-11 bg-slate-50/50 rounded-xl"
                    />
                  </div>

                  <Select
                    label="Inquiry Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    options={[
                      { value: 'General Support', label: 'General Platform Support' },
                      { value: 'Employer Scouting', label: 'Employer Dashboard Scouting' },
                      { value: 'Candidate Profiles', label: 'Candidate Profile Hub' },
                      { value: 'Partner Inquiries', label: 'Partner Program' },
                    ]}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-1 h-11 bg-slate-50/50 rounded-xl"
                  />

                  <div className="flex flex-col space-y-1.5 w-full">
                    <label htmlFor="message-input" className="text-xs font-semibold text-slate-700 tracking-wide">
                      Message Body <span className="text-red-500 font-bold">*</span>
                    </label>
                    <textarea
                      id="message-input"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Type your inquiry details here..."
                      className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-900 bg-slate-50/50 placeholder-slate-400 border-solid border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none min-h-[140px] transition-all duration-150"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" isLoading={loading} className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold h-11 px-8 rounded-xl shadow-md transition-all">
                      Submit Inquiry
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
