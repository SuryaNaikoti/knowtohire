import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  User,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  MessageSquare,
  Award,
  Download,
  History
} from 'lucide-react';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stage, setStage] = useState<'applied' | 'shortlisted' | 'interview_scheduled' | 'offered' | 'rejected'>('shortlisted');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Vikram Mehta (Recruiter)', text: 'Candidate submitted portfolio. Strong match for ESG audit requirements.', date: '2026-07-29 15:00' }
  ]);
  const [noteText, setNoteText] = useState('');

  const app = {
    id: id || 'app-101',
    candidateName: 'Rahul Sharma',
    candidateEmail: 'rahul.sharma@gmail.com',
    candidateId: 'usr_c1',
    jobTitle: 'Senior Environmental & ESG Lead',
    jobId: 'job-991',
    companyName: 'GreenEarth Consultants Pvt Ltd',
    companyId: 'comp-1',
    appliedDate: '28 Jul 2026',
    experienceYears: '7.5 Years',
    skills: ['ESG Reporting', 'ISO 14001', 'Carbon Accounting'],
    aiMatchScore: '94% Excellent Fit',
    resumeUrl: 'Rahul_Sharma_Resume_ESG_2026.pdf'
  };

  const handleUpdateStage = (newStage: any) => {
    setStage(newStage);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes([
      ...notes,
      { id: Date.now().toString(), author: 'Hiring Manager', text: noteText, date: new Date().toLocaleString() }
    ]);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <button
          onClick={() => navigate('/dashboard/admin/applications')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Application Pipeline
        </button>

        <Badge variant="primary" className="capitalize font-bold">
          Stage: {stage.replace('_', ' ')}
        </Badge>
      </div>

      {/* Hero Hiring Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-sm">
              RS
            </div>
            <div>
              <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">{app.candidateName}</h1>
              <p className="text-xs text-slate-500 font-semibold">{app.candidateEmail}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold mt-2">
                <span>Role Applied: <strong className="text-slate-900 font-bold">{app.jobTitle}</strong></span>
                <span>•</span>
                <span>Company: <strong className="text-slate-900 font-bold">{app.companyName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleUpdateStage('shortlisted')}
              className={`text-xs font-bold ${stage === 'shortlisted' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Shortlist
            </Button>
            <Button
              size="sm"
              onClick={() => handleUpdateStage('interview_scheduled')}
              className={`text-xs font-bold ${stage === 'interview_scheduled' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Schedule Interview
            </Button>
            <Button
              size="sm"
              onClick={() => handleUpdateStage('offered')}
              className={`text-xs font-bold ${stage === 'offered' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Extend Offer
            </Button>
            <Button
              size="sm"
              onClick={() => handleUpdateStage('rejected')}
              className={`text-xs font-bold ${stage === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Reject
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Match Score</span>
            <span className="font-bold text-emerald-700">{app.aiMatchScore}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Date</span>
            <span className="font-bold text-slate-900">{app.appliedDate}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Experience</span>
            <span className="font-bold text-slate-900">{app.experienceYears}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Application ID</span>
            <span className="font-mono font-bold text-slate-900">{app.id}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Application Evaluation Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add hiring team evaluation note..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50"
                rows={3}
              />
              <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold text-xs rounded-xl">
                Add Evaluation Note
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
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white space-y-4">
            <h3 className="text-sm font-black font-heading text-slate-900">Candidate Attachments</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{app.resumeUrl}</span>
                <Button size="sm" variant="outline" className="text-[10px] font-bold h-7 px-2">Download</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
