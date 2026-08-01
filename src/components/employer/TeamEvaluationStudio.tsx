import React, { useState } from 'react';
import { useHiringWorkspace } from '../../context/HiringWorkspaceContext';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export const TeamEvaluationStudio: React.FC = () => {
  const { evaluations, addStructuredEvaluation } = useHiringWorkspace();

  const [interviewerName] = useState('Dr. Sarah Jenkins');
  const [interviewerRole] = useState('Lead ESG Architect');
  const [technicalScore, setTechnicalScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(4);
  const [recommendation, setRecommendation] = useState<'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire'>('Strong Hire');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes) return;

    await addStructuredEvaluation({
      application_id: 'app_1',
      interviewer_id: 'usr_manager_1',
      interviewer_name: interviewerName,
      interviewer_role: interviewerRole,
      technical_score: technicalScore,
      communication_score: communicationScore,
      leadership_score: 4,
      problem_solving_score: 5,
      recommendation,
      feedback_notes: feedbackNotes,
    });

    setFeedbackNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Add Structured Evaluation Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          Submit Structured Candidate Evaluation Scorecard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Technical Rating (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={technicalScore}
              onChange={(e) => setTechnicalScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Communication Rating (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={communicationScore}
              onChange={(e) => setCommunicationScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Recommendation</label>
            <select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="Strong Hire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="No Hire">No Hire</option>
              <option value="Strong No Hire">Strong No Hire</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Detailed Feedback Notes & Evidence Links</label>
          <textarea
            rows={3}
            placeholder="Record structured technical interview feedback..."
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white"
          />
        </div>

        <Button type="submit" className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl cursor-pointer">
          <Plus className="w-4 h-4" /> Save Evaluation Scorecard
        </Button>
      </form>

      {/* Structured Scorecards List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Interviewer Evaluation History ({evaluations.length})
        </h4>

        {evaluations.map((ev) => (
          <div key={ev.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{ev.interviewer_name}</h4>
                <p className="text-xs text-slate-500">{ev.interviewer_role}</p>
              </div>

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                {ev.recommendation}
              </span>
            </div>

            <p className="text-xs text-slate-700">{ev.feedback_notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
