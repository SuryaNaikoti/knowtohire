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
  created_at?: string;
}

export interface CompanyTeamMember {
  id: string;
  company_id: string;
  employer_id: string;
  member_role: 'Admin' | 'Recruiter' | 'Viewer';
  first_name?: string;
  last_name?: string;
  job_title?: string;
  created_at?: string;
}
