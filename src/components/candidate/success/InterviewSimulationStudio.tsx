import React, { useState } from 'react';
import { useCareerSuccess } from '../../../context/CareerSuccessContext';
import type { InterviewType } from '../../../types/careerSuccess.types';
import { Sparkles, MessageSquare, Play } from 'lucide-react';
import { Button } from '../../ui/Button';

export const InterviewSimulationStudio: React.FC = () => {
  const { simulationSessions, runInterviewSimulation } = useCareerSuccess();
  const [selectedType, setSelectedType] = useState<InterviewType>('Technical');
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack ESG Engineer');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleStartSimulation = async () => {
    setIsSimulating(true);
    await runInterviewSimulation(selectedType, roleTitle);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Setup Studio */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Interview Practice & Simulation Studio</span>
          </h3>
          <p className="text-xs text-slate-500">
            Practice domain-specific interview scenarios with real-time AI scoring and answer feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Interview Mode</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Technical">Technical Architecture Interview</option>
              <option value="System Design">System Design & Scalability</option>
              <option value="Behavioral">Behavioral & Leadership Scenario</option>
              <option value="HR & Cultural">HR & Organizational Fit</option>
              <option value="Domain Specialist">ESG & Sustainability Specialist</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Target Role Context</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>
        </div>

        <Button
          onClick={handleStartSimulation}
          isLoading={isSimulating}
          className="w-full h-11 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <span>Launch AI Interview Practice Session</span>
        </Button>
      </div>

      {/* Interview Memory History */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Interview Memory History ({simulationSessions.length})
        </h4>

        {simulationSessions.map((session) => (
          <div key={session.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{session.interview_type} Practice Session</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                    {session.overall_rating}% Performance
                  </span>
                </h4>
                <p className="text-xs text-slate-500">{session.target_role_title}</p>
              </div>
            </div>

            {session.questions_feedback.map((q) => (
              <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{q.question_text}</span>
                </p>

                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <strong className="text-slate-900">Your Answer: </strong>{q.candidate_answer}
                </p>

                <p className="text-emerald-800 font-semibold bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-950">AI Feedback: </strong>{q.ai_feedback}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
