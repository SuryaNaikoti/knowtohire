import { z } from 'zod';

// 1. Identity & Contact Schema
export const candidateIdentitySchema = z.object({
  headline: z.string().min(2, 'Headline must be at least 2 characters').max(255).optional().or(z.literal('')),
  bio: z.string().max(2000, 'Bio cannot exceed 2000 characters').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number format').optional().or(z.literal('')),
  location: z.string().max(150).optional().or(z.literal('')),
  workAuthorization: z.string().max(100).optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export type CandidateIdentityValues = z.infer<typeof candidateIdentitySchema>;

// 2. Experience Schema
export const candidateExperienceSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required').max(150),
    jobTitle: z.string().min(1, 'Job title is required').max(150),
    location: z.string().max(150).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    isCurrent: z.boolean().default(false),
    description: z.string().max(4000).optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrent && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date is required unless currently working in this role',
      path: ['endDate'],
    }
  );

export type CandidateExperienceValues = z.infer<typeof candidateExperienceSchema>;

// 3. Education & Certifications Schemas
export const candidateEducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required').max(200),
  degree: z.string().min(1, 'Degree or certificate title is required').max(150),
  fieldOfStudy: z.string().max(150).optional(),
  startYear: z.number().min(1950).max(new Date().getFullYear()).optional(),
  endYear: z.number().min(1950).max(2100).optional(),
  gradeGpa: z.string().max(50).optional(),
});

export type CandidateEducationValues = z.infer<typeof candidateEducationSchema>;

export const candidateCertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(200),
  issuingOrganization: z.string().min(1, 'Issuing organization is required').max(150),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export type CandidateCertificationValues = z.infer<typeof candidateCertificationSchema>;

// 4. Skills Intelligence Schema
export const candidateSkillSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required').max(100),
  categoryName: z.enum(['Technical', 'Functional', 'Soft', 'AI', 'ESG']),
  subcategoryName: z.string().min(1, 'Subcategory is required').max(100),
  proficiencyLevel: z.enum(['Expert', 'Advanced', 'Intermediate', 'Beginner']),
  yearsExperience: z.number().min(0).max(50).default(1),
  confidenceScore: z.number().min(0).max(100).default(80),
  evidenceUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export type CandidateSkillValues = z.infer<typeof candidateSkillSchema>;

// 5. Portfolio & Project Schemas
export const candidateProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200),
  role: z.string().max(150).optional(),
  description: z.string().max(3000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export type CandidateProjectValues = z.infer<typeof candidateProjectSchema>;

// 6. Privacy & Visibility Preferences Schema
export const candidatePrivacySchema = z.object({
  isPublic: z.boolean().default(true),
  isAnonymous: z.boolean().default(false),
  showContactInfo: z.boolean().default(false),
  showResume: z.boolean().default(true),
  showPortfolio: z.boolean().default(true),
});

export type CandidatePrivacyValues = z.infer<typeof candidatePrivacySchema>;

// 7. Human-in-the-Loop AI Suggestion Schema
export const aiSuggestionPayloadSchema = z.object({
  analysisType: z.enum(['PROFILE_SUMMARY', 'SKILL_GAP', 'ATS_OPTIMIZE', 'RESUME_PARSER']),
  promptUsed: z.string(),
  modelName: z.string().default('gemini-1.5-pro'),
  modelVersion: z.string().default('v1.0'),
  confidenceScore: z.number().min(0).max(100),
  aiSuggestionsJson: z.record(z.string(), z.any()),
  status: z.enum(['PENDING_USER_APPROVAL', 'ACCEPTED', 'REJECTED']).default('PENDING_USER_APPROVAL'),
});

export type AISuggestionPayloadValues = z.infer<typeof aiSuggestionPayloadSchema>;
