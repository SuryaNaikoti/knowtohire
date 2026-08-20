/**
 * KnowToHire Database & Auth Entity Type Definitions
 * Maps 1:1 with Supabase PostgreSQL Schema (Module 01 & Module 02)
 */

// ====================================================================
// MODULE 01: AUTH & PROFILES TYPES
// ====================================================================

export type UserRole = 'candidate' | 'employer' | 'admin';

export type AccountStatus = 'unverified' | 'pending_onboarding' | 'active' | 'suspended';

export type CompanyVerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export interface Profile {
  id: string; // References auth.users.id
  email: string;
  full_name: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string; // Primary Key UUID
  profile_id: string; // Foreign Key to public.profiles.id
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  domain_specialization?: string | null;
  skills: string[];
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  certifications: string[];
  career_preferences?: Record<string, unknown> | null;
  preferred_salary_min?: number | null;
  preferred_salary_max?: number | null;
  employment_preference?: string | null; // e.g. 'Full-Time', 'Contract', 'Hybrid'
  notice_period_days?: number | null;
  resume_url?: string | null;
  profile_completion_pct: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string; // Primary Key UUID
  name: string;
  legal_name?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  industry?: string | null;
  company_size?: string | null; // e.g. '250-500 Employees'
  headquarters_location?: string | null;
  verification_status: CompanyVerificationStatus;
  description?: string | null;
  registration_number?: string | null; // e.g. CIN / Tax ID reference
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string; // Primary Key UUID
  profile_id: string; // Foreign Key to public.profiles.id
  company_id: string; // Foreign Key to public.company_profiles.id
  job_title?: string | null;
  work_phone?: string | null;
  is_company_admin: boolean;
  created_at: string;
  updated_at: string;
}

// ====================================================================
// MODULE 02: JOB PORTAL & RECRUITMENT TYPES
// ====================================================================

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'hybrid' | 'internship';

export type WorkMode = 'on_site' | 'hybrid' | 'remote';

export type ExperienceLevel = 'fresher' | 'associate' | 'mid_level' | 'senior' | 'lead' | 'executive';

export type ApplicationStage = 
  | 'new'
  | 'screening'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type InterviewType = 'hr_screening' | 'technical_deep_dive' | 'case_study' | 'executive_review';

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Job {
  id: string; // Primary Key UUID
  company_id: string; // Foreign Key to public.company_profiles.id
  created_by: string; // Foreign Key to public.profiles.id
  title: string;
  department: string;
  category: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  employment_type: EmploymentType;
  work_mode: WorkMode;
  experience_level: ExperienceLevel;
  location: string;
  state_code?: string | null;
  is_remote: boolean;
  min_salary_inr: number;
  max_salary_inr: number;
  salary_currency: string;
  status: JobStatus;
  is_verified: boolean;
  application_deadline?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined entity representations
  company?: CompanyProfile;
}

export interface JobApplication {
  id: string; // Primary Key UUID
  job_id: string; // Foreign Key to public.jobs.id
  candidate_id: string; // Foreign Key to public.profiles.id
  company_id: string; // Foreign Key to public.company_profiles.id
  stage: ApplicationStage;
  resume_url: string;
  cover_letter?: string | null;
  candidate_snapshot: Record<string, unknown>;
  employer_notes?: string | null;
  rejection_reason?: string | null;
  employer_rating?: number | null;
  applied_at: string;
  updated_at: string;
  withdrawn_at?: string | null;
  // Joined entity representations
  job?: Job;
  candidate?: Profile;
}

export interface SavedJob {
  id: string; // Primary Key UUID
  candidate_id: string; // Foreign Key to public.profiles.id
  job_id: string; // Foreign Key to public.jobs.id
  created_at: string;
  // Joined entity representation
  job?: Job;
}

export interface ApplicationStatusHistory {
  id: string; // Primary Key UUID
  application_id: string; // Foreign Key to public.job_applications.id
  from_stage?: ApplicationStage | null;
  to_stage: ApplicationStage;
  changed_by?: string | null; // Foreign Key to public.profiles.id
  note?: string | null;
  created_at: string;
}

export interface Interview {
  id: string; // Primary Key UUID
  application_id: string; // Foreign Key to public.job_applications.id
  job_id: string; // Foreign Key to public.jobs.id
  company_id: string; // Foreign Key to public.company_profiles.id
  candidate_id: string; // Foreign Key to public.profiles.id
  created_by?: string | null; // Foreign Key to public.profiles.id
  interview_type: InterviewType;
  title: string;
  scheduled_start: string;
  scheduled_end?: string | null;
  meeting_link?: string | null;
  location?: string | null;
  status: InterviewStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined entity representations
  candidate?: Profile;
  job?: Job;
}

export interface SavedCandidate {
  id: string; // Primary Key UUID
  company_id: string; // Foreign Key to public.company_profiles.id
  employer_id: string; // Foreign Key to public.profiles.id
  candidate_id: string; // Foreign Key to public.profiles.id
  notes?: string | null;
  created_at: string;
  // Joined entity representation
  candidate?: Profile & { candidate_profile?: CandidateProfile };
}
