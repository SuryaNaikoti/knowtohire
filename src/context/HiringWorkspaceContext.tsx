import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  HiringTeam,
  HiringPipelineStage,
  StructuredInterviewEvaluation,
  PipelineAnalyticsSummary,
  HiringWorkspacePermission,
} from '../types/employer.types';

export type HiringWorkspaceViewTab = 'scout' | 'pipeline' | 'evaluations' | 'teams' | 'analytics';

interface HiringWorkspaceContextType {
  providerId: string;
  loading: boolean;
  activeTab: HiringWorkspaceViewTab;
  setActiveTab: (tab: HiringWorkspaceViewTab) => void;
  serverError: string | null;

  // Hiring Workspace Data Repositories
  hiringTeams: HiringTeam[];
  evaluations: StructuredInterviewEvaluation[];
  analyticsSummary: PipelineAnalyticsSummary;
  userPermissions: HiringWorkspacePermission[];

  // Candidate Shortlisting & Pipeline Stage Advancements
  shortlistedCandidateIds: string[];
  toggleShortlistCandidate: (candidateId: string) => Promise<boolean>;
  advanceCandidatePipelineStage: (applicationId: string, nextStage: HiringPipelineStage) => Promise<boolean>;
  addStructuredEvaluation: (evaluation: Omit<StructuredInterviewEvaluation, 'id'>) => Promise<boolean>;
}

const HiringWorkspaceContext = createContext<HiringWorkspaceContextType | undefined>(undefined);

export const HiringWorkspaceProvider: React.FC<{ providerId: string; children: React.ReactNode }> = ({
  providerId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HiringWorkspaceViewTab>('scout');
  const [serverError, setServerError] = useState<string | null>(null);

  const [hiringTeams, setHiringTeams] = useState<HiringTeam[]>([]);
  const [evaluations, setEvaluations] = useState<StructuredInterviewEvaluation[]>([]);
  const [shortlistedCandidateIds, setShortlistedCandidateIds] = useState<string[]>([]);
  const [userPermissions] = useState<HiringWorkspacePermission[]>([
    'view_candidates',
    'edit_opportunities',
    'publish_opportunities',
    'advance_pipeline',
    'schedule_interviews',
    'create_offers',
    'view_salary_details',
    'manage_hiring_teams',
  ]);

  const [analyticsSummary] = useState<PipelineAnalyticsSummary>({
    total_applications: 142,
    active_candidates: 38,
    shortlisted_count: 18,
    interviews_conducted: 24,
    offers_extended: 6,
    offers_accepted: 5,
    avg_time_to_hire_days: 18,
    offer_acceptance_rate_percent: 83.3,
  });

  // Seed Initial Hiring Workspace Data
  useEffect(() => {
    const seedHiringWorkspace = async () => {
      setLoading(true);
      setServerError(null);

      try {
        setHiringTeams([
          {
            id: 'team_1',
            provider_id: providerId || 'prov_1',
            team_name: 'ESG Engineering Hiring Team',
            department: 'Engineering',
            lead_recruiter_id: 'usr_recruiter_1',
            member_ids: ['usr_recruiter_1', 'usr_manager_1'],
            permissions: ['view_candidates', 'advance_pipeline', 'schedule_interviews', 'create_offers'],
          },
        ]);

        setEvaluations([
          {
            id: 'eval_1',
            application_id: 'app_1',
            interviewer_id: 'usr_manager_1',
            interviewer_name: 'Dr. Sarah Jenkins',
            interviewer_role: 'Lead ESG Architect',
            technical_score: 5,
            communication_score: 4,
            leadership_score: 4,
            problem_solving_score: 5,
            recommendation: 'Strong Hire',
            feedback_notes: 'Exemplary system design capabilities and deep understanding of ISO 14001 compliance metrics.',
            evidence_links: ['GitHub Repository Proof #port_1'],
            created_at: new Date().toISOString(),
          },
        ]);

        setShortlistedCandidateIds(['cand_1']);
      } catch {
        setServerError('Failed to initialize Hiring Workspace repository.');
      } finally {
        setLoading(false);
      }
    };

    seedHiringWorkspace();
  }, [providerId]);

  const toggleShortlistCandidate = useCallback(async (candidateId: string): Promise<boolean> => {
    setShortlistedCandidateIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
    return true;
  }, []);

  const advanceCandidatePipelineStage = useCallback(
    async (_applicationId: string, _nextStage: HiringPipelineStage): Promise<boolean> => {
      return true;
    },
    []
  );

  const addStructuredEvaluation = useCallback(
    async (evalItem: Omit<StructuredInterviewEvaluation, 'id'>): Promise<boolean> => {
      const newEval: StructuredInterviewEvaluation = {
        ...evalItem,
        id: `eval_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setEvaluations((prev) => [newEval, ...prev]);
      return true;
    },
    []
  );

  return (
    <HiringWorkspaceContext.Provider
      value={{
        providerId,
        loading,
        activeTab,
        setActiveTab,
        serverError,
        hiringTeams,
        evaluations,
        analyticsSummary,
        userPermissions,
        shortlistedCandidateIds,
        toggleShortlistCandidate,
        advanceCandidatePipelineStage,
        addStructuredEvaluation,
      }}
    >
      {children}
    </HiringWorkspaceContext.Provider>
  );
};

export const useHiringWorkspace = () => {
  const context = useContext(HiringWorkspaceContext);
  if (!context) {
    throw new Error('useHiringWorkspace must be used within a HiringWorkspaceProvider');
  }
  return context;
};
