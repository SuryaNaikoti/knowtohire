import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CandidateExperience,
  CandidateEducation,
  CandidateCertification,
  CareerProgressionInsight,
} from '../types/candidate.types';
import { candidateService } from '../lib/services/candidateService';

export type ActiveEvidenceTab = 'experience' | 'education' | 'certifications' | 'timeline';

interface CareerEvidenceContextType {
  candidateId: string;
  loading: boolean;
  activeTab: ActiveEvidenceTab;
  setActiveTab: (tab: ActiveEvidenceTab) => void;
  serverError: string | null;

  // Evidence Repositories
  experiences: CandidateExperience[];
  educationList: CandidateEducation[];
  certifications: CandidateCertification[];

  // Progression & Gap Analysis
  progressionInsight: CareerProgressionInsight;

  // Actions
  addExperience: (exp: Omit<CandidateExperience, 'id' | 'candidate_id'>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  addEducation: (edu: Omit<CandidateEducation, 'id' | 'candidate_id'>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  addCertification: (cert: Omit<CandidateCertification, 'id' | 'candidate_id'>) => Promise<boolean>;
  deleteCertification: (id: string) => Promise<boolean>;
}

const CareerEvidenceContext = createContext<CareerEvidenceContextType | undefined>(undefined);

export const CareerEvidenceProvider: React.FC<{ candidateId: string; children: React.ReactNode }> = ({
  candidateId,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveEvidenceTab>('experience');
  const [serverError, setServerError] = useState<string | null>(null);

  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [educationList, setEducationList] = useState<CandidateEducation[]>([]);
  const [certifications, setCertifications] = useState<CandidateCertification[]>([]);

  // Initial Fetch
  useEffect(() => {
    if (!candidateId) return;

    const fetchEvidenceData = async () => {
      setLoading(true);
      setServerError(null);
      try {
        const expData = await candidateService.getExperience(candidateId);
        const eduData = await candidateService.getEducation(candidateId);
        const certData = await candidateService.getCertifications(candidateId);

        setExperiences((expData || []) as CandidateExperience[]);
        setEducationList((eduData || []) as CandidateEducation[]);
        setCertifications((certData || []) as CandidateCertification[]);
      } catch {
        setServerError('Failed to load career evidence repository.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidenceData();
  }, [candidateId]);

  // Real-time Progression & Gap Intelligence Calculation
  const progressionInsight = useMemo<CareerProgressionInsight>(() => {
    let totalYears = 0;
    let promotions = 0;
    const skillsMap: Record<string, number> = {};
    const gapDetails: string[] = [];

    // Sort experience chronologically
    const sorted = [...experiences].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    sorted.forEach((exp, idx) => {
      const start = new Date(exp.start_date).getTime();
      const end = exp.is_current || !exp.end_date ? new Date().getTime() : new Date(exp.end_date).getTime();
      const yrs = Math.max(0.1, (end - start) / (1000 * 60 * 60 * 24 * 365.25));
      totalYears += yrs;

      // Extract skills graph
      (exp.skills_used || []).forEach((sk) => {
        skillsMap[sk.skill_name] = (skillsMap[sk.skill_name] || 0) + 1;
      });

      // Detect potential promotion / title progression at same company
      if (idx > 0 && sorted[idx - 1].company_name.toLowerCase() === exp.company_name.toLowerCase()) {
        promotions++;
      }

      // Check gap between jobs (> 3 months)
      if (idx > 0 && sorted[idx - 1].end_date) {
        const prevEnd = new Date(sorted[idx - 1].end_date!).getTime();
        const gapMonths = (start - prevEnd) / (1000 * 60 * 60 * 24 * 30.44);
        if (gapMonths >= 3) {
          gapDetails.push(`${Math.round(gapMonths)} month gap between ${sorted[idx - 1].company_name} and ${exp.company_name}`);
        }
      }
    });

    const topSkillsUsed = Object.entries(skillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    let trajectory: 'Rapid Acceleration' | 'Steady Growth' | 'Transitioning' = 'Steady Growth';
    if (promotions >= 2 || totalYears < 4 && promotions >= 1) trajectory = 'Rapid Acceleration';
    else if (gapDetails.length >= 2) trajectory = 'Transitioning';

    const strongestAchievement = experiences.flatMap((e) => e.achievements || [])[0] || undefined;

    return {
      totalYearsExperience: Math.round(totalYears * 10) / 10,
      promotionCount: promotions,
      gapCount: gapDetails.length,
      gapDetails,
      careerTrajectory: trajectory,
      topSkillsUsed,
      strongestAchievement,
    };
  }, [experiences]);

  const addExperience = useCallback(
    async (exp: Omit<CandidateExperience, 'id' | 'candidate_id'>): Promise<boolean> => {
      const newEntry: CandidateExperience = {
        ...exp,
        id: `exp_${Date.now()}`,
        candidate_id: candidateId,
      };
      setExperiences((prev) => [newEntry, ...prev]);
      await candidateService.addExperience(candidateId, exp as any);
      return true;
    },
    [candidateId]
  );

  const deleteExperience = useCallback(
    async (id: string): Promise<boolean> => {
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      await candidateService.deleteExperience(id);
      return true;
    },
    []
  );

  const addEducation = useCallback(
    async (edu: Omit<CandidateEducation, 'id' | 'candidate_id'>): Promise<boolean> => {
      const newEntry: CandidateEducation = {
        ...edu,
        id: `edu_${Date.now()}`,
        candidate_id: candidateId,
      };
      setEducationList((prev) => [newEntry, ...prev]);
      await candidateService.addEducation(candidateId, edu as any);
      return true;
    },
    [candidateId]
  );

  const deleteEducation = useCallback(
    async (id: string): Promise<boolean> => {
      setEducationList((prev) => prev.filter((e) => e.id !== id));
      await candidateService.deleteEducation(id);
      return true;
    },
    []
  );

  const addCertification = useCallback(
    async (cert: Omit<CandidateCertification, 'id' | 'candidate_id'>): Promise<boolean> => {
      const newEntry: CandidateCertification = {
        ...cert,
        id: `cert_${Date.now()}`,
        candidate_id: candidateId,
      };
      setCertifications((prev) => [newEntry, ...prev]);
      await candidateService.addCertification(candidateId, cert as any);
      return true;
    },
    [candidateId]
  );

  const deleteCertification = useCallback(
    async (id: string): Promise<boolean> => {
      setCertifications((prev) => prev.filter((c) => c.id !== id));
      await candidateService.deleteCertification(id);
      return true;
    },
    []
  );

  return (
    <CareerEvidenceContext.Provider
      value={{
        candidateId,
        loading,
        activeTab,
        setActiveTab,
        serverError,
        experiences,
        educationList,
        certifications,
        progressionInsight,
        addExperience,
        deleteExperience,
        addEducation,
        deleteEducation,
        addCertification,
        deleteCertification,
      }}
    >
      {children}
    </CareerEvidenceContext.Provider>
  );
};

export const useCareerEvidence = () => {
  const context = useContext(CareerEvidenceContext);
  if (!context) {
    throw new Error('useCareerEvidence must be used within a CareerEvidenceProvider');
  }
  return context;
};
