export interface SkillMatch {
  score: number;
  weight: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

export interface ExperienceMatch {
  score: number;
  weight: number;
  candidateYears: number;
  requiredYears: number;
  explanation: string;
}

export interface EducationMatch {
  score: number;
  weight: number;
  candidateDegree: string;
  requiredDegree: string;
  explanation: string;
}

export interface SalaryMatch {
  score: number;
  weight: number;
  candidateExpected: number;
  jobBudgetMax: number;
  explanation: string;
}

export interface LocationMatch {
  score: number;
  weight: number;
  candidatePreference: string;
  jobLocationType: 'remote' | 'hybrid' | 'onsite';
  explanation: string;
}

export interface ATSCompatibility {
  score: number;
  warnings: string[];
  explanation: string;
}

export interface MatchRecommendation {
  id: string;
  type: 'skill' | 'experience' | 'education' | 'general';
  suggestion: string;
  impactScore: number;
}

export interface MatchBreakdown {
  skills: SkillMatch;
  experience: ExperienceMatch;
  education: EducationMatch;
  salary: SalaryMatch;
  location: LocationMatch;
  ats: ATSCompatibility;
}

export interface JobMatchResult {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  breakdown: MatchBreakdown;
  recommendations: MatchRecommendation[];
  explanation: string;
  generatedAt: string;
}

// Scorer Interfaces
export interface ISkillMatchScorer {
  score(candidateSkills: string[], requiredSkills: string[], preferredSkills?: string[]): SkillMatch;
}

export interface IExperienceMatchScorer {
  score(candidateYears: number, requiredYears: number): ExperienceMatch;
}

export interface IEducationMatchScorer {
  score(candidateDegree: string, requiredDegree: string): EducationMatch;
}

export interface ISalaryMatchScorer {
  score(candidateExpected: number, jobBudgetMax: number): SalaryMatch;
}

export interface ILocationMatchScorer {
  score(candidatePreference: string, jobLocationType: 'remote' | 'hybrid' | 'onsite'): LocationMatch;
}

export interface IATSCompatibilityScorer {
  score(atsHealthScore: number): ATSCompatibility;
}

export interface IMatchAggregator {
  aggregate(breakdown: MatchBreakdown): { overallScore: number; explanation: string };
}

export interface IJobMatchingEngine {
  matchJob(candidateProfile: any, jobListing: any, atsHealthScore: number): Promise<JobMatchResult>;
}
