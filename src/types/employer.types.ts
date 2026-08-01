export interface EmployerProfile {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string;
  phone_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string;
  banner_url: string;
  company_email: string;
  linkedin_url: string;
  website_url: string;
  industry: string;
  company_size: string;
  description: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  subdomain?: string;
  custom_domain?: string;
  theme_config?: { primaryColor: string; themeMode: 'light' | 'dark' };
  settings?: { allowJobMatching: boolean; enableNotifications: boolean };
  created_at?: string;
  updated_at?: string;
}

export interface CompanyLocation {
  id: string;
  company_id: string;
  address: string;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  is_headquarters: boolean;
  google_map_url?: string;
  timezone?: string;
  working_hours?: string;
  phone?: string;
  email?: string;
  manager?: string;
  gps?: string;
  created_at?: string;
}

export type HiringWorkspacePermission =
  | 'view_candidates'
  | 'edit_opportunities'
  | 'publish_opportunities'
  | 'advance_pipeline'
  | 'schedule_interviews'
  | 'create_offers'
  | 'view_salary_details'
  | 'manage_hiring_teams';

export interface HiringTeam {
  id: string;
  provider_id: string;
  team_name: string;
  department: string;
  lead_recruiter_id: string;
  member_ids: string[];
  permissions: HiringWorkspacePermission[];
  created_at?: string;
}

export type HiringPipelineStage =
  | 'Applied'
  | 'Shortlisted'
  | 'Recruiter Screen'
  | 'Technical Interview'
  | 'Manager Interview'
  | 'Offer Extended'
  | 'Offer Accepted'
  | 'Joined'
  | 'Rejected';

export interface StructuredInterviewEvaluation {
  id: string;
  application_id: string;
  interviewer_id: string;
  interviewer_name: string;
  interviewer_role: string;
  technical_score: number; // 1-5
  communication_score: number; // 1-5
  leadership_score: number; // 1-5
  problem_solving_score: number; // 1-5
  recommendation: 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire';
  feedback_notes: string;
  evidence_links?: string[];
  created_at?: string;
}

export interface PipelineStageHistoryItem {
  stage: HiringPipelineStage;
  entered_at: string;
  updated_by_name: string;
  notes?: string;
}

export interface OpportunityHiringPipeline {
  id: string;
  opportunity_instance_id: string;
  opportunity_title: string;
  provider_id: string;
  hiring_team_id: string;
  stages: HiringPipelineStage[];
  active_candidates_count: number;
}

export interface PipelineAnalyticsSummary {
  total_applications: number;
  active_candidates: number;
  shortlisted_count: number;
  interviews_conducted: number;
  offers_extended: number;
  offers_accepted: number;
  avg_time_to_hire_days: number;
  offer_acceptance_rate_percent: number;
}

export interface CompanyTeamMember {
  id: string;
  company_id: string;
  employer_id: string;
  member_role: 'Admin' | 'Recruiter' | 'Viewer';
  first_name?: string;
  last_name?: string;
  job_title?: string;
  email?: string;
  status?: 'Pending' | 'Accepted' | 'Rejected' | 'Expired' | 'Suspended';
  department?: string;
  created_at?: string;
}

