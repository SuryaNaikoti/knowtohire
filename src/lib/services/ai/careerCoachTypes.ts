export interface CareerMilestone {
  id: string;
  phase: string;
  focus: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface CareerRoadmap {
  id: string;
  milestones: CareerMilestone[];
  targetRole: string;
  generatedAt: string;
  confidenceScore: number;
}

export interface LearningRecommendation {
  id: string;
  title: string;
  source: 'knowledge_hub' | 'course' | 'template';
  estimatedHours: number;
  url?: string;
  description: string;
}

export interface CertificationRecommendation {
  id: string;
  name: string;
  issuingOrganization: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  relevanceScore: number;
}

export interface InterviewPreparationPlan {
  id: string;
  role: string;
  technicalTopics: string[];
  hrTopics: string[];
  mockQuestions: string[];
  preparationStatus: string;
}

export interface ResumeSuggestion {
  id: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface WeeklyCareerGoal {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  category: 'resume' | 'skills' | 'roadmap' | 'learning';
}

export interface SalaryInsight {
  id: string;
  role: string;
  experienceLevel: string;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  marketDemand: 'high' | 'medium' | 'low';
  advice: string;
}

export interface CareerCoachResponse {
  roadmap: CareerRoadmap;
  learningRecommendations: LearningRecommendation[];
  certificationRecommendations: CertificationRecommendation[];
  interviewPlan: InterviewPreparationPlan;
  resumeSuggestions: ResumeSuggestion[];
  weeklyGoals: WeeklyCareerGoal[];
  salaryInsight: SalaryInsight;
  lastGenerated: string;
}

// Generator Interfaces
export interface ICareerRoadmapGenerator {
  generateRoadmap(targetRole: string): Promise<CareerRoadmap>;
}

export interface ILearningRecommendationGenerator {
  recommend(skills: string[]): Promise<LearningRecommendation[]>;
}

export interface IResumeSuggestionGenerator {
  suggest(resumeText: string): Promise<ResumeSuggestion[]>;
}

export interface IInterviewPreparationGenerator {
  prepare(role: string): Promise<InterviewPreparationPlan>;
}

export interface IWeeklyGoalGenerator {
  generateGoals(completionScore: number, missingSkills: string[]): Promise<WeeklyCareerGoal[]>;
}

export interface ISalaryGrowthAdvisor {
  advise(role: string, experienceYears: number, skills: string[]): Promise<SalaryInsight>;
}

export interface ICertificationRecommendationGenerator {
  recommendCerts(skills: string[], goals: string[]): Promise<CertificationRecommendation[]>;
}

export interface IAICareerCoachService {
  getCoachAdvice(
    candidateId: string,
    targetRole: string,
    experienceYears: number,
    skills: string[],
    resumeText: string,
    completionScore: number
  ): Promise<CareerCoachResponse>;
}
