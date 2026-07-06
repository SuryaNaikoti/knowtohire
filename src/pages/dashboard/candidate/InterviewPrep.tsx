import React, { useState } from 'react';
import { interviewService } from '../../../lib/services/interviewService';
import type { QAPair, InterviewSession } from '../../../lib/services/interviewService';
import { HelpCircle, RefreshCw, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [starting, setStarting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<QAPair | null>(null);

  const handleStart = async () => {
    if (!roleTitle.trim()) return;
    setStarting(true);
    try {
      const sess = await interviewService.startSession(roleTitle);
      const qList = interviewService.generateQuestions(roleTitle);
      setSession(sess);
      setQuestions(qList);
      setCurrentIdx(0);
      setAnswer('');
      setCurrentFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !answer.trim() || evaluating) return;
    setEvaluating(true);
    try {
      const result = await interviewService.evaluateAnswer(
        session.id,
        questions[currentIdx],
        answer
      );
      setCurrentFeedback(result);
      setAnswer('');
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setCurrentIdx((prev) => prev + 1);
    setCurrentFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
            AI Interview Prep
          </h1>
          <p className="text-sm text-slate-500 mt-1">Simulate interactive technical/behavioral interview cycles and get feedback.</p>
        </div>

        {/* Start Section */}
        {!session && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Enter Target Role</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, React Specialist..."
                className="flex-1 px-4 py-3 border border-slate-200 focus:border-emerald-400 outline-none rounded-xl text-sm"
              />
              <button
                onClick={handleStart}
                disabled={starting || !roleTitle.trim()}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {starting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Start Simulator
              </button>
            </div>
          </div>
        )}

        {/* Question Deck Section */}
        {session && currentIdx < questions.length && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Card Progress */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wide">Active Session</span>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-base font-bold text-slate-800 mb-4 leading-relaxed">
                "{questions[currentIdx]}"
              </p>

              {!currentFeedback ? (
                <>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your detailed response here..."
                    rows={6}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm font-sans resize-none"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !answer.trim()}
                    className="w-full mt-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Scoring answer...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
                  {/* Feedback rating */}
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-sm font-semibold text-emerald-800">Feedback Score</span>
                    <span className="text-2xl font-black text-emerald-700">{currentFeedback.score}%</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Scoring Metrics
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {currentFeedback.feedback}
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl text-sm hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Finished Section */}
        {session && currentIdx >= questions.length && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-bounce" />
            <h2 className="text-lg font-bold text-slate-800 mb-1">Session Complete!</h2>
            <p className="text-sm text-slate-400 mb-6">Your aggregate interview results have been compiled.</p>
            <div className="text-3xl font-black text-emerald-600 bg-emerald-50 inline-block px-6 py-3 rounded-2xl mb-8">
              Overall Score: {session.overall_score}%
            </div>
            <button
              onClick={() => setSession(null)}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Start New Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
