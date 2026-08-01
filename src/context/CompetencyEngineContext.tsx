import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CandidateSkill, PortfolioEvidenceItem } from '../types/candidate.types';
import { candidateService } from '../lib/services/candidateService';

export type CompetencyViewMode = 'all' | 'technical' | 'functional' | 'ai' | 'esg' | 'portfolio' | 'ai-suggestions';

interface CompetencyEngineContextType {
  candidateId: string;
  loading: boolean;
  viewMode: CompetencyViewMode;
  setViewMode: (mode: CompetencyViewMode) => void;
  serverError: string | null;

  // Competency Graph & Evidence Repositories
  skills: CandidateSkill[];
  portfolioItems: PortfolioEvidenceItem[];

  // Human-in-the-Loop AI Suggested Skills
  aiSuggestedSkills: CandidateSkill[];

  // Graph Intelligence Query Actions
  getEvidenceForSkill: (skillName: string) => PortfolioEvidenceItem[];
  addSkill: (skill: Omit<CandidateSkill, 'id' | 'candidate_id'>) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  acceptAISuggestedSkill: (skill: CandidateSkill) => Promise<boolean>;
  rejectAISuggestedSkill: (id: string) => Promise<boolean>;
  addPortfolioItem: (item: Omit<PortfolioEvidenceItem, 'id' | 'candidate_id'>) => Promise<boolean>;
  deletePortfolioItem: (id: string) => Promise<boolean>;
}

const CompetencyEngineContext = createContext<CompetencyEngineContextType | undefined>(undefined);

export const CompetencyEngineProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<CompetencyViewMode>('all');
  const [serverError, setServerError] = useState<string | null>(null);

  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioEvidenceItem[]>([]);
  const [aiSuggestedSkills, setAiSuggestedSkills] = useState<CandidateSkill[]>([]);

  // Initial Data Fetch & AI Skill Inference
  useEffect(() => {
    if (!candidateId) return;

    const fetchCompetencies = async () => {
      setLoading(true);
      setServerError(null);

      try {
        const fetchedSkills = await candidateService.getSkills(candidateId);
        const mappedSkills: CandidateSkill[] = (fetchedSkills || []).map((s: any) => ({
          id: s.id,
          candidate_id: candidateId,
          skill_name: s.skill_name,
          category_name: 'Technical',
          years_of_experience: s.years_of_experience || 2,
          last_used_year: 2026,
          competency_level: s.competency_level || 'Advanced',
          confidence_score: 92,
          market_demand: 'High',
          evidence_count: 3,
          related_skills: ['TypeScript', 'Node.js', 'REST APIs'],
          verification_status: 'Employer-Verified',
          ai_recommendation: 'Featured Skill',
        }));

        setSkills(mappedSkills);

        // Pre-populate sample Human-in-the-Loop AI Inferred Skill Suggestions
        setAiSuggestedSkills([
          {
            id: 'ai_suggested_1',
            candidate_id: candidateId,
            skill_name: 'Next.js',
            category_name: 'Technical',
            years_of_experience: 3,
            competency_level: 'Advanced',
            confidence_score: 95,
            market_demand: 'High',
            evidence_count: 2,
            related_skills: ['React', 'TypeScript'],
            is_ai_suggested: true,
            ai_recommendation: 'Upgrade',
          },
          {
            id: 'ai_suggested_2',
            candidate_id: candidateId,
            skill_name: 'Tailwind CSS',
            category_name: 'Technical',
            years_of_experience: 4,
            competency_level: 'Expert',
            confidence_score: 98,
            market_demand: 'High',
            evidence_count: 4,
            related_skills: ['CSS3', 'UI Engineering'],
            is_ai_suggested: true,
            ai_recommendation: 'Featured Skill',
          },
        ]);
      } catch {
        setServerError('Failed to load competency engine graph.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencies();
  }, [candidateId]);

  // Reverse Evidence Graph Query: Show every portfolio proof supporting a specific skill
  const getEvidenceForSkill = useCallback(
    (skillName: string): PortfolioEvidenceItem[] => {
      return portfolioItems.filter((item) =>
        item.skills_demonstrated?.some((s) => s.toLowerCase() === skillName.toLowerCase())
      );
    },
    [portfolioItems]
  );

  const addSkill = useCallback(
    async (skill: Omit<CandidateSkill, 'id' | 'candidate_id'>): Promise<boolean> => {
      const newEntry: CandidateSkill = {
        ...skill,
        id: `sk_${Date.now()}`,
        candidate_id: candidateId,
        confidence_score: 90,
        evidence_count: 1,
      };
      setSkills((prev) => [newEntry, ...prev]);
      await candidateService.addSkill(candidateId, skill as any);
      return true;
    },
    [candidateId]
  );

  const deleteSkill = useCallback(
    async (id: string): Promise<boolean> => {
      setSkills((prev) => prev.filter((s) => s.id !== id));
      await candidateService.deleteSkill(id);
      return true;
    },
    []
  );

  const acceptAISuggestedSkill = useCallback(
    async (skill: CandidateSkill): Promise<boolean> => {
      setAiSuggestedSkills((prev) => prev.filter((s) => s.id !== skill.id));
      const confirmedSkill = { ...skill, is_ai_suggested: false, verification_status: 'AI-Verified' as const };
      setSkills((prev) => [confirmedSkill, ...prev]);
      await candidateService.addSkill(candidateId, confirmedSkill as any);
      return true;
    },
    [candidateId]
  );

  const rejectAISuggestedSkill = useCallback(async (id: string): Promise<boolean> => {
    setAiSuggestedSkills((prev) => prev.filter((s) => s.id !== id));
    return true;
  }, []);

  const addPortfolioItem = useCallback(
    async (item: Omit<PortfolioEvidenceItem, 'id' | 'candidate_id'>): Promise<boolean> => {
      const newEntry: PortfolioEvidenceItem = {
        ...item,
        id: `port_${Date.now()}`,
        candidate_id: candidateId,
      };
      setPortfolioItems((prev) => [newEntry, ...prev]);
      return true;
    },
    [candidateId]
  );

  const deletePortfolioItem = useCallback(async (id: string): Promise<boolean> => {
    setPortfolioItems((prev) => prev.filter((p) => p.id !== id));
    return true;
  }, []);

  return (
    <CompetencyEngineContext.Provider
      value={{
        candidateId,
        loading,
        viewMode,
        setViewMode,
        serverError,
        skills,
        portfolioItems,
        aiSuggestedSkills,
        getEvidenceForSkill,
        addSkill,
        deleteSkill,
        acceptAISuggestedSkill,
        rejectAISuggestedSkill,
        addPortfolioItem,
        deletePortfolioItem,
      }}
    >
      {children}
    </CompetencyEngineContext.Provider>
  );
};

export const useCompetencyEngine = () => {
  const context = useContext(CompetencyEngineContext);
  if (!context) {
    throw new Error('useCompetencyEngine must be used within a CompetencyEngineProvider');
  }
  return context;
};
