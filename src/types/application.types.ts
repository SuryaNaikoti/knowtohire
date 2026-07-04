import type { ApplicationStatus } from '../constants/applicationStatuses';

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_url: string;
  cover_letter?: string;
  status: ApplicationStatus;
  feedback?: string;
  created_at: string;
  updated_at: string;
  
  // Hydrated
  job_title?: string;
  company_name?: string;
  candidate_name?: string;
}
