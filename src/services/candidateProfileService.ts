/**
 * KnowToHire Candidate Profile Service
 * Production Supabase abstraction for candidate profile operations,
 * onboarding data integration, profile updates, and deterministic completion scoring.
 */

import { supabase } from '@/lib/supabase';
import {
  CandidateProfile,
  ServiceResult,
  normalizeServiceError,
} from './types';

// ====================================================================
// TYPES
// ====================================================================

export interface CandidateExperienceItem {
  title: string;
  company: string;
  period?: string;
  total_experience_band?: string;
  years?: number;
  location?: string;
  description?: string;
}

export interface CandidateEducationItem {
  qualification?: string;
  degree?: string;
  institution: string;
  field_of_study?: string;
  fieldOfStudy?: string;
  graduation_year?: string;
  year?: string;
}

export interface CandidateFullProfile {
  id: string; // Auth User ID / Profile ID
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  domainSpecialization: string | null;
  skills: string[];
  experience: CandidateExperienceItem[];
  education: CandidateEducationItem[];
  certifications: string[];
  careerPreferences: Record<string, unknown> | null;
  preferredSalaryMin: number | null;
  preferredSalaryMax: number | null;
  employmentPreference: string | null;
  noticePeriodDays: number | null;
  resumeUrl: string | null;
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
}

/**
 * Deterministically calculates candidate profile completion percentage (0-100%)
 * based on live profile fields.
 * Weights:
 * - Basic Info (Full Name, Headline, Location): 15%
 * - Summary & Specialization (Bio >= 50 chars, Domain): 15%
 * - Skills (>= 3 skills): 15%
 * - Experience (At least 1 experience item or fresher indicated): 15%
 * - Education (At least 1 education item with institution): 15%
 * - Certifications (>= 1 certification): 5%
 * - Career Preferences (Job titles, Locations, Remote/Type): 15%
 * - Resume Upload (Valid Resume URL): 5%
 */
