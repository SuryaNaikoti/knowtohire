import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resumeService } from '../../lib/services/resume/ResumeService';
import { resumeExportService } from '../../lib/services/resume/ResumeExportService';
import type { CandidateResume } from '../../lib/services/resume/types';
import type { ResumeAnalysisResult } from '../../lib/services/ai/types';
import { FileText, Sparkles, Plus, Save, Download, CheckCircle, AlertCircle } from 'lucide-react';

export const ResumeBuilder: React.FC = () => {
  const { profile } = useAuth();
  const candidateId = profile?.id || 'guest-candidate';

  const [resumes, setResumes] = useState<CandidateResume[]>([]);
  const [currentResume, setCurrentResume] = useState<CandidateResume>({
    id: crypto.randomUUID(),
    candidateId,
    title: 'Senior Software Engineer Resume',
    fullName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Alex Morgan',
    email: profile?.email || 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    summary: 'Experienced Full Stack Engineer specializing in TypeScript, React, and Scalable Cloud Systems.',
    experience: [
      {
        id: crypto.randomUUID(),
        company: 'TechCorp Solutions',
        position: 'Senior Engineer',
        startDate: '2022-01',
        description: 'Architected event-driven microservices handling 1M+ daily active sessions.',
      },
    ],
    education: [
      {
        id: crypto.randomUUID(),
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        graduationYear: '2021',
      },
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'System Architecture', 'PostgreSQL'],
    projects: [
      {
        id: crypto.randomUUID(),
        title: 'KnowToHire Platform',
        description: 'Enterprise hiring marketplace with real-time notification engine.',
      },
    ],
    updatedAt: new Date().toISOString(),
  });

  const [aiAnalysis, setAiAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const list = resumeService.getResumes(candidateId);
    setResumes(list);
    if (list.length > 0) {
      setCurrentResume(list[0]);
    }
  }, [candidateId]);

  const handleSave = () => {
    resumeService.saveResume(currentResume);
    setResumes(resumeService.getResumes(candidateId));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAIAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await resumeService.analyzeResumeWithAI(candidateId, currentResume.id);
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    resumeExportService.exportToPDF(currentResume);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Resume Builder & AI Optimizer</h1>
            <p className="text-xs text-slate-500">Create, format, and optimize candidate resumes with instant AI feedback.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={handleAIAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-violet-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'AI Optimization'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <Save className="w-4 h-4" /> {savedSuccess ? 'Saved!' : 'Save Resume'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Resume Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Header Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Resume Title</label>
                  <input
                    type="text"
                    value={currentResume.title}
                    onChange={(e) => setCurrentResume({ ...currentResume, title: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={currentResume.fullName}
                    onChange={(e) => setCurrentResume({ ...currentResume, fullName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={currentResume.summary}
                  onChange={(e) => setCurrentResume({ ...currentResume, summary: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Work Experience</h2>
                <button
                  onClick={() =>
                    setCurrentResume({
                      ...currentResume,
                      experience: [
                        ...currentResume.experience,
                        {
                          id: crypto.randomUUID(),
                          company: 'New Company',
                          position: 'Software Engineer',
                          startDate: '2023-01',
                          description: 'Contributed to high scale production software.',
                        },
                      ],
                    })
                  }
                  className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {currentResume.experience.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...currentResume.experience];
                        updated[idx].company = e.target.value;
                        setCurrentResume({ ...currentResume, experience: updated });
                      }}
                      className="text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => {
                        const updated = [...currentResume.experience];
                        updated[idx].position = e.target.value;
                        setCurrentResume({ ...currentResume, experience: updated });
                      }}
                      className="text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Description & Accomplishments"
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...currentResume.experience];
                      updated[idx].description = e.target.value;
                      setCurrentResume({ ...currentResume, experience: updated });
                    }}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: AI Analysis & Saved Versions */}
          <div className="space-y-6">
            {/* AI Optimization Feedback Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" /> AI Feedback Panel
              </h3>

              {!aiAnalysis && !analyzing && (
                <p className="text-xs text-slate-400">Click "AI Optimization" above to analyze your resume formatting and domain skill coverage.</p>
              )}

              {analyzing && (
                <div className="py-8 text-center text-xs text-slate-500">
                  <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Running AI analysis heuristic...
                </div>
              )}

              {aiAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-violet-50 border border-violet-100 p-3 rounded-xl">
                    <span className="text-xs font-semibold text-violet-900">Optimization Score</span>
                    <span className="text-lg font-bold text-violet-700">{aiAnalysis.score}%</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Key Skills Detected
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysis.keySkillsFound.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {aiAnalysis.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Suggested Domain Additions
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysis.missingSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Saved Resumes Listing */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Saved Resumes ({resumes.length})</h3>
              <div className="space-y-2">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setCurrentResume(r)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      r.id === currentResume.id
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <p className="truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-400 font-normal">Updated {new Date(r.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
