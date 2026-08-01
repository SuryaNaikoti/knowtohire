import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CareerDocument, CareerDocumentType, ResumePersona } from '../types/candidate.types';

export type CDICViewMode = 'repository' | 'generator' | 'analytics' | 'studio';

interface DocumentIntelligenceContextType {
  candidateId: string;
  loading: boolean;
  viewMode: CDICViewMode;
  setViewMode: (mode: CDICViewMode) => void;
  serverError: string | null;

  // Document Repository & Personas
  documents: CareerDocument[];
  selectedPersona: ResumePersona;
  setSelectedPersona: (persona: ResumePersona) => void;

  // Document Operations & Persona Generation
  generatePersonaResume: (persona: ResumePersona) => Promise<CareerDocument>;
  uploadCareerDocument: (file: File, type: CareerDocumentType) => Promise<boolean>;
  deleteCareerDocument: (id: string) => Promise<boolean>;
  applyAISuggestion: (docId: string, suggestion: string) => Promise<boolean>;
}

const DocumentIntelligenceContext = createContext<DocumentIntelligenceContextType | undefined>(undefined);

export const DocumentIntelligenceProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<CDICViewMode>('repository');
  const [selectedPersona, setSelectedPersona] = useState<ResumePersona>('Software Engineer');
  const [serverError, setServerError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<CareerDocument[]>([]);

  // Initial Data & Sample Document Repository Pre-population
  useEffect(() => {
    if (!candidateId) return;

    const loadDocuments = async () => {
      setLoading(true);
      setServerError(null);

      try {
        setDocuments([
          {
            id: 'doc_1',
            candidate_id: candidateId,
            title: 'Executive Software Engineer Resume 2026',
            document_type: 'Resume',
            persona: 'Software Engineer',
            version_name: 'v2.1-ATS-Optimized',
            ats_score: 94,
            recruiter_score: 91,
            executive_readability: 88,
            missing_competencies: ['GraphQL', 'Kubernetes'],
            ai_suggestions: [
              'Add quantified latency reduction metrics to Acme Corp project',
              'Include AWS Certified Solutions Architect badge in summary',
            ],
            analytics: {
              downloads: 14,
              employer_views: 42,
              interview_conversion_rate: 28.5,
            },
            is_primary: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'doc_2',
            candidate_id: candidateId,
            title: 'ESG & Environmental Lead CV',
            document_type: 'Resume',
            persona: 'ESG Specialist',
            version_name: 'v1.0-Generated',
            ats_score: 89,
            recruiter_score: 86,
            executive_readability: 92,
            missing_competencies: ['ISO 14001 Auditing'],
            ai_suggestions: ['Highlight EIA certification in top summary'],
            analytics: {
              downloads: 6,
              employer_views: 18,
              interview_conversion_rate: 22.0,
            },
            is_primary: false,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        setServerError('Failed to load career document intelligence repository.');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [candidateId]);

  // Generate Persona Resume from Single Source of Truth
  const generatePersonaResume = useCallback(
    async (persona: ResumePersona): Promise<CareerDocument> => {
      const newDoc: CareerDocument = {
        id: `doc_gen_${Date.now()}`,
        candidate_id: candidateId,
        title: `${persona} Generated Persona Resume`,
        document_type: 'Resume',
        persona,
        version_name: `v1.0-${persona.replace(/\s+/g, '')}`,
        ats_score: 92,
        recruiter_score: 90,
        executive_readability: 94,
        missing_competencies: ['System Architecture'],
        ai_suggestions: [`Tailored for ${persona} target roles using structured career evidence`],
        analytics: {
          downloads: 0,
          employer_views: 0,
          interview_conversion_rate: 0,
        },
        is_primary: false,
        created_at: new Date().toISOString(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    },
    [candidateId]
  );

  const uploadCareerDocument = useCallback(
    async (file: File, type: CareerDocumentType): Promise<boolean> => {
      const newDoc: CareerDocument = {
        id: `doc_up_${Date.now()}`,
        candidate_id: candidateId,
        title: file.name,
        document_type: type,
        version_name: 'v1.0-Uploaded',
        ats_score: 85,
        recruiter_score: 82,
        executive_readability: 84,
        analytics: {
          downloads: 1,
          employer_views: 2,
          interview_conversion_rate: 10,
        },
        created_at: new Date().toISOString(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return true;
    },
    [candidateId]
  );

  const deleteCareerDocument = useCallback(async (id: string): Promise<boolean> => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    return true;
  }, []);

  const applyAISuggestion = useCallback(async (docId: string, suggestion: string): Promise<boolean> => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            ats_score: Math.min(100, d.ats_score + 3),
            ai_suggestions: (d.ai_suggestions || []).filter((s) => s !== suggestion),
          };
        }
        return d;
      })
    );
    return true;
  }, []);

  return (
    <DocumentIntelligenceContext.Provider
      value={{
        candidateId,
        loading,
        viewMode,
        setViewMode,
        serverError,
        documents,
        selectedPersona,
        setSelectedPersona,
        generatePersonaResume,
        uploadCareerDocument,
        deleteCareerDocument,
        applyAISuggestion,
      }}
    >
      {children}
    </DocumentIntelligenceContext.Provider>
  );
};

export const useDocumentIntelligence = () => {
  const context = useContext(DocumentIntelligenceContext);
  if (!context) {
    throw new Error('useDocumentIntelligence must be used within a DocumentIntelligenceProvider');
  }
  return context;
};
