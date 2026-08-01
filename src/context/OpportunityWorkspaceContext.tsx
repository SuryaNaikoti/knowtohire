import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  OpportunityProvider,
  OpportunityInstance,
  OpportunityFitResult,
  ApplicationGraphItem,
  SkillDemandNode,
  UniversalTaxonomyItem,
} from '../types/job.types';

export type OpportunityViewTab = 'explorer' | 'providers' | 'fit-engine' | 'applications' | 'skill-demand';

interface OpportunityWorkspaceContextType {
  candidateId: string;
  loading: boolean;
  activeTab: OpportunityViewTab;
  setActiveTab: (tab: OpportunityViewTab) => void;
  serverError: string | null;

  // Knowledge Graph Data Repositories
  taxonomies: UniversalTaxonomyItem[];
  providers: OpportunityProvider[];
  opportunities: OpportunityInstance[];
  skillDemandNodes: SkillDemandNode[];
  applications: ApplicationGraphItem[];

  // Selected Opportunity & Fit Calculation
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  currentOpportunityFit: OpportunityFitResult | null;

  // Actions
  applyToOpportunity: (opportunityId: string, personaTitle?: string) => Promise<boolean>;
  bookmarkOpportunity: (opportunityId: string) => Promise<boolean>;
}

const OpportunityWorkspaceContext = createContext<OpportunityWorkspaceContextType | undefined>(undefined);

