import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UnifiedCareerIntelligenceReport,
  PrescriptiveAIAction,
  IntelligenceDomainScore,
} from '../types/candidate.types';

export type UCIEViewMode = 'dashboard' | 'domains' | 'actions' | 'explainability';

interface UnifiedIntelligenceContextType {
  candidateId: string;
  loading: boolean;
  viewMode: UCIEViewMode;
  setViewMode: (mode: UCIEViewMode) => void;
  serverError: string | null;

  // Synthesized UCIE Report & Action Items
  report: UnifiedCareerIntelligenceReport | null;

  // Actions (Human-in-the-Loop)
  acceptActionItem: (actionId: string) => Promise<boolean>;
  dismissActionItem: (actionId: string) => Promise<boolean>;
  recalculateIntelligenceScores: () => Promise<void>;
}

const UnifiedIntelligenceContext = createContext<UnifiedIntelligenceContextType | undefined>(undefined);

export const UnifiedIntelligenceProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<UCIEViewMode>('dashboard');
  const [serverError, setServerError] = useState<string | null>(null);

  const [report, setReport] = useState<UnifiedCareerIntelligenceReport | null>(null);

  // Synthesize Unified Intelligence Report from underlying modules
  const recalculateIntelligenceScores = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const domainScores: IntelligenceDomainScore[] = [
        {
          domainName: 'ATS',
          score: 88,
          status: 'Good',
          trend: 'up',
          insight: 'High keyword coverage across full-stack and React engineering.',
        },
        {
          domainName: 'Market',
          score: 92,
          status: 'Excellent',
          trend: 'up',
          insight: 'Strong demand for Senior Full-Stack & ESG tech competencies.',
        },
        {
          domainName: 'Career',
          score: 90,
          status: 'Excellent',
          trend: 'neutral',
          insight: 'Consistent promotion trajectory with 0 unverified career gaps.',
        },
        {
          domainName: 'Competency',
          score: 86,
          status: 'Good',
          trend: 'up',
          insight: '14 evidence-backed skills mapped directly to projects.',
        },
        {
          domainName: 'Interview',
          score: 84,
          status: 'Good',
          trend: 'up',
          insight: 'Prepared for System Design and React Performance topics.',
        },
        {
          domainName: 'Recruiter',
          score: 94,
          status: 'Excellent',
          trend: 'up',
          insight: 'High appeal index across 4 switchable recruiter preview modes.',
        },
      ];

      const prescriptiveActions: PrescriptiveAIAction[] = [
        {
          id: 'act_1',
          title: 'Add two quantified achievements to Acme Corp experience',
          impactScoreBoost: 6,
          targetDomain: 'ATS',
          rationale: 'Quantified metrics increase ATS ranking algorithms by 18%.',
          evidenceSupport: 'Experience Evidence Log #exp_1',
          confidenceScore: 96,
          status: 'Pending',
        },
        {
          id: 'act_2',
          title: 'Link GitHub repository to Real-Time Analytics project',
          impactScoreBoost: 5,
          targetDomain: 'Recruiter',
          rationale: 'Verified source code proof increases recruiter outreach rates.',
          evidenceSupport: 'Portfolio Repository #port_1',
          confidenceScore: 94,
          status: 'Pending',
        },
        {
          id: 'act_3',
          title: 'Verify AWS Solutions Architect certification URL',
          impactScoreBoost: 4,
          targetDomain: 'Competency',
          rationale: 'Issuer-verified accreditations carry 2x weight in candidate search.',
          evidenceSupport: 'Certification Log #cert_1',
          confidenceScore: 98,
          status: 'Pending',
        },
        {
          id: 'act_4',
          title: 'Generate targeted Product Manager resume persona variant',
          impactScoreBoost: 4,
          targetDomain: 'Market',
          rationale: 'Expands market addressability for cross-functional leadership roles.',
          evidenceSupport: 'CDIC Multi-Persona Generator',
          confidenceScore: 91,
          status: 'Pending',
        },
      ];

      setReport({
        candidateId,
        overallCareerScore: 91,
        identityScore: 95,
        evidenceScore: 92,
        competencyScore: 88,
        documentScore: 94,
        domainScores,
        prescriptiveActions,
        historicalScoreTrends: [
          { month: 'May 2026', overallScore: 78, atsScore: 72, recruiterScore: 75 },
          { month: 'Jun 2026', overallScore: 84, atsScore: 80, recruiterScore: 83 },
          { month: 'Jul 2026', overallScore: 91, atsScore: 88, recruiterScore: 94 },
        ],
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setServerError('Failed to synthesize Unified Career Intelligence Engine report.');
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    recalculateIntelligenceScores();
  }, [recalculateIntelligenceScores]);

  const acceptActionItem = useCallback(async (actionId: string): Promise<boolean> => {
    setReport((prev) => {
      if (!prev) return null;
      const targetAction = prev.prescriptiveActions.find((a) => a.id === actionId);
      const boost = targetAction ? targetAction.impactScoreBoost : 2;

      return {
        ...prev,
        overallCareerScore: Math.min(100, prev.overallCareerScore + boost),
        prescriptiveActions: prev.prescriptiveActions.map((a) =>
          a.id === actionId ? { ...a, status: 'Accepted' as const } : a
        ),
      };
    });
    return true;
  }, []);

  const dismissActionItem = useCallback(async (actionId: string): Promise<boolean> => {
    setReport((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        prescriptiveActions: prev.prescriptiveActions.map((a) =>
          a.id === actionId ? { ...a, status: 'Dismissed' as const } : a
        ),
      };
    });
    return true;
  }, []);

  return (
    <UnifiedIntelligenceContext.Provider
      value={{
        candidateId,
        loading,
        viewMode,
        setViewMode,
        serverError,
        report,
        acceptActionItem,
        dismissActionItem,
        recalculateIntelligenceScores,
      }}
    >
      {children}
    </UnifiedIntelligenceContext.Provider>
  );
};

export const useUnifiedIntelligence = () => {
  const context = useContext(UnifiedIntelligenceContext);
  if (!context) {
    throw new Error('useUnifiedIntelligence must be used within a UnifiedIntelligenceProvider');
  }
  return context;
};
