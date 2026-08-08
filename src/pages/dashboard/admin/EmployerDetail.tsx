import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  CreditCard,
  History,
  MessageSquare,
  Lock,
  Download,
  DollarSign
} from 'lucide-react';

export const EmployerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'verification' | 'documents' | 'recruiters' | 'jobs' | 'pipeline' | 'subscription' | 'audit' | 'notes'
  >('overview');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Platform Compliance Lead', text: 'GSTIN verified against MCA portal. Corporate status approved.', date: '2026-08-04 11:20' }
  ]);

  const employer = {
    id: id || 'comp-1',
    companyName: 'GreenEarth Consultants Pvt Ltd',
    industry: 'Environmental & ESG Advisory Services',
    website: 'https://greenearth-consultants.com',
    location: 'Mumbai, Maharashtra',
    size: '250 - 500 Employees',
    gstin: '27AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    verificationStatus: 'Verified Corporate',
    recruiterCount: 8,
    activeJobsCount: 14,
    subscriptionPlan: 'Enterprise Hiring Pro',
    billingCycle: 'Annual (Renews Oct 2026)',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=256',
    about: 'GreenEarth Consultants is a leading environmental compliance and ESG reporting firm assisting Fortune 500 enterprises in transitioning to net-zero carbon operations.',
    contacts: [
      { name: 'Vikram Mehta', role: 'Head of Talent Acquisition', email: 'vikram.m@greenearth.com', phone: '+91 98200 11223' },
      { name: 'Ananya Roy', role: 'HR Operations Lead', email: 'ananya.r@greenearth.com', phone: '+91 98200 44556' }
    ],
    jobs: [
      { id: 'j-1', title: 'Senior ESG Analyst', domain: 'ESG', location: 'Mumbai', applicants: 24, status: 'Active' },
      { id: 'j-2', title: 'EHS Safety Engineer', domain: 'Compliance', location: 'Pune', applicants: 18, status: 'Active' }
    ]
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes([
      ...notes,
      { id: Date.now().toString(), author: 'Platform Admin', text: noteText, date: new Date().toLocaleString() }
    ]);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <button
          onClick={() => navigate('/dashboard/admin/employers')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employer Directory
        </button>

        <Badge variant="success" className="capitalize font-bold">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {employer.verificationStatus}
        </Badge>
      </div>

      {/* Hero Workspace Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={employer.logoUrl}
              alt={employer.companyName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">{employer.companyName}</h1>
                <Badge variant="primary" size="sm" className="font-bold">Enterprise</Badge>
              </div>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{employer.industry}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {employer.location}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {employer.size}</span>
                <span className="flex items-center gap-1 text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                  <Globe className="w-3 h-3 text-sky-600" /> {employer.website}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Re-Verify Account
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-slate-300 hover:bg-slate-50 font-bold text-xs h-10 px-4 rounded-xl text-slate-800"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Contact HR Team
            </Button>
          </div>
        </div>

        {/* Info Grid Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">GSTIN Number</span>
            <span className="font-mono font-bold text-slate-900">{employer.gstin}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">PAN Number</span>
            <span className="font-mono font-bold text-slate-900">{employer.pan}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Jobs</span>
            <span className="font-bold text-slate-900">{employer.activeJobsCount} Vacancies</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Subscription</span>
            <span className="font-bold text-slate-900">{employer.subscriptionPlan}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Company Overview', icon: Building2 },
          { id: 'verification', label: 'Verification & Tax', icon: ShieldCheck },
          { id: 'documents', label: 'Corporate Docs', icon: FileText },
          { id: 'recruiters', label: 'Recruiter Team', icon: Users },
          { id: 'jobs', label: 'Active Jobs', icon: Briefcase },
          { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'audit', label: 'Audit Log', icon: History },
          { id: 'notes', label: 'Internal Notes', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-3">
                <h3 className="text-sm font-black font-heading text-slate-900">About Enterprise</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{employer.about}</p>
              </Card>

              <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900">Primary Contact Persons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employer.contacts.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.role}</p>
                      <p className="text-[11px] text-slate-700 font-semibold">{c.email}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-3">
                <h3 className="text-sm font-black font-heading text-slate-900">Platform Account Status</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Account State</span>
                    <span className="font-bold text-emerald-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 font-semibold">Recruiter Slots</span>
                    <span className="font-bold text-slate-900">8 / 10 Active</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Legal & Compliance Verification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">GSTIN Certificate</span>
                <p className="font-mono font-bold text-slate-900">{employer.gstin}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">✓ Verified with Ministry of Corporate Affairs</p>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Corporate PAN</span>
                <p className="font-mono font-bold text-slate-900">{employer.pan}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">✓ Active & Tax Compliant</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'jobs' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Active Vacancies Posted</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {employer.jobs.map((j) => (
                <div key={j.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{j.title}</p>
                    <p className="text-[11px] text-slate-400">{j.domain} • {j.location} • {j.applicants} Applicants</p>
                  </div>
                  <Badge variant="primary" size="sm" className="font-bold">{j.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'subscription' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Subscription & Billing Tier</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{employer.subscriptionPlan}</p>
              <p className="text-slate-500">{employer.billingCycle}</p>
            </div>
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Internal Compliance Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add compliance notes for corporate review team..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50"
                rows={3}
              />
              <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold text-xs rounded-xl">
                Add Compliance Note
              </Button>
            </form>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {notes.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.author}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{n.text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployerDetail;
