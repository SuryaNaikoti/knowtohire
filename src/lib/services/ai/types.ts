export interface ResumeAnalysisRequest {
  candidateId: string;
  resumeText: string;
  targetJobTitle?: string;
}

export interface ResumeAnalysisResult {
  score: number; // 0-100
  keySkillsFound: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface AIMatchResult {
  jobId: string;
  jobTitle: string;
  matchPercentage: number;
  matchingPoints: string[];
}
