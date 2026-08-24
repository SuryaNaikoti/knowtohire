import { CandidateExperienceItem, CandidateEducationItem } from './types';

/**
 * Parsed raw resume content structure extracted from document bytes & metadata.
 */
export interface ParsedResumeDocument {
  rawText: string;
  fileName: string;
  fileSizeBytes: number;
  isMachineReadable: boolean;
  charCount: number;
  contactInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  detectedSections: {
    hasContactInfo: boolean;
    hasSummaryOrBio: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    hasCertifications: boolean;
  };
  headline?: string;
  bio?: string;
  domainSpecialization?: string;
  skills: string[];
  experience: CandidateExperienceItem[];
  education: CandidateEducationItem[];
  certifications: string[];
  quantifiedAchievementsCount: number;
  detectedFormattingIssues: string[];
}

/**
 * Individual ATS Recommendation Category & Severity
 */
export type ATSRecommendationCategory =
  | 'Parsing & Machine Readability'
  | 'Contact Information'
  | 'Resume Section Structure'
  | 'Required Job Keywords'
  | 'Technical & Domain Skills'
  | 'Experience & Chronology'
  | 'Education & Qualifications'
  | 'Certifications'
  | 'Measurable Impact & Achievements'
  | 'Formatting Risk'
  | 'Strong Match';

export type ATSRecommendationSeverity = 'high' | 'medium' | 'low' | 'positive';

export interface ATSOptimizationRecommendation {
  id: string;
  category: ATSRecommendationCategory;
  type: 'positive' | 'suggestion' | 'warning';
  title: string;
  explanation: string;
  evidence: string;
  severity: ATSRecommendationSeverity;
  confidence: number; // 0 to 100
  affectedEntity?: string; // keyword, skill, section name, or requirement
  suggestedAction: string;
}

/**
 * Structured ATS Compatibility Breakdown & Scores
 */
export interface ATSAnalysisResult {
  analyzedAt: string;
  fileName: string;
  fileSizeBytes: number;
  isPDF: boolean;
  isMachineReadable: boolean;

  // Evaluated Scores (0 - 100)
  overallAtsScore: number;
  parsingScore: number;
  sectionStructureScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  impactScore: number;

  // Breakdown metrics
  totalSkillsCount: number;
  matchedDomain: string;
  experienceYearsCalculated: number;
  quantifiedMetricsCount: number;
  detectedFormattingRisks: string[];
  missingCoreSections: string[];

  // Job matching analysis (if target job or domain benchmark is provided)
  jobMatchScore?: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  partialKeywords: string[];

  // Evidence-driven recommendations
  recommendations: ATSOptimizationRecommendation[];
}
