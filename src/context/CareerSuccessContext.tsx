import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  InterviewSimulationSession,
  OutcomeLinkedLearningNode,
  CareerProgressionSimulationResult,
  InterviewType,
} from '../types/careerSuccess.types';

export type CareerSuccessViewTab = 'interview-studio' | 'learning-roadmap' | 'simulator';

interface CareerSuccessContextType {
  candidateId: string;
  loading: boolean;
  activeTab: CareerSuccessViewTab;
  setActiveTab: (tab: CareerSuccessViewTab) => void;
  serverError: string | null;

  // Data Repositories
  simulationSessions: InterviewSimulationSession[];
  learningRoadmap: OutcomeLinkedLearningNode[];
  activeSimulationResult: CareerProgressionSimulationResult | null;

  // Actions
  runInterviewSimulation: (interviewType: InterviewType, roleTitle: string) => Promise<InterviewSimulationSession>;
  runCareerSimulation: (skills: string[], certs: string[], extraYears: number) => Promise<CareerProgressionSimulationResult>;
}

const CareerSuccessContext = createContext<CareerSuccessContextType | undefined>(undefined);

export const CareerSuccessProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CareerSuccessViewTab>('interview-studio');
  const [serverError, setServerError] = useState<string | null>(null);

  const [simulationSessions, setSimulationSessions] = useState<InterviewSimulationSession[]>([]);
  const [learningRoadmap, setLearningRoadmap] = useState<OutcomeLinkedLearningNode[]>([]);
  const [activeSimulationResult, setActiveSimulationResult] = useState<CareerProgressionSimulationResult | null>(null);

  // Seed Initial Career Success Repositories
  useEffect(() => {
    const seedCareerSuccess = async () => {
      setLoading(true);
      setServerError(null);

      try {
        setSimulationSessions([
          {
            id: 'sim_1',
            candidate_id: candidateId,
            interview_type: 'Technical',
            target_role_title: 'Senior Full-Stack ESG Engineer',
            overall_rating: 86,
            completed_at: new Date().toISOString(),
            questions_feedback: [
              {
                id: 'q_1',
                question_text: 'How do you structure micro-frontend state synchronization in high-concurrency systems?',
                candidate_answer: 'I use custom event buses and reactive contexts combined with immutable local state wrappers.',
                clarity_score: 92,
                relevance_score: 94,
                technical_depth_score: 88,
                ai_feedback: 'Strong technical explanation of state isolation. Consider mentioning optimistic UI updates.',
                model_answer_suggestion: 'Highlight how Zustand or RxJS subjects handle multi-tab synchronization.',
                demonstrated_skills: ['React', 'Architecture', 'State Management'],
              },
            ],
          },
        ]);

        setLearningRoadmap([
          {
            id: 'learn_1',
            skill_name: 'Kubernetes (K8s)',
            category: 'DevOps & Cloud',
            fit_impact_percent_boost: 11,
            target_opportunity_count: 142,
            estimated_hours_to_master: 25,
            status: 'In Progress',
          },
          {
            id: 'learn_2',
            skill_name: 'GraphQL & Apollo',
            category: 'API Engineering',
            fit_impact_percent_boost: 8,
            target_opportunity_count: 86,
            estimated_hours_to_master: 15,
            status: 'Not Started',
          },
        ]);

        setActiveSimulationResult({
          scenario_name: 'AWS Certification + Kubernetes Skill Boost',
          simulated_skill_additions: ['Kubernetes', 'GraphQL'],
          simulated_certifications: ['AWS Solutions Architect Associate'],
          simulated_additional_years: 1,
          initial_fit_score: 78,
          simulated_fit_score: 92,
          unlocked_opportunity_count: 184,
          estimated_salary_boost_amount: '+$24,500 / yr',
        });
      } catch {
        setServerError('Failed to initialize Career Success Intelligence repository.');
      } finally {
        setLoading(false);
      }
    };

    seedCareerSuccess();
  }, [candidateId]);

  const runInterviewSimulation = useCallback(
    async (interviewType: InterviewType, roleTitle: string): Promise<InterviewSimulationSession> => {
      const newSession: InterviewSimulationSession = {
        id: `sim_${Date.now()}`,
        candidate_id: candidateId,
        interview_type: interviewType,
        target_role_title: roleTitle,
        overall_rating: 90,
        completed_at: new Date().toISOString(),
        questions_feedback: [
          {
            id: `q_${Date.now()}`,
            question_text: `Sample ${interviewType} question for ${roleTitle}`,
            candidate_answer: 'Simulated answer incorporating verified experience evidence.',
            clarity_score: 90,
            relevance_score: 92,
            technical_depth_score: 88,
            ai_feedback: 'Clear response with strong domain alignment.',
            model_answer_suggestion: 'Incorporate quantified metrics to maximize impact.',
            demonstrated_skills: ['Problem Solving', 'Domain Expertise'],
          },
        ],
      };

      setSimulationSessions((prev) => [newSession, ...prev]);
      return newSession;
    },
    [candidateId]
  );

  const runCareerSimulation = useCallback(
    async (skills: string[], certs: string[], extraYears: number): Promise<CareerProgressionSimulationResult> => {
      const result: CareerProgressionSimulationResult = {
        scenario_name: `Simulated Boost: ${skills.join(', ')}`,
        simulated_skill_additions: skills,
        simulated_certifications: certs,
        simulated_additional_years: extraYears,
        initial_fit_score: 78,
        simulated_fit_score: Math.min(100, 78 + skills.length * 5 + certs.length * 6),
        unlocked_opportunity_count: 140 + skills.length * 20,
        estimated_salary_boost_amount: `+$${(skills.length * 8000 + certs.length * 10000).toLocaleString()} / yr`,
      };

      setActiveSimulationResult(result);
      return result;
    },
    []
  );

  return (
    <CareerSuccessContext.Provider
      value={{
        candidateId,
        loading,
        activeTab,
        setActiveTab,
        serverError,
        simulationSessions,
        learningRoadmap,
        activeSimulationResult,
        runInterviewSimulation,
        runCareerSimulation,
      }}
    >
      {children}
    </CareerSuccessContext.Provider>
  );
};

export const useCareerSuccess = () => {
  const context = useContext(CareerSuccessContext);
  if (!context) {
    throw new Error('useCareerSuccess must be used within a CareerSuccessProvider');
  }
  return context;
};
