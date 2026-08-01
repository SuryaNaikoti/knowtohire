import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface QuestionItem {
  id: number;
  category: string;
  question: string;
  answerSnippet: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
}

const PREP_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    category: 'System Design & Architecture',
    question: 'How do you design a high-throughput async processing pipeline for millions of telemetry events?',
    answerSnippet: 'Use event streaming (Kafka/RabbitMQ), partitioning strategy by tenant/session, horizontal scale consumers, and idempotent DB writes with retry queues.',
    difficulty: 'Advanced'
  },
  {
    id: 2,
    category: 'Behavioral & Leadership',
    question: 'Describe a situation where you had to push back against a tight product deadline to prevent tech debt.',
    answerSnippet: 'Structure response with STAR: Focus on empirical data, risk to production reliability, proposing an MVP compromise, and tracking tech debt in backlog.',
    difficulty: 'Intermediate'
  },
  {
    id: 3,
    category: 'Financial Analysis',
    question: 'What are the main differences between WACC and Cost of Equity when evaluating tech investment scenarios?',
    answerSnippet: 'WACC factors total capital structure (debt + equity), while Cost of Equity measures shareholder return requirement via CAPM.',
    difficulty: 'Intermediate'
  },
  {
    id: 4,
    category: 'ESG & Compliance',
    question: 'How do CSRD reporting frameworks impact supply chain carbon accounting?',
    answerSnippet: 'Requires Scope 3 indirect emissions reporting, third-party verification, and standardized ESRS data structures across tier-1 suppliers.',
    difficulty: 'Advanced'
  }
];

export const InterviewPrepKit: React.FC = () => {
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredQuestions = PREP_QUESTIONS.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden text-left">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Technical & Behavioral Kit
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight">
              Comprehensive Interview Preparation Kit
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              Domain-specific mock questions, solution blueprints, STAR method guides, and behavioral rubrics reviewed by hiring managers.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-2">
          {['All', 'System Design & Architecture', 'Behavioral & Leadership', 'Financial Analysis', 'ESG & Compliance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions Accordion Grid */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isOpen = openQuestionId === q.id;
            return (
              <Card key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left transition-all">
                <div 
                  className="flex justify-between items-start cursor-pointer gap-4"
                  onClick={() => setOpenQuestionId(isOpen ? null : q.id)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {q.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400">
                        Difficulty: {q.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug pt-1">{q.question}</h3>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solution Approach Blueprint</p>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed font-normal">
                      {q.answerSnippet}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Link to="/dashboard/candidate/interview-prep" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                        <span>Practice Mock AI Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default InterviewPrepKit;
