// KnowToHire V1.0 — Candidate Profile (Admin View) — Full Responsive Redesign
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  Building2,
  MessageSquare,
  ChevronRight,
  Send,
  XCircle
} from 'lucide-react';

type TabId = 'overview' | 'experience' | 'education' | 'skills' | 'applications' | 'notes';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [noteText, setNoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Rajeev Nair (Admin)', text: 'Verified degree certificates from IIT Bombay. Strong ESG background. Recommend for featured spotlight.', date: '2026-08-05 14:30' }
  ]);

  const candidate = {
    id: id || 'cand-1',
    name: 'Rahul Sharma',
    headline: 'Senior Environmental & ESG Consultant',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    availability: 'Immediate (15 days notice)',
    expectedSalary: '₹24,00,000 / year',
    experienceYears: '7.5 Years',
    verificationStatus: 'Verified Candidate',
    bio: 'Results-driven Senior Environmental Engineer and ESG Analyst with over 7 years of expertise in industrial compliance, carbon footprint reduction, ISO 14001 audits, and sustainability disclosures. Strong track record delivering net-zero roadmaps for Fortune 500 manufacturers.',
    skills: ['ESG Reporting', 'ISO 14001', 'Environmental Impact Assessment', 'Carbon Accounting', 'GRI Standards', 'Waste Management', 'EHS Governance', 'BRSR Compliance'],
    experience: [
      {
        company: 'GreenEarth Consultants',
        role: 'Lead ESG Specialist',
        period: '2022 – Present',
        description: 'Led ESG auditing and sustainability reporting for 12 enterprise clients across manufacturing and energy sectors. Delivered BRSR and GRI-aligned reports for 3 NSE-listed companies.'
      },
      {
        company: 'SustainEdge Solutions',
        role: 'Environmental Compliance Engineer',
        period: '2019 – 2022',
        description: 'Managed environmental safety disclosures and pollution abatement programs. Reduced industrial effluent output by 40% through ZLD implementation.'
      },
      {
        company: 'EcoSystems India',
        role: 'Junior EIA Analyst',
        period: '2017 – 2019',
        description: 'Conducted environmental impact assessments for large infrastructure and industrial projects across Maharashtra and Gujarat.'
      }
    ],
    education: [
      {
        degree: 'M.Tech in Environmental Engineering',
        institution: 'Indian Institute of Technology (IIT) Bombay',
        year: '2019',
        grade: 'CGPA 9.1 / 10'
      },
      {
        degree: 'B.E. in Chemical Engineering',
        institution: 'University of Mumbai',
        year: '2017',
        grade: 'First Class with Distinction'
      }
    ],
    certifications: [
      { title: 'Certified Sustainability Professional (GRI)', issuer: 'Global Reporting Initiative', year: '2021' },
      { title: 'ISO 14001 Lead Auditor', issuer: 'BSI Group', year: '2020' },
      { title: 'NEBOSH International General Certificate', issuer: 'NEBOSH', year: '2022' }
    ],
    applications: [
      { id: 'app-101', jobTitle: 'Senior Environmental Engineer', company: 'GreenEarth Consultants', status: 'Shortlisted', date: '2026-07-28' },
      { id: 'app-102', jobTitle: 'ESG Compliance Director', company: 'EcoTech Global', status: 'Under Review', date: '2026-08-01' },
      { id: 'app-103', jobTitle: 'Head of Sustainability', company: 'PatentNexus', status: 'Applied', date: '2026-08-05' }
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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(candidate.email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'experience', label: 'Work Experience', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'education', label: 'Education & Certs', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'skills', label: 'Verified Skills', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'applications', label: `Applications (${candidate.applications.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'notes', label: `Admin Notes (${notes.length})`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  const getApprovalBadge = (status: string) => {
    if (status === 'approved') return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/70"><CheckCircle2 className="w-3.5 h-3.5" /> Verified Candidate</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200/70"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
    return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/70"><Clock className="w-3.5 h-3.5" /> Pending Review</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in-up pb-16 w-full max-w-full overflow-x-hidden">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => navigate('/dashboard/admin/candidates')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Candidate Directory
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate">{candidate.name}</span>
      </div>

      {/* Hero Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Accent gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        <div className="p-5 sm:p-7">
          {/* Top Row: Avatar + Info + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-black text-xl shrink-0 border-2 border-slate-200 shadow-sm select-none">
              {candidate.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>

            {/* Name + Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="min-w-0">
                  {/* Clickable name copies email */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleCopyEmail}
                      className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight hover:text-emerald-600 transition-colors cursor-pointer text-left"
                      title={copied ? 'Email copied!' : 'Click to copy email'}
                    >
                      {candidate.name}
                    </button>
                    {copied && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-fade-in-up">
                        Email copied!
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">{candidate.headline}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {getApprovalBadge(approvalStatus)}
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {candidate.location}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Open to Work
                    </span>
                  </div>
                </div>

                {/* Admin Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3 rounded-xl gap-1.5"
                    onClick={() => setApprovalStatus('approved')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-9 px-3 rounded-xl gap-1.5"
                    onClick={() => setApprovalStatus('rejected')}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs h-9 px-3 rounded-xl gap-1.5"
                    onClick={() => {
                      const csv = `Name,${candidate.name}\nEmail,${candidate.email}\nHeadline,${candidate.headline}`;
                      const a = document.createElement('a');
                      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                      a.download = `candidate_${candidate.id}.csv`;
                      a.click();
                    }}
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>
              </div>

              {/* Quick Info Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-slate-100">
                {[
                  { icon: <Mail className="w-3.5 h-3.5 text-slate-400" />, label: 'Email', value: candidate.email, clickable: true },
                  { icon: <Phone className="w-3.5 h-3.5 text-slate-400" />, label: 'Phone', value: candidate.phone },
                  { icon: <Briefcase className="w-3.5 h-3.5 text-slate-400" />, label: 'Experience', value: candidate.experienceYears },
                  { icon: <DollarSign className="w-3.5 h-3.5 text-slate-400" />, label: 'Expected CTC', value: candidate.expectedSalary },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.icon}
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{item.label}</span>
                    </div>
                    {item.clickable ? (
                      <button
                        onClick={handleCopyEmail}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer truncate block w-full text-left"
                        title="Click to copy"
                      >
                        {item.value}
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation + Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tabs — scrollable on mobile, no horizontal page overflow */}
        <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-7">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-2">Professional Summary</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{candidate.bio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Verification Dossier */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-3">Verification Dossier</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Identity Document', value: '✓ Aadhaar Verified', ok: true },
                      { label: 'Degree Credentials', value: '✓ IIT Bombay Verified', ok: true },
                      { label: 'Background Check', value: '✓ Clear', ok: true },
                      { label: 'Employment History', value: '✓ Confirmed via References', ok: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                        <span className={`text-xs font-bold ${item.ok ? 'text-emerald-600' : 'text-rose-500'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Preferences */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-3">Career Preferences</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Availability', value: candidate.availability },
                      { label: 'Preferred Location', value: 'Mumbai / Hybrid' },
                      { label: 'Desired Role', value: 'Senior ESG Director' },
                      { label: 'Work Mode', value: 'Hybrid / Remote' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                        <span className="text-xs font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Skills Preview */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-3">Core Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.slice(0, 6).map((s) => (
                    <span key={s} className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200/70">
                      {s}
                    </span>
                  ))}
                  {candidate.skills.length > 6 && (
                    <button
                      onClick={() => setActiveTab('skills')}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-600 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-300 transition-colors cursor-pointer"
                    >
                      +{candidate.skills.length - 6} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Work Experience</h3>
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 bottom-1 w-px bg-slate-200" />
                {candidate.experience.map((exp, idx) => (
                  <div key={idx} className="relative mb-6 last:mb-0">
                    <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                        <Building2 className="w-3 h-3 text-slate-400" /> {exp.company}
                      </p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION & CERTIFICATIONS */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-4">Education</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{edu.institution}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400">{edu.year}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">{edu.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-4">Professional Certifications</h3>
                <div className="space-y-3">
                  {candidate.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900">{cert.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cert.issuer} · {cert.year}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VERIFIED SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Verified Technical Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {candidate.skills.map((s) => (
                  <div key={s} className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{s}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Active Job Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {candidate.applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/admin/applications/${app.id}`)}>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{app.jobTitle}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" /> {app.company}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium">{app.date}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge
                            variant={app.status === 'Shortlisted' ? 'success' : app.status === 'Under Review' ? 'warning' : 'secondary'}
                            size="sm"
                            className="font-bold"
                          >
                            {app.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Internal Admin Notes</h3>

              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{n.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-4 rounded-full bg-amber-300 text-amber-900 flex items-center justify-center text-[8px] font-black">
                        {n.author[0]}
                      </div>
                      <span className="text-[10px] font-bold text-amber-700">{n.author}</span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-3 pt-3 border-t border-slate-100">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  placeholder="Add an internal admin note about this candidate..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200/90 bg-slate-50 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all resize-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 self-end shrink-0"
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

export default CandidateDetail;
