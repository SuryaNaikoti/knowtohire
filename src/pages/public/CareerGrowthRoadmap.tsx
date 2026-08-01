import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface RoadmapStep {
  stage: string;
  title: string;
  timeframe: string;
  keySkills: string[];
  recommendedCertifications: string[];
  expectedRole: string;
}

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    stage: 'Stage 1 — Foundation',
    title: 'Junior to Mid Professional',
    timeframe: '0 - 2 Years',
    keySkills: ['Core Domain Execution', 'Git / Version Control', 'Data Analytics', 'Team Collaboration'],
    recommendedCertifications: ['AWS Certified Developer', 'Financial Fundamentals Cert'],
    expectedRole: 'Software Engineer / Financial Analyst'
  },
  {
    stage: 'Stage 2 — Mastery',
    title: 'Senior Practitioner & Specialist',
    timeframe: '2 - 5 Years',
    keySkills: ['System Design & Architecture', 'Cross-functional Ownership', 'Stakeholder Management', 'Mentorship'],
    recommendedCertifications: ['Solutions Architect Associate', 'CFA Level 1 / FRM'],
    expectedRole: 'Senior Engineer / Lead Analyst'
  },
  {
    stage: 'Stage 3 — Leadership',
    title: 'Staff / Principal & Management',
    timeframe: '5+ Years',
    keySkills: ['Strategic Vision', 'Org Architecture', 'Budgeting & P&L', 'Executive Presentation'],
    recommendedCertifications: ['Executive Leadership Cert', 'PMP'],
    expectedRole: 'Engineering Manager / Director of Product'
  }
];

export const CareerGrowthRoadmap: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hero */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden text-left">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Structured Career Progression
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight">
              Career Growth & Leadership Roadmap
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              Step-by-step competency milestones, skill requirements, and certification benchmarks to accelerate promotion cycles.
            </p>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROADMAP_STEPS.map((step, idx) => (
            <Card key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                    {step.stage}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {step.timeframe}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{step.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Target Role: {step.expectedRole}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Competencies</p>
                  <ul className="space-y-1.5">
                    {step.keySkills.map((skill, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommended Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.recommendedCertifications.map((cert, cIdx) => (
                      <span key={cIdx} className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link to="/register" className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                  <span>Build Personal Career Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CareerGrowthRoadmap;
