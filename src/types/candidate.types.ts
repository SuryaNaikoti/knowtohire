export interface CandidateProfile {
  id: string;
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  preferred_working_hours?: string;
  preferred_communication?: string;
  work_authorization?: string;
  availability_status?: 'Immediately Available' | '15 Days Notice' | '30 Days Notice' | 'Not Looking';
  notice_period?: string;
  avatar_url?: string;
  avatar_thumbnail_url?: string;
  source?: string;
  status?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CandidateSocialLink {
  id?: string;
  candidate_id?: string;
  platform_name: string;
  profile_url: string;
  visibility?: 'public' | 'employers_only' | 'private';
  is_verified?: boolean;
  display_order?: number;
  created_at?: string;
}

export interface CandidateLanguage {
  id?: string;
  candidate_id?: string;
  language_name: string;
  proficiency_level: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface CandidatePreferences {
  candidate_id: string;
  desired_role?: string;
  employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  target_salary_min?: number;
  target_salary_max?: number;
  currency?: string;
  current_ctc?: number;
  expected_joining_date?: string;
  remote_preference?: 'remote' | 'hybrid' | 'onsite';
  relocation_willing?: boolean;
  travel_willingness?: string;
  updated_at?: string;
}

export interface CandidatePrivacyValues {
  isPublic: boolean;
  isAnonymous: boolean;
  showContactInfo: boolean;
  showResume: boolean;
  showPortfolio: boolean;
}

export interface CandidateCompletionState {
  candidate_id: string;
  overall_readiness_score: number;
  identity_score: number;
  experience_score: number;
  education_score: number;
  skills_score: number;
  portfolio_score: number;
  resume_score: number;
  missing_sections: string[];
  updated_at?: string;
}

export interface CompetencyEvidenceItem {
  type: 'Experience' | 'Project' | 'Certification' | 'Education' | 'Portfolio';
  title: string;
  source_name: string;
  url?: string;
  verified_status?: 'Employer Verified' | 'Issuer Verified' | 'Self Verified';
}

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  category_name?: 'Technical' | 'Functional' | 'Soft' | 'AI' | 'ESG';
  subcategory_name?: string;
  years_of_experience: number;
  last_used_year?: number;
  competency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  confidence_score?: number; // 0-100%
  market_demand?: 'High' | 'Medium' | 'Emerging';
  evidence_count?: number;
  evidence_links?: CompetencyEvidenceItem[];
  related_skills?: string[];
  verification_status?: 'Unverified' | 'Self-Verified' | 'Employer-Verified' | 'AI-Verified';
  ai_recommendation?: 'Maintain' | 'Upgrade' | 'Featured Skill';
  is_ai_suggested?: boolean;
  created_at?: string;
}

export interface PortfolioEvidenceItem {
  id: string;
  candidate_id: string;
  title: string;
  evidence_type: 'Project' | 'Case Study' | 'GitHub Repos' | 'Patent' | 'Research Paper' | 'Publication' | 'Video Demo' | 'Open Source';
  description?: string;
  project_url?: string;
  github_url?: string;
  business_impact?: string;
  technologies_used?: string[];
  skills_demonstrated?: string[];
  media_urls?: string[];
  verification_status?: 'Self-Verified' | 'External-Verified';
  ai_summary?: string;
  created_at?: string;
}


export interface CareerEvidenceSkillLink {
  skill_id?: string;
  skill_name: string;
  proficiency_level?: string;
  weight?: number;
}

export interface CandidateExperience {
  id: string;
  candidate_id: string;
  company_name: string;
  role_title: string;
  employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  industry?: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  achievements?: string[];
  skills_used?: CareerEvidenceSkillLink[];
  technologies?: string[];
  projects_associated?: string[];
  evidence_files?: { name: string; url: string }[];
  verification_status?: 'Unverified' | 'Self-Verified' | 'Employer-Verified';
  ai_summary?: string;
  created_at?: string;
}

export interface CandidateEducation {
  id: string;
  candidate_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  grade_gpa?: string;
  honors?: string[];
  relevant_coursework?: string[];
  capstone_projects?: string[];
  skills_demonstrated?: CareerEvidenceSkillLink[];
  description: string;
  verification_status?: 'Unverified' | 'Verified';
  created_at?: string;
}

export interface CandidateCertification {
  id: string;
  candidate_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date: string | null;
  credential_id: string;
  credential_url: string;
  skills_covered?: CareerEvidenceSkillLink[];
  status?: 'Active' | 'Expired' | 'Lifetime';
  verification_status?: 'Unverified' | 'Issuer-Verified';
  created_at?: string;
}

export interface CareerProgressionInsight {
  totalYearsExperience: number;
  promotionCount: number;
  gapCount: number;
  gapDetails: string[];
  careerTrajectory: 'Rapid Acceleration' | 'Steady Growth' | 'Transitioning';
  topSkillsUsed: string[];
  strongestAchievement?: string;
}

export type CareerDocumentType =
  | 'Resume'
  | 'Cover Letter'
  | 'Portfolio PDF'
  | 'Certificate'
  | 'Publication'
  | 'Patent'
  | 'Case Study'
  | 'Recommendation'
  | 'Performance Review';

export type ResumePersona =
  | 'Software Engineer'
  | 'Data Engineer'
  | 'Product Manager'
  | 'Research CV'
  | 'Executive Resume'
  | 'ESG Specialist';

export interface CareerDocument {
  id: string;
  candidate_id: string;
  title: string;
  document_type: CareerDocumentType;
  persona?: ResumePersona;
  file_url?: string;
  version_name: string;
  parent_version_id?: string;
  ats_score: number;
  recruiter_score: number;
  executive_readability: number;
  keyword_coverage_json?: Record<string, number>;
  missing_competencies?: string[];
  ai_suggestions?: string[];
  analytics?: {
    downloads: number;
    employer_views: number;
    interview_conversion_rate: number;
  };
  is_primary?: boolean;
  created_at?: string;
}

export interface IntelligenceDomainScore {
  domainName: 'ATS' | 'Market' | 'Career' | 'Competency' | 'Interview' | 'Recruiter';
  score: number; // 0-100%
  status: 'Excellent' | 'Good' | 'Needs Improvement';
  trend: 'up' | 'down' | 'neutral';
  insight: string;
}

export interface PrescriptiveAIAction {
  id: string;
  title: string;
  impactScoreBoost: number; // e.g. +6 ATS
  targetDomain: 'ATS' | 'Market' | 'Career' | 'Competency' | 'Interview' | 'Recruiter';
  rationale: string;
  evidenceSupport: string;
  confidenceScore: number;
  status: 'Pending' | 'Accepted' | 'Dismissed';
}

export interface UnifiedCareerIntelligenceReport {
  candidateId: string;
  overallCareerScore: number;
  identityScore: number;
  evidenceScore: number;
  competencyScore: number;
  documentScore: number;
  domainScores: IntelligenceDomainScore[];
  prescriptiveActions: PrescriptiveAIAction[];
  historicalScoreTrends: { month: string; overallScore: number; atsScore: number; recruiterScore: number }[];
  updatedAt: string;
}




