import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StaggerGrid, StaggerItem } from '../../../components/ui/Motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  Building2,
  FolderGit2,
  Globe,
  Sparkles,
  MessageSquare,
  FileCheck,
  History,
  Lock,
  Layers,
  Star
} from 'lucide-react';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'resume' | 'experience' | 'education' | 'skills' | 'portfolio' | 'preferences' | 'applications' | 'audit' | 'notes'
  >('overview');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Rajeev Sharma (Admin)', text: 'Verified degree certificates from IIT Bombay. Strong ESG background.', date: '2026-08-05 14:30' }
  ]);

  const candidate = {
    id: id || 'usr_c1',
    name: 'Rahul Sharma',
    headline: 'Senior Environmental & ESG Consultant',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    availability: 'Immediate (15 days notice)',
    expectedSalary: '₹24,00,000 / year ($28,000 USD)',
    experienceYears: '7.5 Years',
    verificationStatus: 'Verified Candidate',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    bio: 'Results-driven Senior Environmental Engineer and ESG Analyst with over 7 years of expertise in industrial compliance, carbon footprint reduction, ISO 14001 audits, and sustainability disclosures.',
    skills: ['ESG Reporting', 'ISO 14001', 'Environmental Impact Assessment', 'Carbon Accounting', 'GRI Standards', 'Waste Management', 'EHS Governance'],
    experience: [
      {
        company: 'GreenEarth Consultants',
        role: 'Lead ESG Specialist',
        period: '2022 - Present',
        description: 'Led ESG auditing and sustainability reporting for 12 enterprise clients across manufacturing and energy sectors.'
      },
      {
        company: 'SustainEdge Solutions',
        role: 'Environmental Compliance Engineer',
        period: '2019 - 2022',
        description: 'Managed environmental safety disclosures and pollution abatement programs.'
      }
    ],
    education: [
      {
        degree: 'M.Tech in Environmental Engineering',
        institution: 'Indian Institute of Technology (IIT) Bombay',
        year: '2019'
      },
      {
        degree: 'B.E. in Chemical Engineering',
        institution: 'Mumbai University',
        year: '2017'
      }
    ],
    certifications: [
      { title: 'Certified Sustainability Professional (GRI)', issuer: 'Global Reporting Initiative', year: '2021' },
      { title: 'ISO 14001 Lead Auditor', issuer: 'BSI Group', year: '2020' }
    ],
    projects: [
      { name: 'Industrial Carbon Accounting Dashboard', description: 'Real-time carbon emissions tracking web application for manufacturing plants.', link: 'https://github.com/example/carbon-dashboard' },
      { name: 'Zero Liquid Discharge Facility Design', description: 'Engineered effluent treatment framework reducing water wastage by 85%.', link: '#' }
    ],
    applications: [
      { id: 'app-101', jobTitle: 'Senior Environmental Engineer', company: 'GreenEarth Consultants', status: 'Shortlisted', date: '2026-07-28' },
      { id: 'app-102', jobTitle: 'ESG Compliance Director', company: 'EcoTech Global', status: 'Under Review', date: '2026-08-01' }
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
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <button
          onClick={() => navigate('/dashboard/admin/candidates')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidate Directory
        </button>

        <Badge variant="success" className="capitalize font-bold">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {candidate.verificationStatus}
        </Badge>
      </div>

      {/* Hero Workspace Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={candidate.avatarUrl}
              alt={candidate.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">{candidate.name}</h1>
                <Badge variant="primary" size="sm" className="font-bold">Verified</Badge>
              </div>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{candidate.headline}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {candidate.experienceYears} Exp</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {candidate.availability}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Dossier
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-slate-300 hover:bg-slate-50 font-bold text-xs h-10 px-4 rounded-xl text-slate-800"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Send Message
            </Button>
          </div>
        </div>

        {/* Info Grid Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
            <span className="font-bold text-slate-900 truncate block">{candidate.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone Contact</span>
            <span className="font-bold text-slate-900">{candidate.phone}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected CTC</span>
            <span className="font-bold text-slate-900">{candidate.expectedSalary}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate ID</span>
            <span className="font-mono font-bold text-slate-900">{candidate.id}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'resume', label: 'Resume & Dossier', icon: FileText },
          { id: 'experience', label: 'Work Experience', icon: Briefcase },
          { id: 'education', label: 'Education & Certs', icon: GraduationCap },
          { id: 'skills', label: 'Verified Skills', icon: Award },
          { id: 'portfolio', label: 'Projects & Portfolio', icon: FolderGit2 },
          { id: 'preferences', label: 'Career Preferences', icon: Star },
          { id: 'applications', label: 'Job Applications', icon: FileCheck },
          { id: 'audit', label: 'Audit Log', icon: History },
          { id: 'notes', label: 'Recruiter Notes', icon: MessageSquare },
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
                <h3 className="text-sm font-black font-heading text-slate-900">Executive Summary & Bio</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{candidate.bio}</p>
              </Card>

              <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900">Key Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((s) => (
                    <span key={s} className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-200/70">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-3">
                <h3 className="text-sm font-black font-heading text-slate-900">Verification Dossier</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Identity Document</span>
                    <span className="font-bold text-emerald-600">✓ Aadhaar Verified</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Degree Credentials</span>
                    <span className="font-bold text-emerald-600">✓ IIT Bombay Verified</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 font-semibold">Background Check</span>
                    <span className="font-bold text-emerald-600">✓ Clear</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'resume' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black font-heading text-slate-900">Verified Candidate Resume</h3>
                <p className="text-xs text-slate-500 font-medium">Uploaded PDF version for corporate applications</p>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
              </Button>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <FileText className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Rahul_Sharma_Resume_ESG_2026.pdf</p>
              <p className="text-[11px] text-slate-400">PDF File • 2.4 MB • Last Updated 12 days ago</p>
            </div>
          </Card>
        )}

        {activeTab === 'experience' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-6">
            <h3 className="text-sm font-black font-heading text-slate-900">Work Experience History</h3>
            <div className="space-y-4">
              {candidate.experience.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{exp.role}</h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">{exp.period}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">{exp.company}</p>
                  <p className="text-xs text-slate-500 font-normal mt-2 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'education' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-6">
            <h3 className="text-sm font-black font-heading text-slate-900">Education & Certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Degree</span>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{edu.degree}</p>
                  <p className="text-xs text-slate-500 font-semibold">{edu.institution} ({edu.year})</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'skills' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Verified Technical Skills</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {candidate.skills.map((s) => (
                <div key={s} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{s}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'portfolio' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Featured Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.projects.map((p, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-500">{p.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Career Preferences</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Preferred Location</span>
                <span className="font-bold text-slate-900">Mumbai / Hybrid</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Desired Role</span>
                <span className="font-bold text-slate-900">Senior ESG Director</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Work Mode</span>
                <span className="font-bold text-slate-900">Hybrid / Remote</span>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'applications' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Active Applications</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {candidate.applications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{app.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">{app.company} • Applied {app.date}</p>
                  </div>
                  <Badge variant="primary" size="sm" className="capitalize font-bold">{app.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'audit' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Candidate Security & Audit Trail</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Candidate Profile Created</span>
                <span className="font-mono text-slate-400">06 Aug 2026 10:15 AM</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Verification Status Approved by Admin</span>
                <span className="font-mono text-slate-400">07 Aug 2026 02:40 PM</span>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Internal Recruiter Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add private evaluation notes for internal hiring team..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50"
                rows={3}
              />
              <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold text-xs rounded-xl">
                Add Recruiter Note
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

export default CandidateDetail;
