export interface CertificationItem {
  id: string;
  name: string;
  issuingOrg: string;
  year: string;
}

export interface CandidateOnboardingData {
  // Step 1: Basic Information
  fullName: string;
  headline: string;
  phone: string;
  location: string;

  // Step 2: About You
  bio: string;
  domainSpecialization: string;
  customDomainSpecialization?: string;

  // Step 3: Skills
  skills: string[];

  // Step 4: Experience
  totalExperience: string; // 'Fresher' | '0–1 years' | '1–3 years' | '3–5 years' | '5–10 years' | '10+ years'
  currentJobTitle: string;
  currentCompany: string;
  experienceYears: number;

  // Step 5: Education
  highestQualification: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;

  // Step 6: Certifications
  certifications: CertificationItem[];

  // Step 7: Career Preferences
  preferredJobTitles: string[];
  preferredLocations: string[];
  remotePreference: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  preferredIndustries: string[];
  careerInterests: string;

  // Step 8: Salary Expectations
  minSalaryINR: number;
  maxSalaryINR: number;
  currency: string;
  isNegotiable: boolean;

  // Step 9: Resume
  resumeUrl: string;
  resumeFileName: string;
  resumeFileSize: number;
}

export interface EmployerOnboardingData {
  // Step 1: Recruiter Information
  fullName: string;
  jobTitle: string;
  workPhone: string;

  // Step 2: Company Identity
  companyName: string;
  legalName: string;
  websiteUrl: string;
  industry: string;
  companySize: string;

  // Step 3: Company Location
  headquartersLocation: string;
  city: string;
  state: string;
  country: string;

  // Step 4: Company Description
  description: string;
  mission: string;
  cultureBenefits: string;

  // Step 5: Online Presence
  website: string;
  linkedinUrl: string;

  // Step 6: Company Contact & Admin
  workEmail: string;
  contactPhone: string;
  isCompanyAdmin: boolean;
}

/**
 * Deterministic Candidate Profile Completion Percentage Calculation
 * Weights total exactly 100%:
 * - Basic Info (Full Name, Headline, Location): 15%
 * - About & Specialization (Bio >= 50 chars, Domain): 15%
 * - Skills (>= 3 skill tags): 15%
 * - Experience (Experience level selected + Details): 15%
 * - Education (Qualification + Institution): 15%
 * - Certifications (At least 1 certification): 5%
 * - Career Preferences (Job titles, Locations, Remote & Type): 15%
 * - Resume Upload (Valid Resume URL): 5%
 */
export function calculateCandidateCompletionPct(data: Partial<CandidateOnboardingData>): number {
  let score = 0;

  // 1. Basic Info (15%)
  if (data.fullName?.trim() && data.headline?.trim() && data.location?.trim()) {
    score += 15;
  }

  // 2. About & Specialization (15%)
  if (data.bio?.trim() && data.bio.trim().length >= 50 && data.domainSpecialization) {
    score += 15;
  }

  // 3. Skills (15%)
  if (data.skills && data.skills.length >= 3) {
    score += 15;
  }

  // 4. Experience (15%)
  if (data.totalExperience) {
    if (data.totalExperience === 'Fresher') {
      score += 15;
    } else if (data.currentJobTitle?.trim() && data.currentCompany?.trim()) {
      score += 15;
    } else {
      score += 8;
    }
  }

  // 5. Education (15%)
  if (data.highestQualification && data.institution?.trim() && data.fieldOfStudy?.trim()) {
    score += 15;
  }

  // 6. Certifications (5%)
  if (data.certifications && data.certifications.length > 0) {
    score += 5;
  }

  // 7. Career Preferences (15%)
  if (
    data.preferredJobTitles && data.preferredJobTitles.length > 0 &&
    data.preferredLocations && data.preferredLocations.length > 0 &&
    data.remotePreference &&
    data.employmentType
  ) {
    score += 15;
  }

  // 8. Resume Upload (5%)
  if (data.resumeUrl?.trim()) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}
