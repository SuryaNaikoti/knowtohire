export type PipelineStage =
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Offer'
  | 'Hired'
  | 'Rejected';

export interface EmployerCandidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  location: string;
  experienceYears: number;
}

export interface CandidatePipeline {
  id: string;
  candidateId: string;
  jobId: string;
  stage: PipelineStage;
  updatedAt: string;
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  jobId: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  interviewerId: string;
}

export interface InterviewFeedback {
  id: string;
  technicalScore: number;
  communicationScore: number;
  culturalFitScore: number;
  recruiterNotes: string;
  interviewerId: string;
}

export interface CandidateShortlist {
  id: string;
  name: string;
  employerId: string;
  candidateIds: string[];
  notes: Record<string, string>;
  tags: Record<string, string[]>;
}

export interface TalentPool {
  id: string;
  employerId: string;
  candidateIds: string[];
}

export interface CandidateEvaluation {
  id: string;
  candidateId: string;
  technicalScore: number;
  communicationScore: number;
  culturalFitScore: number;
  overallScore: number;
  feedback: string;
}

export interface EmployerDashboardSummary {
  activeJobsCount: number;
  candidatesInPipelineCount: number;
  interviewsTodayCount: number;
  offersPendingCount: number;
  hiresThisMonthCount: number;
  talentPoolSize: number;
  averageHiringTimeDays: number;
}

// Interfaces
export interface IEmployerPipelineService {
  addCandidate(candidateId: string, jobId: string): Promise<CandidatePipeline>;
  removeCandidate(candidateId: string, jobId: string): Promise<boolean>;
  moveStage(candidateId: string, jobId: string, newStage: PipelineStage): Promise<CandidatePipeline>;
  getPipeline(jobId: string): Promise<CandidatePipeline[]>;
}

export interface ICandidateShortlistService {
  createShortlist(employerId: string, name: string): Promise<CandidateShortlist>;
  addToShortlist(shortlistId: string, candidateId: string, note?: string): Promise<CandidateShortlist>;
  removeFromShortlist(shortlistId: string, candidateId: string): Promise<CandidateShortlist>;
  tagCandidate(shortlistId: string, candidateId: string, tags: string[]): Promise<CandidateShortlist>;
}

export interface ITalentPoolService {
  saveCandidate(employerId: string, candidateId: string): Promise<TalentPool>;
  removeCandidate(employerId: string, candidateId: string): Promise<TalentPool>;
  searchTalent(employerId: string, query: { skills?: string[]; minExperience?: number; location?: string }): Promise<string[]>;
}

export interface IInterviewQueueService {
  scheduleInterview(candidateId: string, jobId: string, time: string, interviewerId: string): Promise<InterviewSchedule>;
  cancelInterview(interviewId: string): Promise<boolean>;
  storeFeedback(interviewId: string, feedback: InterviewFeedback): Promise<boolean>;
}

export interface ICandidateEvaluationService {
  evaluate(candidateId: string, technical: number, communication: number, cultural: number, notes: string): Promise<CandidateEvaluation>;
}

export interface IEmployerDashboardSummaryService {
  getSummary(employerId: string): Promise<EmployerDashboardSummary>;
}
