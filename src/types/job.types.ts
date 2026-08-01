import type { CareerDomain } from '../constants/careerDomains';
import type { JobStatus } from '../constants/jobStatuses';
import type { EmploymentType } from '../constants/employmentTypes';
import type { LocationType } from '../constants/locationTypes';

// Universal Taxonomy Node
export interface UniversalTaxonomyItem {
  id: string;
  category: 'Industry' | 'Function' | 'Skill' | 'ESG Domain' | 'Opportunity Type' | 'Education Level' | 'Country';
  name: string;
  code: string;
  parent_id?: string | null;
}

// Opportunity Provider Types & Root Graph Model
export type ProviderType =
  | 'Company'
  | 'University'
  | 'Government Agency'
  | 'Research Institute'
  | 'NGO'
  | 'Startup'
  | 'Accelerator'
  | 'Individual Mentor';

export interface OpportunityProvider {
  id: string;
  name: string;
  provider_type: ProviderType;
  logo_url?: string;
  website_url?: string;
  industry_domain?: string;
  company_size?: string;
  headquarters_location?: string;
  is_verified: boolean;
  trust_rating: number; // 0-100%
  description?: string;
  created_at?: string;
}

// Opportunity Template (Role Schema) vs. Instance
export interface OpportunityTemplate {
  id: string;
  provider_id: string;
  title: string;
  category_taxonomy_id?: string;
  domain_category: 'Jobs' | 'Internships' | 'Research' | 'Fellowships' | 'Hackathons' | 'Grants' | 'Mentorships';
  description: string;
  required_skills: { skill_name: string; required_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }[];
  education_level_required?: string;
  min_experience_years: number;
}

export type OpportunityLifecycleStatus =
  | 'Draft'
  | 'Under Review'
  | 'Published'
  | 'Featured'
  | 'Closing Soon'
  | 'Closed'
  | 'Archived';

export interface OpportunityInstance {
  id: string;
  template_id: string;
  provider_id: string;
  instance_title: string;
  provider_name?: string;
  provider_logo?: string;
  provider_type?: ProviderType;
  opportunity_type: 'Job' | 'Internship' | 'Freelance Project' | 'Research Position' | 'Government Opportunity' | 'Scholarship' | 'Fellowship' | 'Hackathon' | 'Mentorship';
  location_type: LocationType;
  city: string;
  country: string;
  compensation_range?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  lifecycle_status: OpportunityLifecycleStatus;
  is_featured: boolean;
  application_deadline?: string;
  hiring_manager_name?: string;
  related_opportunity_ids?: string[];
  created_at?: string;
}

// Market Skill Demand Graph Node
export interface SkillDemandNode {
  id: string;
  skill_name: string;
  market_demand_rating: 'High' | 'Medium' | 'Emerging';
  year_over_year_growth: number; // e.g. +24%
  average_salary_impact: string; // e.g. +$18,000 / yr
  replacement_skills?: string[];
}

// Canonical Platform Score Model
export interface CanonicalPlatformScore {
  scoreName: string;
  scoreValue: number; // 0-100%
  maxScore: number;
  confidenceScore: number;
  weight: number;
  explanation: string;
  positiveFactors: string[];
  negativeFactors: string[];
  evidenceLinks: string[];
  timestamp: string;
}

// 13-Factor Fit, Risk & Split Probabilities Engine Result
export interface OpportunityFitResult {
  opportunityId: string;
  candidateId: string;
  fitScore: number; // 0-100%
  riskScore: number; // 0-100%
  interviewProbability: number; // 0-100%
  offerProbability: number; // 0-100%
  factorScores: CanonicalPlatformScore[];
  positiveBreakdown: { factor: string; boost: number }[];
  negativeBreakdown: { factor: string; penalty: number }[];
  recommendedActions: string[];
}

// Application Graph Lifecycle
export type ApplicationLifecycleStage =
  | 'Applied'
  | 'Screening'
  | 'Technical Interview'
  | 'Final Interview'
  | 'Offer Extended'
  | 'Employed'
  | 'Rejected';

export interface ApplicationGraphItem {
  id: string;
  candidate_id: string;
  opportunity_instance_id: string;
  opportunity_title: string;
  provider_name: string;
  attached_persona_resume_title?: string;
  stage: ApplicationLifecycleStage;
  fit_score_at_apply: number;
  applied_at: string;
  updated_at: string;
}

// Backward compatibility legacy exports
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

export interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  created_at?: string;
}
