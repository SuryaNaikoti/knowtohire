/**
 * KnowToHire Module 02 Service Layer Type Definitions
 * Strict types for API operations, query filters, pagination, and error normalization.
 */

import {
  Job,
  JobStatus,
  EmploymentType,
  WorkMode,
  ExperienceLevel,
  JobApplication,
  ApplicationStage,
  Interview,
  InterviewType,
  InterviewStatus,
  SavedJob,
  SavedCandidate,
  ApplicationStatusHistory,
  Profile,
  CandidateProfile,
} from '@/types/database';

// Re-export core entities for convenience
export type {
  Job,
  JobStatus,
  EmploymentType,
  WorkMode,
  ExperienceLevel,
  JobApplication,
  ApplicationStage,
  Interview,
  InterviewType,
  InterviewStatus,
  SavedJob,
  SavedCandidate,
  ApplicationStatusHistory,
  Profile,
  CandidateProfile,
};

// ====================================================================
// CANDIDATE PROFILE COMPREHENSIVE TYPES
// ====================================================================

export interface CandidateExperienceItem {
  title: string;
  company: string;
  period: string;
  location?: string;
  description?: string;
}

export interface CandidateEducationItem {
  qualification?: string;
  degree?: string;
  institution: string;
  graduation_year?: string;
  year?: string;
}

export interface CandidateFullProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  domainSpecialization?: string | null;
  skills: string[];
  experience: CandidateExperienceItem[];
  education: CandidateEducationItem[];
  certifications: string[];
  careerPreferences?: Record<string, unknown> | null;
  preferredSalaryMin?: number | null;
  preferredSalaryMax?: number | null;
  employmentPreference?: string | null;
  noticePeriodDays?: number | null;
  resumeUrl?: string | null;
  jobRecommendationAlerts?: boolean;
  applicationStageUpdates?: boolean;
  isDiscoverable?: boolean;
  isActive?: boolean;
  deactivatedAt?: string | null;
  profileCompletionPct: number;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfileUpdateInput {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  domainSpecialization?: string | null;
  skills?: string[];
  experience?: CandidateExperienceItem[];
  education?: CandidateEducationItem[];
  certifications?: string[];
  careerPreferences?: Record<string, unknown> | null;
  preferredSalaryMin?: number | null;
  preferredSalaryMax?: number | null;
  employmentPreference?: string | null;
  noticePeriodDays?: number | null;
  resumeUrl?: string | null;
  jobRecommendationAlerts?: boolean;
  applicationStageUpdates?: boolean;
  isDiscoverable?: boolean;
  isActive?: boolean;
  deactivatedAt?: string | null;
}

// ====================================================================
// SERVICE RESULT & ERROR ABSTRACTION
// ====================================================================

export interface ServiceError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError };

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ====================================================================
// JOB SERVICE TYPES
// ====================================================================

export interface JobFilters {
  keyword?: string;
  location?: string;
  state_code?: string;
  category?: string;
  employment_type?: EmploymentType;
  work_mode?: WorkMode;
  experience_level?: ExperienceLevel;
  min_salary?: number;
  max_salary?: number;
  is_remote?: boolean;
  sort_by?: 'latest' | 'salary_high' | 'salary_low' | 'deadline';
  page?: number;
  pageSize?: number;
}

export interface JobCreateInput {
  company_id?: string;
  title: string;
  department: string;
  category: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills?: string[];
  benefits?: string[];
  employment_type?: EmploymentType;
  work_mode?: WorkMode;
  experience_level?: ExperienceLevel;
  location: string;
  state_code?: string | null;
  is_remote?: boolean;
  min_salary_inr: number;
  max_salary_inr: number;
  salary_currency?: string;
  status?: JobStatus;
  application_deadline?: string | null;
}

export interface JobUpdateInput {
  title?: string;
  department?: string;
  category?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  skills?: string[];
  benefits?: string[];
  employment_type?: EmploymentType;
  work_mode?: WorkMode;
  experience_level?: ExperienceLevel;
  location?: string;
  state_code?: string | null;
  is_remote?: boolean;
  min_salary_inr?: number;
  max_salary_inr?: number;
  salary_currency?: string;
  status?: JobStatus;
  application_deadline?: string | null;
}

// ====================================================================
// APPLICATION SERVICE TYPES
// ====================================================================

export interface ApplicationSubmitInput {
  job_id: string;
  resume_url?: string;
  cover_letter?: string;
  candidate_snapshot?: Record<string, unknown>;
}

