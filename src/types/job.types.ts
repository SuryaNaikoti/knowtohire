import type { CareerDomain } from '../constants/careerDomains';
import type { JobStatus } from '../constants/jobStatuses';
import type { EmploymentType } from '../constants/employmentTypes';
import type { LocationType } from '../constants/locationTypes';

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_category_id: string | null;
  created_at?: string;
}

export interface Job {
  id: string;
  company_id: string;
  employer_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  benefits: string | null;
  career_domain: CareerDomain;
  location_type: LocationType;
  country: string;
  state: string | null;
  city: string;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_visible: boolean;
  status: JobStatus;
  is_featured: boolean;
  featured_until: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  moderator_notes: string | null;
  view_count: number;
  application_deadline: string | null;
  expires_at: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Hydrated properties
  company_name?: string;
  company_logo?: string;
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_name: string;
  required_level: 'Beginner' | 'Intermediate' | 'Expert';
  years_experience_required: number;
}

export interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  created_at?: string;
}

export interface JobFilter {
  locationType?: LocationType[];
  employmentType?: EmploymentType[];
  categoryId?: string;
  careerDomain?: CareerDomain[];
  minSalary?: number;
  salaryVisible?: boolean;
  country?: string;
  state?: string;
  city?: string;
  searchQuery?: string;
}

export interface JobPayload {
  title: string;
  slug: string;
  category_id: string | null;
  description: string;
  requirements: string;
  benefits?: string;
  career_domain: CareerDomain;
  location_type: LocationType;
  country: string;
  state?: string;
  city: string;
  employment_type: EmploymentType;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_visible: boolean;
  status: 'draft' | 'published';
  application_deadline?: string;
  expires_at?: string;
}

export interface JobSkillPayload {
  skill_name: string;
  required_level: 'Beginner' | 'Intermediate' | 'Expert';
  years_experience_required: number;
}
