export type ApplicationStage =
  | 'New'
  | 'Reviewing'
  | 'Interview'
  | 'Offered'
  | 'Rejected';

export interface ApplicationTimelineEntry {
  id: string;
  stage: ApplicationStage;
  timestamp: string;
  notes?: string;
  actingUser: string;
}

export interface CandidateEvaluationNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateLocation?: string;
  candidateSalary?: string;
  resumeId: string;
  resumeSummary: string;
  matchScore: number;
  resumeScore: number;
  stage: ApplicationStage;
  appliedAt: string;
  updatedAt: string;
  timeline: ApplicationTimelineEntry[];
  notes: CandidateEvaluationNote[];
  rating?: number; // 1-5 stars
}
