export interface CandidateProfile {
  id: string;
  title: string;
  bio: string;
  desired_salary: number;
  currency: string;
  resume_url: string;
  profile_visibility: 'public' | 'private' | 'employers-only';
  created_at?: string;
  updated_at?: string;
}

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  years_of_experience: number;
  competency_level: 'Beginner' | 'Intermediate' | 'Expert';
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
  description: string;
  created_at?: string;
}

export interface CandidateExperience {
  id: string;
  candidate_id: string;
  company_name: string;
  role_title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
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
  created_at?: string;
}