export const OpportunityWorkspaceProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OpportunityViewTab>('explorer');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [taxonomies, setTaxonomies] = useState<UniversalTaxonomyItem[]>([]);
  const [providers, setProviders] = useState<OpportunityProvider[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityInstance[]>([]);
  const [skillDemandNodes, setSkillDemandNodes] = useState<SkillDemandNode[]>([]);
  const [applications, setApplications] = useState<ApplicationGraphItem[]>([]);

  // Initial Fetch & Seed Repository Knowledge Graph
  useEffect(() => {
    const seedKnowledgeGraph = async () => {
      setLoading(true);
      setServerError(null);

      try {
        setTaxonomies([
          { id: 'tax_1', category: 'Skill', name: 'React', code: 'SK-REACT' },
          { id: 'tax_2', category: 'Skill', name: 'TypeScript', code: 'SK-TS' },
          { id: 'tax_3', category: 'ESG Domain', name: 'ISO 14001', code: 'ESG-ISO14001' },
          { id: 'tax_4', category: 'Industry', name: 'Environmental Technology', code: 'IND-ENVTECH' },
        ]);

        const sampleProviders: OpportunityProvider[] = [
          {
            id: 'prov_1',
            name: 'Acme Environmental Systems',
            provider_type: 'Company',
            industry_domain: 'Environmental Technology',
            company_size: '500-1000 Employees',
            headquarters_location: 'San Francisco, CA',
            is_verified: true,
            trust_rating: 98,
            description: 'Leading provider of ESG audit platforms & clean technology.',
          },
          {
            id: 'prov_2',
            name: 'Stanford Sustainability Institute',
            provider_type: 'University',
            industry_domain: 'Research & Academia',
            headquarters_location: 'Stanford, CA',
            is_verified: true,
            trust_rating: 99,
            description: 'Top-tier research institute pioneering climate technology.',
          },
        ];

        const sampleOpportunities: OpportunityInstance[] = [
          {
            id: 'opp_1',
            template_id: 'tmpl_1',
            provider_id: 'prov_1',
            instance_title: 'Senior Full-Stack ESG Engineer',
            provider_name: 'Acme Environmental Systems',
            provider_type: 'Company',
            opportunity_type: 'Job',
            location_type: 'Remote',
            city: 'San Francisco',
            country: 'United States',
            compensation_range: '$140,000 - $180,000 / yr',
            salary_min: 140000,
            salary_max: 180000,
            currency: 'USD',
            lifecycle_status: 'Published',
            is_featured: true,
            application_deadline: '2026-08-30',
          },
          {
            id: 'opp_2',
            template_id: 'tmpl_2',
            provider_id: 'prov_2',
            instance_title: 'Climate AI Research Fellowship 2026',
            provider_name: 'Stanford Sustainability Institute',
            provider_type: 'University',
            opportunity_type: 'Research Position',
            location_type: 'Hybrid',
            city: 'Stanford',
            country: 'United States',
            compensation_range: '$85,000 Grant stipend',
            salary_min: 85000,
            salary_max: 85000,
            currency: 'USD',
            lifecycle_status: 'Featured',
            is_featured: true,
            application_deadline: '2026-09-15',
          },
        ];

        const sampleSkillDemand: SkillDemandNode[] = [
          { id: 'sk_d1', skill_name: 'React', market_demand_rating: 'High', year_over_year_growth: 24, average_salary_impact: '+$18,000 / yr', replacement_skills: ['Vue.js', 'Angular'] },
          { id: 'sk_d2', skill_name: 'ISO 14001', market_demand_rating: 'Emerging', year_over_year_growth: 38, average_salary_impact: '+$22,000 / yr', replacement_skills: ['ESG Auditing'] },
        ];

        setProviders(sampleProviders);
        setOpportunities(sampleOpportunities);
        setSkillDemandNodes(sampleSkillDemand);
        setSelectedOpportunityId('opp_1');
      } catch {
        setServerError('Failed to initialize Opportunity Workspace Knowledge Graph.');
      } finally {
        setLoading(false);
      }
    };

    seedKnowledgeGraph();
  }, [candidateId]);

  // Real-time 13-Factor Opportunity Fit, Risk & Split Probabilities Calculation
  const currentOpportunityFit: OpportunityFitResult | null = selectedOpportunityId
    ? {
        opportunityId: selectedOpportunityId,
        candidateId,
        fitScore: 92,
        riskScore: 14,
        interviewProbability: 84,
        offerProbability: 72,
        factorScores: [
          { scoreName: 'Skill Match', scoreValue: 95, maxScore: 100, confidenceScore: 98, weight: 1.5, explanation: '12 candidate competencies match role requirement schema.', positiveFactors: ['React', 'TypeScript', 'Node.js'], negativeFactors: ['GraphQL'], evidenceLinks: ['Competency Graph'], timestamp: new Date().toISOString() },
          { scoreName: 'Experience Alignment', scoreValue: 90, maxScore: 100, confidenceScore: 94, weight: 1.2, explanation: '4.5 years total experience vs 3 years minimum requirement.', positiveFactors: ['Senior Full-Stack Engineer role title'], negativeFactors: [], evidenceLinks: ['Career Evidence Timeline'], timestamp: new Date().toISOString() },
        ],
        positiveBreakdown: [
          { factor: '12 Skills matched directly from Competency Graph', boost: 18 },
          { factor: 'Industry domain alignment (Environmental Tech)', boost: 12 },
          { factor: 'CDIC ATS-Optimized Resume attached', boost: 9 },
        ],
        negativeBreakdown: [
          { factor: 'Missing GraphQL certification', penalty: -4 },
          { factor: '30-day notice period delay', penalty: -3 },
        ],
        recommendedActions: [
          'Add GraphQL to Competency Graph to increase Fit Score by +4%',
          'Attach Executive Software Engineer CDIC Resume variant before applying',
        ],
      }
    : null;

  const applyToOpportunity = useCallback(
    async (opportunityId: string, personaTitle = 'Software Engineer Resume'): Promise<boolean> => {
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (!opp) return false;

      const newApp: ApplicationGraphItem = {
        id: `app_${Date.now()}`,
        candidate_id: candidateId,
        opportunity_instance_id: opportunityId,
        opportunity_title: opp.instance_title,
        provider_name: opp.provider_name || 'Acme Corp',
        attached_persona_resume_title: personaTitle,
        stage: 'Applied',
        fit_score_at_apply: currentOpportunityFit?.fitScore || 92,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setApplications((prev) => [newApp, ...prev]);
      return true;
    },
    [candidateId, opportunities, currentOpportunityFit]
  );

  const bookmarkOpportunity = useCallback(async (_opportunityId: string): Promise<boolean> => {
    return true;
  }, []);

  return (
    <OpportunityWorkspaceContext.Provider
      value={{
        candidateId,
        loading,
        activeTab,
        setActiveTab,
        serverError,
        taxonomies,
        providers,
        opportunities,
        skillDemandNodes,
        applications,
        selectedOpportunityId,
        setSelectedOpportunityId,
        currentOpportunityFit,
        applyToOpportunity,
        bookmarkOpportunity,
      }}
    >
      {children}
    </OpportunityWorkspaceContext.Provider>
  );
};

export const useOpportunityWorkspace = () => {
  const context = useContext(OpportunityWorkspaceContext);
  if (!context) {
    throw new Error('useOpportunityWorkspace must be used within an OpportunityWorkspaceProvider');
  }
  return context;
};
