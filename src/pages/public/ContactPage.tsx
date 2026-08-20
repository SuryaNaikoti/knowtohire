import React, { useState } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="py-16 bg-kth-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Get In Touch"
          badgeVariant="cyan"
          title="Contact KnowToHire Support"
          subtitle="Have questions about job postings, template downloads, or enterprise ATS plans? We're here to help."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Card className="md:col-span-7 p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-kth-slate-900 mb-1">Message Received!</h4>
                <p className="text-xs text-kth-slate-500 mb-4">Our support team will respond within 24 business hours.</p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <Input label="Full Name" placeholder="Jane Doe" required />
                <Input label="Work Email Address" type="email" placeholder="jane@company.com" required />
                <Select
                  label="Subject Category"
                  options={[
                    { value: 'employer', label: 'Employer Hiring & Post Job Inquiry' },
                    { value: 'candidate', label: 'Candidate Account & Application Query' },
                    { value: 'template', label: 'Template Marketplace & Billing' },
                    { value: 'other', label: 'General Inquiry' },
                  ]}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-kth-slate-800">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist your career or hiring needs?"
                    className="w-full font-sans text-sm p-3 rounded-md bg-white border border-kth-slate-200 text-kth-slate-900 placeholder:text-kth-slate-400 outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-600/20"
                  />
                </div>
                <Button variant="primary" type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </Card>

          <div className="md:col-span-5 space-y-4">
            <Card className="p-6 space-y-4 text-xs text-kth-slate-700">
              <h4 className="font-bold text-sm text-kth-slate-900 border-b pb-2">India Office Coordinates</h4>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                <span>KnowToHire India Technology Center, Outer Ring Road, Bengaluru, Karnataka 560103</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-kth-primary-600 shrink-0" />
                <span>support@knowtohire.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-kth-primary-600 shrink-0" />
                <span>+91 80 4920 1800</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
