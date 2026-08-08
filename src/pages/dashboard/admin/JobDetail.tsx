import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  History,
  MessageSquare,
  Sparkles,
  Award,
  Star
} from 'lucide-react';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [moderationStatus, setModerationStatus] = useState<'pending' | 'approved' | 'rejected' | 'changes_requested'>('pending');
  const [noteText, setNoteText] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState([
    { id: '1', author: 'Moderation System AI', text: 'Scanned job content. Zero illegal terms or spam signals detected.', date: '2026-08-06 09:00' }
  ]);

  const job = {
    id: id || 'job-991',
    title: 'Senior Environmental & ESG Lead',
    companyName: 'GreenEarth Consultants Pvt Ltd',
    careerDomain: 'ESG & Sustainability',
    location: 'Mumbai, India (Hybrid)',
    employmentType: 'Full Time',
    salaryRange: '₹18,00,000 - ₹24,00,000 / year',
    experienceRequired: '5+ Years',
    submittedDate: '06 Aug 2026',
    description: `We are looking for an experienced Senior ESG Lead to manage corporate sustainability disclosures, carbon footprint audits, and ISO 14001 compliance for enterprise clients across India.

Key Responsibilities:
- Conduct ESG gap analysis and materiality assessments.
- Formulate carbon accounting models adhering to GHG protocol.
- Interface with executive leadership and regulatory bodies.`,
    skillsRequired: ['ESG Reporting', 'ISO 14001', 'GHG Protocol', 'Carbon Accounting', 'EHS Compliance'],
    aiSafetyScore: '98 / 100 (Safe Listing)',
    complianceReview: {
      salaryDisclosed: true,
      legalContactVerified: true,
      discriminatoryLanguage: false,
      spamRisk: 'Low'
    }
  };

  const handleApprove = () => {
    setModerationStatus('approved');
    alert('Job approved and published to candidate job board!');
  };

  const handleReject = () => {
    setModerationStatus('rejected');
    alert('Job rejected.');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setModeratorNotes([
      ...moderatorNotes,
      { id: Date.now().toString(), author: 'Platform Moderator', text: noteText, date: new Date().toLocaleString() }
    ]);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <button
          onClick={() => navigate('/dashboard/admin/moderation')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Moderation Queue
        </button>

        <Badge
          variant={
            moderationStatus === 'approved' ? 'success' :
            moderationStatus === 'rejected' ? 'danger' : 'warning'
          }
          className="capitalize font-bold"
        >
          Status: {moderationStatus}
        </Badge>
      </div>

      {/* Hero Workspace Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Vacancy Moderation Audit</span>
            <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight mt-0.5">{job.title}</h1>
            <p className="text-sm font-bold text-slate-600 flex items-center gap-1.5 mt-1">
              <Building2 className="w-4 h-4 text-slate-400" /> {job.companyName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Listing
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-bold text-xs h-10 px-4 rounded-xl"
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Reject Listing
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Domain</span>
            <span className="font-bold text-slate-900">{job.careerDomain}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Location</span>
            <span className="font-bold text-slate-900">{job.location}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Offered Salary</span>
            <span className="font-bold text-slate-900">{job.salaryRange}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Date</span>
            <span className="font-bold text-slate-900">{job.submittedDate}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-3">
            <h3 className="text-sm font-black font-heading text-slate-900">Job Description</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">{job.description}</p>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-3">
            <h3 className="text-sm font-black font-heading text-slate-900">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((s) => (
                <span key={s} className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-200/70">
                  {s}
                </span>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Moderator Notes & Log</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add moderator audit note..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50"
                rows={3}
              />
              <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold text-xs rounded-xl">
                Add Audit Note
              </Button>
            </form>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {moderatorNotes.map((n) => (
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
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> AI Safety & Compliance Review
            </h3>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Safety Score</span>
                <span className="font-bold text-emerald-700">{job.aiSafetyScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Salary Disclosed</span>
                <span className="font-bold text-emerald-700">✓ Yes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Discriminatory Content</span>
                <span className="font-bold text-emerald-700">✓ None Detected</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
