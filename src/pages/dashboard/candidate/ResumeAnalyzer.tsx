import React, { useState, useEffect } from 'react';
import { resumeAnalyzerService } from '../../../lib/services/resumeAnalyzerService';
import type { ResumeAnalysis } from '../../../lib/services/resumeAnalyzerService';
import { Award, FileText, CheckCircle2, AlertCircle, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');

  const loadLatest = async () => {
    setLoading(true);
    try {
      const data = await resumeAnalyzerService.getLatestAnalysis();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    try {
      const result = await resumeAnalyzerService.analyzeResume(resumeText);
      setAnalysis(result);
      setResumeText('');
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 animate-pulse" />
            AI Resume Analyzer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Get an instant ATS score evaluation, skill tags, and writing recommendations.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
            Synchronizing analyzer state...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Paste Resume Content
                </h2>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste the plain text content of your resume here to run the ATS analyzer..."
                  rows={10}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm font-sans resize-none"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeText.trim()}
                  className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing ATS matches...
                    </>
                  ) : (
                    <>
                      Analyze Resume
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {analysis && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Extracted Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.parsed_skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missing_keywords.map((kw) => (
                        <span key={kw} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Sidebar */}
            <div className="space-y-6">
              {analysis ? (
                <>
                  {/* Score Card */}
                  <div className={`p-6 rounded-2xl border text-center ${getScoreColor(analysis.score)}`}>
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-85 block mb-1">ATS Score</span>
                    <span className="text-5xl font-black">{analysis.score}</span>
                    <span className="text-sm block mt-2 font-medium">Out of 100</span>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Suggestions
                    </h3>
                    <div className="space-y-3.5">
                      {analysis.improvements.map((item, i) => (
                        <div key={i} className="text-xs border-l-2 border-emerald-500 pl-3">
                          <p className="font-bold text-slate-800 mb-0.5">{item.field}</p>
                          <p className="text-slate-500 leading-relaxed">{item.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                  <p className="text-sm font-medium">No evaluations yet.</p>
                  <p className="text-xs mt-1">Paste resume details on the left to review metrics.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