export interface ApplicationFilters {
  stage?: ApplicationStage;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ====================================================================
// INTERVIEW SERVICE TYPES
// ====================================================================

export interface InterviewCreateInput {
  application_id: string;
  job_id: string;
  company_id: string;
  candidate_id: string;
  interview_type: InterviewType;
  title: string;
  round_name?: string | null;
  scheduled_start: string;
  scheduled_end?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  time_window?: string | null;
  meeting_link?: string | null;
  meeting_platform?: string | null;
  contact_phone?: string | null;
  location?: string | null;
  venue_address?: string | null;
  map_url?: string | null;
  interviewer_name?: string | null;
  interviewer_role?: string | null;
  required_documents?: string[];
  instructions?: string | null;
  notes?: string | null;
}

export interface InterviewUpdateInput {
  interview_type?: InterviewType;
  title?: string;
  round_name?: string | null;
  scheduled_start?: string;
  scheduled_end?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  time_window?: string | null;
  meeting_link?: string | null;
  meeting_platform?: string | null;
  contact_phone?: string | null;
  location?: string | null;
  venue_address?: string | null;
  map_url?: string | null;
  interviewer_name?: string | null;
  interviewer_role?: string | null;
  required_documents?: string[];
  instructions?: string | null;
  status?: InterviewStatus;
  notes?: string | null;
}

// ====================================================================
// ERROR NORMALIZATION UTILITY
// ====================================================================

export function normalizeServiceError(err: unknown): ServiceError {
  if (!err) {
    return { message: 'An unexpected error occurred. Please try again.' };
  }

  const errObj = err as Record<string, unknown>;
  const code = (errObj.code as string) || '';
  const message = (errObj.message as string) || (errObj.error_description as string) || '';

  // 1. Duplicate Unique Constraint Violation
  if (code === '23505' || message.includes('unique_candidate_job_application')) {
    return {
      message: 'You have already submitted an application for this job posting.',
      code: 'DUPLICATE_APPLICATION',
      status: 409,
      details: err,
    };
  }

  if (message.includes('unique_candidate_saved_job')) {
    return {
      message: 'This job is already in your saved bookmarks.',
      code: 'DUPLICATE_SAVED_JOB',
      status: 409,
      details: err,
    };
  }

  if (message.includes('unique_company_saved_candidate')) {
    return {
      message: 'This candidate is already bookmarked for your organization.',
      code: 'DUPLICATE_SAVED_CANDIDATE',
      status: 409,
      details: err,
    };
  }

  // 2. Row Level Security & Permission Denials
  if (code === '42501' || message.includes('permission denied') || message.includes('row-level security')) {
    return {
      message: 'Unauthorized operation. You do not have permission to perform this action.',
      code: 'FORBIDDEN',
      status: 403,
      details: err,
    };
  }

  // 3. Database Trigger Governance Validation Messages
  if (message.includes('Company verification is required before job listings can be published')) {
    return {
      message: 'Your enterprise must be verified before job openings can be published publicly.',
      code: 'UNVERIFIED_COMPANY',
      status: 422,
      details: err,
    };
  }

  if (message.includes('Applications can only be submitted for published job listings')) {
    return {
      message: 'This position is no longer accepting new applications.',
      code: 'JOB_NOT_PUBLISHED',
      status: 422,
      details: err,
    };
  }

  if (message.includes('salary') && message.includes('chk_jobs_salary')) {
    return {
      message: 'Maximum salary must be greater than or equal to minimum salary.',
      code: 'INVALID_SALARY_RANGE',
      status: 422,
      details: err,
    };
  }

  // 4. Fallback Generic Clean Error
  return {
    message: message || 'A database request error occurred.',
    code: code || 'DATABASE_ERROR',
    status: 500,
    details: err,
  };
}

// ====================================================================
// 7. ANALYTICS & RECRUITMENT METRICS TYPES
// ====================================================================

export type AnalyticsTimeRange = '7days' | '30days' | '90days' | '6months' | '12months' | 'all';

export interface AnalyticsFilters {
  timeRange?: AnalyticsTimeRange;
  jobId?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecruitmentOverview {
  totalApplicants: number;
  activeJobs: number;
  interviewsTotal: number;
  interviewsScheduled: number;
  shortlistedCount: number;
  offersCount: number;
  hiredCount: number;
  rejectedCount: number;
  avgTimeToHireDays: number | null;
  hireConversionRate: number;
  interviewConversionRate: number;
}

export interface FunnelStageMetric {
  stage: ApplicationStage;
  label: string;
  count: number;
  percentageOfTotal: number;
  conversionFromPrevious: number;
}

export interface ApplicantTrendPoint {
  label: string;
  date: string;
  count: number;
}

export interface ChannelAttribution {
  isAvailable: boolean;
  channels: {
    channel: string;
    count: number;
    percentage: number;
  }[];
  note?: string;
}

export interface TimeToHireMetrics {
  avgDays: number | null;
  medianDays: number | null;
  fastestDays: number | null;
  longestDays: number | null;
  totalHiresAnalyzed: number;
}

export interface JobPerformanceMetric {
  jobId: string;
  jobTitle: string;
  status: JobStatus;
  department: string;
  applicationsCount: number;
  shortlistedCount: number;
  interviewCount: number;
  offerCount: number;
  hiredCount: number;
  conversionRate: number;
  createdAt: string;
}

