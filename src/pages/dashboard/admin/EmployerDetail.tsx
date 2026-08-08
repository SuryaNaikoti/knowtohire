// KnowToHire V1.0 — Employer Audit Profile (Full Redesign)
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  Mail,
  Download,
  XCircle,
  Clock,
  ChevronRight,
  Calendar,
  CreditCard,
  MessageSquare,
  Send,
  Check
} from 'lucide-react';

type TabId = 'overview' | 'verification' | 'jobs' | 'recruiters' | 'subscription' | 'audit' | 'notes';

export const EmployerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [noteText, setNoteText] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('verified');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Platform Compliance Lead', text: 'GSTIN verified against MCA portal. Corporate status approved.', date: '2026-08-04 11:20' },
    { id: '2', author: 'Rajeev Nair (Super Admin)', text: 'Enterprise tier subscription confirmed. Priority account.', date: '2026-08-06 09:45' }
  ]);

  const employer = {
    id: id || 'comp-1',
    companyName: 'GreenEarth Consultants Pvt Ltd',
    industry: 'Environmental & ESG Advisory Services',
    website: 'https://greenearth-consultants.com',
    location: 'Mumbai, Maharashtra',
    size: '250–500 Employees',
    gstin: '27AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    cin: 'U74999MH2019PTC328456',
    recruiterCount: 8,
    activeJobsCount: 14,
    totalApplications: 186,
    subscriptionPlan: 'Enterprise Hiring Pro',
    billingCycle: 'Annual (Renews Oct 2026)',
    monthlySpend: '₹1,49,000',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=256',
    about: 'GreenEarth Consultants is a leading environmental compliance and ESG reporting firm assisting Fortune 500 enterprises in transitioning to net-zero carbon operations. Founded in 2019, headquartered in Mumbai.',
    contacts: [
      { name: 'Vikram Mehta', role: 'Head of Talent Acquisition', email: 'vikram.m@greenearth.com', phone: '+91 98200 11223' },
      { name: 'Ananya Roy', role: 'HR Operations Lead', email: 'ananya.r@greenearth.com', phone: '+91 98200 44556' }
    ],
    jobs: [
      { id: 'j-1', title: 'Senior ESG Analyst', domain: 'ESG & Compliance', location: 'Mumbai', applicants: 24, status: 'Active', posted: '2026-07-20' },
      { id: 'j-2', title: 'EHS Safety Engineer', domain: 'Engineering', location: 'Pune', applicants: 18, status: 'Active', posted: '2026-07-25' },
      { id: 'j-3', title: 'Carbon Accounting Lead', domain: 'Finance & ESG', location: 'Bengaluru', applicants: 9, status: 'Active', posted: '2026-08-01' },
      { id: 'j-4', title: 'Environmental Impact Consultant', domain: 'Advisory', location: 'Delhi NCR', applicants: 31, status: 'Active', posted: '2026-08-03' },
    ],
    recruiters: [
      { name: 'Vikram Mehta', role: 'Head of Talent Acquisition', email: 'vikram.m@greenearth.com', jobsPosted: 6, lastActive: '2 hours ago' },
      { name: 'Ananya Roy', role: 'HR Operations Lead', email: 'ananya.r@greenearth.com', jobsPosted: 4, lastActive: 'Yesterday' },
      { name: 'Saurabh Patel', role: 'Technical Recruiter', email: 's.patel@greenearth.com', jobsPosted: 4, lastActive: '3 days ago' },
    ],
    auditTrail: [
      { action: 'Verification Status Changed', detail: 'Status set to Verified by Rajeev Nair', date: '2026-08-04 11:25', type: 'verification' },
      { action: 'Document Upload', detail: 'GSTIN Certificate uploaded', date: '2026-08-03 14:10', type: 'document' },
      { action: 'Account Created', detail: 'Employer account registered via onboarding flow', date: '2026-07-15 09:00', type: 'account' },
    ]
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes([
      ...notes,
      { id: Date.now().toString(), author: 'Platform Admin (You)', text: noteText, date: new Date().toLocaleString() }
    ]);
    setNoteText('');
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'jobs', label: `Active Jobs (${employer.activeJobsCount})`, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'recruiters', label: 'Recruiter Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
    { id: 'notes', label: `Admin Notes (${notes.length})`, icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const getVerificationBadge = (status: string) => {
    if (status === 'verified') return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/70"><CheckCircle2 className="w-3.5 h-3.5" /> Verified Corporate</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200/70"><XCircle className="w-3.5 h-3.5" /> Verification Rejected</span>;
    return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/70"><Clock className="w-3.5 h-3.5" /> Pending Audit</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Breadcrumb & Back Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => navigate('/dashboard/admin/employers')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Employer Directory
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate">{employer.companyName}</span>
      </div>

      {/* Executive Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Company Logo / Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 border-2 border-slate-200 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              {employer.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
            </div>

            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                    {employer.companyName}
                  </h1>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{employer.industry}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {getVerificationBadge(verificationStatus)}
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {employer.location}
                    </span>
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3 h-3" /> {employer.website.replace('https://', '')}
                    </a>
                  </div>
                </div>

                {/* Quick Admin Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
                    onClick={() => setVerificationStatus('verified')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-9 px-4 rounded-xl gap-1.5"
                    onClick={() => setVerificationStatus('rejected')}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs h-9 px-3 rounded-xl gap-1.5"
                    onClick={() => {
                      const csv = `Company,${employer.companyName}\nIndustry,${employer.industry}\nStatus,${verificationStatus}\nLocation,${employer.location}`;
                      const a = document.createElement('a');
                      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                      a.download = `employer_${employer.id}.csv`;
                      a.click();
                    }}
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                {[
                  { label: 'Active Jobs', value: employer.activeJobsCount, icon: <Briefcase className="w-4 h-4 text-sky-500" /> },
                  { label: 'Recruiters', value: employer.recruiterCount, icon: <Users className="w-4 h-4 text-indigo-500" /> },
                  { label: 'Applications', value: employer.totalApplications, icon: <FileText className="w-4 h-4 text-emerald-500" /> },
                  { label: 'Team Size', value: employer.size, icon: <Building2 className="w-4 h-4 text-amber-500" /> },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{stat.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tab Bar — horizontally scrollable on mobile */}
        <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-2">About the Company</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{employer.about}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-3">Company Details</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Industry', value: employer.industry },
                      { label: 'Company Size', value: employer.size },
                      { label: 'Location', value: employer.location },
                      { label: 'Website', value: employer.website.replace('https://', '') },
                    ].map(item => (
                      <div key={item.label} className="flex items-start justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-semibold text-slate-400 w-28 shrink-0">{item.label}</span>
                        <span className="text-xs font-bold text-slate-800 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-3">Primary Contacts</h3>
                  <div className="space-y-3">
                    {employer.contacts.map((contact) => (
                      <div key={contact.email} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{contact.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{contact.role}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <a href={`mailto:${contact.email}`} className="text-[11px] font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VERIFICATION TAB */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">Verification & Compliance Status</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Manage corporate identity verification and compliance documents.</p>
                </div>
                {getVerificationBadge(verificationStatus)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'GSTIN', value: employer.gstin, status: 'verified' },
                  { label: 'PAN', value: employer.pan, status: 'verified' },
                  { label: 'CIN', value: employer.cin, status: 'verified' },
                  { label: 'GST Registration', value: 'Active — Maharashtra', status: 'verified' },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{item.value}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200/60">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5"
                  onClick={() => setVerificationStatus('verified')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve Verification
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-9 px-4 rounded-xl gap-1.5"
                  onClick={() => setVerificationStatus('rejected')}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject & Flag
                </Button>
              </div>
            </div>
          )}

          {/* ACTIVE JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Active Job Postings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Domain</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Applicants</th>
                      <th className="py-3 px-4">Posted</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employer.jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => navigate(`/dashboard/admin/moderation/${job.id}`)}>
                        <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{job.title}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{job.domain}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{job.location}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">{job.applicants}</span>
                          <span className="text-slate-400 font-medium"> applicants</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium">{job.posted}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RECRUITERS TAB */}
          {activeTab === 'recruiters' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Recruiter Directory</h3>
              <div className="space-y-3">
                {employer.recruiters.map((rec) => (
                  <div key={rec.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                        {rec.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{rec.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{rec.role}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-700">{rec.jobsPosted} jobs posted</p>
                      <p className="text-[11px] text-slate-400 font-medium">Last active: {rec.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Subscription & Billing</h3>
              <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</p>
                    <h4 className="text-xl font-black font-heading mt-1">{employer.subscriptionPlan}</h4>
                    <p className="text-sm text-slate-300 font-medium mt-1">{employer.billingCycle}</p>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    Active
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Platform Spend</p>
                  <p className="text-2xl font-black font-heading mt-1 text-emerald-400">{employer.monthlySpend}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Plan Type', value: 'Enterprise' },
                  { label: 'Billing Cycle', value: 'Annual' },
                  { label: 'Next Renewal', value: 'Oct 2026' },
                  { label: 'Payment Mode', value: 'Bank Transfer (NEFT)' },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Employer Audit Trail</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-0">
                  {employer.auditTrail.map((entry, idx) => (
                    <div key={idx} className="flex gap-4 pl-10 pb-6 relative">
                      <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-white ${entry.type === 'verification' ? 'bg-emerald-500' : entry.type === 'document' ? 'bg-sky-500' : 'bg-slate-400'} shadow-sm`} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">{entry.action}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{entry.detail}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {entry.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Admin Notes & Internal Observations</h3>

              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{note.text}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-4 rounded-full bg-amber-300 text-amber-900 flex items-center justify-center text-[8px] font-black">
                        {note.author[0]}
                      </div>
                      <span className="text-[10px] font-bold text-amber-700">{note.author}</span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">{note.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-3 pt-3 border-t border-slate-100">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  placeholder="Add an internal admin note about this employer..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200/90 bg-slate-50 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all resize-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 self-end"
                  disabled={!noteText.trim()}
                >
                  <Send className="w-3.5 h-3.5" /> Add Note
                </Button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmployerDetail;