export function calculateProfileCompletionPct(
  profile: { full_name?: string | null },
  candidate: Partial<CandidateProfile>
): number {
  let score = 0;

  // 1. Basic Info (15%)
  if (profile.full_name?.trim() && candidate.headline?.trim() && candidate.location?.trim()) {
    score += 15;
  }

  // 2. Summary & Specialization (15%)
  const hasBio = Boolean(candidate.bio && candidate.bio.trim().length >= 30);
  const hasDomain = Boolean(candidate.domain_specialization?.trim());
  if (hasBio && hasDomain) {
    score += 15;
  } else if (hasBio || hasDomain) {
    score += 8;
  }

  // 3. Skills (15%)
  if (candidate.skills && candidate.skills.length >= 3) {
    score += 15;
  } else if (candidate.skills && candidate.skills.length > 0) {
    score += 5 * candidate.skills.length;
  }

  // 4. Experience (15%)
  const exp = Array.isArray(candidate.experience) ? candidate.experience : [];
  if (exp.length > 0) {
    score += 15;
  } else if (candidate.employment_preference) {
    score += 8;
  }

  // 5. Education (15%)
  const edu = Array.isArray(candidate.education) ? candidate.education : [];
  if (edu.length > 0) {
    score += 15;
  }

  // 6. Certifications (5%)
  if (candidate.certifications && candidate.certifications.length > 0) {
    score += 5;
  }

  // 7. Career Preferences (15%)
  if (candidate.career_preferences && Object.keys(candidate.career_preferences).length > 0) {
    score += 15;
  } else if (candidate.preferred_salary_min || candidate.preferred_salary_max) {
    score += 8;
  }

  // 8. Resume Upload (5%)
  if (candidate.resume_url?.trim()) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

// ====================================================================
// SERVICE IMPLEMENTATION
// ====================================================================

export const candidateProfileService = {
  /**
   * Fetch the full candidate profile for the currently authenticated user.
   * Merges data from public.profiles and public.candidate_profiles.
   */
  async getMyCandidateProfile(): Promise<ServiceResult<CandidateFullProfile>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const userId = authData.user.id;

      // 1. Fetch public.profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        return {
          data: null,
          error: normalizeServiceError(profileError || new Error('User profile record not found.')),
        };
      }

      // 2. Fetch public.candidate_profiles
      const { data: candProfile, error: candError } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      if (candError) {
        console.warn('[candidateProfileService] Error fetching candidate profile:', candError.message);
      }

      // 3. Normalize Experience & Education arrays from JSONB
      const rawExp = candProfile?.experience;
      const experienceList: CandidateExperienceItem[] = Array.isArray(rawExp)
        ? (rawExp as CandidateExperienceItem[])
        : [];

      const rawEdu = candProfile?.education;
      const educationList: CandidateEducationItem[] = Array.isArray(rawEdu)
        ? (rawEdu as CandidateEducationItem[])
        : [];

      // 4. Calculate live profile completion score
      const rawCompletion = candProfile?.profile_completion_pct;
      const calculatedPct = calculateProfileCompletionPct(userProfile, candProfile || {});
      const effectiveCompletionPct =
        typeof rawCompletion === 'number' && rawCompletion > 0
          ? Math.max(rawCompletion, calculatedPct)
          : calculatedPct;

      const fullProfile: CandidateFullProfile = {
        id: userProfile.id,
        email: userProfile.email || authData.user.email || '',
        fullName: userProfile.full_name || '',
        phone: userProfile.phone || null,
        avatarUrl: userProfile.avatar_url || null,
        headline: candProfile?.headline || null,
        bio: candProfile?.bio || null,
        location: candProfile?.location || null,
        domainSpecialization: candProfile?.domain_specialization || null,
        skills: Array.isArray(candProfile?.skills) ? candProfile.skills : [],
        experience: experienceList,
        education: educationList,
        certifications: Array.isArray(candProfile?.certifications) ? candProfile.certifications : [],
        careerPreferences: candProfile?.career_preferences || null,
        preferredSalaryMin: candProfile?.preferred_salary_min ?? null,
        preferredSalaryMax: candProfile?.preferred_salary_max ?? null,
        employmentPreference: candProfile?.employment_preference || null,
        noticePeriodDays: candProfile?.notice_period_days ?? null,
        resumeUrl: candProfile?.resume_url || null,
        profileCompletionPct: effectiveCompletionPct,
        status: userProfile.status,
        role: userProfile.role,
        createdAt: candProfile?.created_at || userProfile.created_at,
        updatedAt: candProfile?.updated_at || userProfile.updated_at,
      };

      return { data: fullProfile, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Persist updates to the authenticated candidate's profile in Supabase.
   * Updates public.profiles (e.g. full_name, phone) and public.candidate_profiles.
   */
  async updateMyCandidateProfile(
    input: CandidateProfileUpdateInput
  ): Promise<ServiceResult<CandidateFullProfile>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required to update profile.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const userId = authData.user.id;

      // 1. Update public.profiles if full_name, phone, or avatar_url changed
      const profileUpdates: Record<string, unknown> = {};
      if (input.fullName !== undefined && input.fullName.trim()) {
        profileUpdates.full_name = input.fullName.trim();
      }
      if (input.phone !== undefined) {
        profileUpdates.phone = input.phone ? input.phone.trim() : null;
      }
      if (input.avatarUrl !== undefined) {
        profileUpdates.avatar_url = input.avatarUrl ? input.avatarUrl.trim() : null;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileUpdateError) {
          return { data: null, error: normalizeServiceError(profileUpdateError) };
        }
      }

      // 2. Fetch existing candidate_profiles record or initialize
      const { data: existingCand } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      // 3. Prepare candidate_profiles payload
      const candidatePayload: Record<string, unknown> = {
        profile_id: userId,
        updated_at: new Date().toISOString(),
      };

      if (input.headline !== undefined) candidatePayload.headline = input.headline ? input.headline.trim() : null;
      if (input.bio !== undefined) candidatePayload.bio = input.bio ? input.bio.trim() : null;
      if (input.location !== undefined) candidatePayload.location = input.location ? input.location.trim() : null;
      if (input.domainSpecialization !== undefined) candidatePayload.domain_specialization = input.domainSpecialization || null;
      if (input.skills !== undefined) candidatePayload.skills = input.skills;
      if (input.experience !== undefined) candidatePayload.experience = input.experience;
      if (input.education !== undefined) candidatePayload.education = input.education;
      if (input.certifications !== undefined) candidatePayload.certifications = input.certifications;
      if (input.careerPreferences !== undefined) candidatePayload.career_preferences = input.careerPreferences;
      if (input.preferredSalaryMin !== undefined) candidatePayload.preferred_salary_min = input.preferredSalaryMin;
      if (input.preferredSalaryMax !== undefined) candidatePayload.preferred_salary_max = input.preferredSalaryMax;
      if (input.employmentPreference !== undefined) candidatePayload.employment_preference = input.employmentPreference;
      if (input.noticePeriodDays !== undefined) candidatePayload.notice_period_days = input.noticePeriodDays;
      if (input.resumeUrl !== undefined) candidatePayload.resume_url = input.resumeUrl;

      // 4. Calculate updated profile completion score
      const mergedProfileForCalc = {
        full_name: input.fullName || (profileUpdates.full_name as string) || null,
      };
      const mergedCandidateForCalc = {
        ...(existingCand || {}),
        ...candidatePayload,
      };
      const completionPct = calculateProfileCompletionPct(mergedProfileForCalc, mergedCandidateForCalc);
      candidatePayload.profile_completion_pct = completionPct;

      // 5. Upsert public.candidate_profiles
      const { error: candUpsertError } = await supabase
        .from('candidate_profiles')
        .upsert(candidatePayload, { onConflict: 'profile_id' });

      if (candUpsertError) {
        return { data: null, error: normalizeServiceError(candUpsertError) };
      }

      // 6. Return fresh full profile representation
      return this.getMyCandidateProfile();
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
