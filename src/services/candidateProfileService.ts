import { supabase } from '@/lib/supabase';
import {
  CandidateFullProfile,
  CandidateExperienceItem,
  CandidateEducationItem,
  CandidateProfileUpdateInput,
  ServiceResult,
  normalizeServiceError,
} from './types';
import { resumeService } from './resumeService';

// ====================================================================
// PROFILE COMPLETION ALGORITHM (Calculated in Service Layer)
// ====================================================================

export function calculateProfileCompletionPct(
  profile: Record<string, unknown>,
  candidate: Record<string, unknown>
): number {
  let score = 0;

  // 1. Basic Identity (20%)
  if (profile.full_name && String(profile.full_name).trim()) score += 10;
  if (profile.phone && String(profile.phone).trim()) score += 5;
  if (profile.avatar_url && String(profile.avatar_url).trim()) score += 5;

  // 2. Headline & Bio (15%)
  if (candidate.headline && String(candidate.headline).trim()) score += 10;
  if (candidate.bio && String(candidate.bio).trim().length >= 30) score += 5;

  // 3. Location & Specialization (15%)
  if (candidate.location && String(candidate.location).trim()) score += 5;
  if (candidate.domain_specialization && String(candidate.domain_specialization).trim()) score += 10;

  // 4. Skills Matrix (15%)
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  if (skills.length >= 5) score += 15;
  else if (skills.length >= 3) score += 10;
  else if (skills.length >= 1) score += 5;

  // 5. Work Experience (15%)
  const experience = Array.isArray(candidate.experience) ? candidate.experience : [];
  if (experience.length >= 2) score += 15;
  else if (experience.length === 1) score += 10;

  // 6. Education (10%)
  const education = Array.isArray(candidate.education) ? candidate.education : [];
  if (education.length >= 1) score += 10;

  // 7. Certifications (5%)
  const certs = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  if (certs.length >= 1) score += 5;

  // 8. Resume Upload (5%)
  if (candidate.resume_url && String(candidate.resume_url).trim()) {
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
      // 1. Check for demo auth session
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
        if (storedDemo) {
          const parsed = JSON.parse(storedDemo);
          if (parsed?.role === 'candidate') {
            const candidateId = parsed.id || '00000000-0000-0000-0000-000000000001';
            const storedResume = resumeService.getStoredDemoResume(candidateId);

            // Check for saved candidate custom profile data
            let customOverrides: Partial<CandidateFullProfile> = {};
            try {
              const storedCustom = window.localStorage.getItem(`kth_demo_cand_profile_${candidateId}`);
              if (storedCustom) {
                customOverrides = JSON.parse(storedCustom);
              }
            } catch {
              // Ignore
            }

            // Check for auth profile overrides
            let authCustom: Record<string, unknown> = {};
            try {
              const storedAuth = window.localStorage.getItem(`kth_demo_profile_custom_${candidateId}`);
              if (storedAuth) {
                authCustom = JSON.parse(storedAuth);
              }
            } catch {
              // Ignore
            }

            const fullName = (authCustom.full_name as string) || (parsed.full_name as string) || 'Aarav Sharma (ESG Analyst)';
            const phone = authCustom.phone !== undefined ? (authCustom.phone as string) : (parsed.phone as string) || '+91 98765 43210';
            const avatarUrl = (authCustom.avatar_url as string) || parsed.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80';
            const headline = customOverrides.headline !== undefined ? customOverrides.headline : 'Senior Environmental & ESG Consultant';
            const bio = customOverrides.bio !== undefined ? customOverrides.bio : 'Environmental consultant with 5+ years of experience leading SEBI BRSR compliance, ISO 14001 audits, and corporate decarbonization strategies across renewable energy and manufacturing sectors in India.';
            const location = customOverrides.location !== undefined ? customOverrides.location : 'Hyderabad, Telangana';
            const domainSpecialization = customOverrides.domainSpecialization !== undefined ? customOverrides.domainSpecialization : 'Sustainability & ESG Advisory';
            const skills = customOverrides.skills !== undefined ? customOverrides.skills : ['ESG Reporting', 'SEBI BRSR', 'ISO 14001', 'Carbon Accounting', 'EIA Assessment', 'GRI Standards', 'Hazardous Waste Compliance'];
            const experience = customOverrides.experience !== undefined ? customOverrides.experience : [
              {
                title: 'Senior ESG Consultant',
                company: 'EcoStrategy India Pvt Ltd',
                period: '2023 - Present',
                location: 'Hyderabad',
                description: 'Led BRSR mandatory reporting readiness and Scope 1 & 2 carbon accounting for top 500 listed Indian corporate clients.',
              },
              {
                title: 'Environmental Compliance Specialist',
                company: 'GreenTech Infrastructure',
                period: '2021 - 2023',
                location: 'Bengaluru',
                description: 'Secured MoEFCC environmental clearances and SPCB consent to operate (CTO) for commercial clean energy projects.',
              },
            ];
            const education = customOverrides.education !== undefined ? customOverrides.education : [
              {
                qualification: 'M.Sc in Environmental Science & Technology',
                degree: 'M.Sc in Environmental Science & Technology',
                institution: 'Indian Institute of Technology (IIT) Bombay',
                graduation_year: '2021',
                year: '2021',
              },
              {
                qualification: 'B.Tech in Chemical Engineering',
                degree: 'B.Tech in Chemical Engineering',
                institution: 'National Institute of Technology (NIT) Warangal',
                graduation_year: '2019',
                year: '2019',
              },
            ];
            const certifications = customOverrides.certifications !== undefined ? customOverrides.certifications : [
              'GRI Certified Sustainability Professional (2024)',
              'Lead Auditor ISO 14001:2015 Environmental Management',
            ];
            const activeResumeUrl = customOverrides.resumeUrl !== undefined ? customOverrides.resumeUrl : (storedResume?.url || null);

            // Calculate authentic completeness score
            const calculatedPct = calculateProfileCompletionPct(
              { full_name: fullName, phone, avatar_url: avatarUrl },
              {
                headline,
                bio,
                location,
                domain_specialization: domainSpecialization,
                skills,
                experience,
                education,
                certifications,
                resume_url: activeResumeUrl,
              }
            );

            const demoFull: CandidateFullProfile = {
              id: candidateId,
              email: parsed.email || 'candidate@knowtohire.com',
              fullName,
              phone: phone || null,
              avatarUrl: avatarUrl || null,
              headline: headline || null,
              bio: bio || null,
              location: location || null,
              domainSpecialization: domainSpecialization || null,
              skills,
              experience,
              education,
              certifications,
              careerPreferences: customOverrides.careerPreferences || {
                preferredLocations: ['Hyderabad', 'Bengaluru', 'Remote'],
                targetRoles: ['Senior ESG Consultant', 'Lead Sustainability Manager'],
              },
              preferredSalaryMin: customOverrides.preferredSalaryMin ?? 2200000,
              preferredSalaryMax: customOverrides.preferredSalaryMax ?? 3200000,
              employmentPreference: customOverrides.employmentPreference || 'Full-Time / Hybrid',
              noticePeriodDays: customOverrides.noticePeriodDays ?? 15,
              resumeUrl: activeResumeUrl,
              profileCompletionPct: calculatedPct,
              status: 'active',
              role: 'candidate',
              createdAt: '2026-08-01T00:00:00Z',
              updatedAt: new Date().toISOString(),
            };
            return { data: demoFull, error: null };
          }
        }
      }

      // 2. Real Supabase Session
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
      const calculatedPct = calculateProfileCompletionPct(userProfile, candProfile || {});

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
        profileCompletionPct: calculatedPct,
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
      // 1. Handle Demo Auth Session
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
        if (storedDemo) {
          const parsed = JSON.parse(storedDemo);
          if (parsed?.role === 'candidate') {
            const candidateId = parsed.id || '00000000-0000-0000-0000-000000000001';

            // Update demo profile metadata in kth_demo_profile_custom_
            let existingAuthCustom: Record<string, unknown> = {};
            try {
              const prevAuth = window.localStorage.getItem(`kth_demo_profile_custom_${candidateId}`);
              if (prevAuth) existingAuthCustom = JSON.parse(prevAuth);
            } catch {
              // Ignore
            }

            if (input.fullName !== undefined) existingAuthCustom.full_name = input.fullName.trim();
            if (input.phone !== undefined) existingAuthCustom.phone = input.phone ? input.phone.trim() : null;
            if (input.avatarUrl !== undefined) existingAuthCustom.avatar_url = input.avatarUrl ? input.avatarUrl.trim() : null;
            existingAuthCustom.updated_at = new Date().toISOString();
            window.localStorage.setItem(`kth_demo_profile_custom_${candidateId}`, JSON.stringify(existingAuthCustom));

            // Update candidate-specific fields in kth_demo_cand_profile_
            let existingCandCustom: Record<string, unknown> = {};
            try {
              const prevCand = window.localStorage.getItem(`kth_demo_cand_profile_${candidateId}`);
              if (prevCand) existingCandCustom = JSON.parse(prevCand);
            } catch {
              // Ignore
            }

            if (input.headline !== undefined) existingCandCustom.headline = input.headline ? input.headline.trim() : null;
            if (input.bio !== undefined) existingCandCustom.bio = input.bio ? input.bio.trim() : null;
            if (input.location !== undefined) existingCandCustom.location = input.location ? input.location.trim() : null;
            if (input.domainSpecialization !== undefined) existingCandCustom.domainSpecialization = input.domainSpecialization || null;
            if (input.skills !== undefined) existingCandCustom.skills = input.skills;
            if (input.experience !== undefined) existingCandCustom.experience = input.experience;
            if (input.education !== undefined) existingCandCustom.education = input.education;
            if (input.certifications !== undefined) existingCandCustom.certifications = input.certifications;
            if (input.careerPreferences !== undefined) existingCandCustom.careerPreferences = input.careerPreferences;
            if (input.preferredSalaryMin !== undefined) existingCandCustom.preferredSalaryMin = input.preferredSalaryMin;
            if (input.preferredSalaryMax !== undefined) existingCandCustom.preferredSalaryMax = input.preferredSalaryMax;
            if (input.employmentPreference !== undefined) existingCandCustom.employmentPreference = input.employmentPreference;
            if (input.noticePeriodDays !== undefined) existingCandCustom.noticePeriodDays = input.noticePeriodDays;
            if (input.resumeUrl !== undefined) existingCandCustom.resumeUrl = input.resumeUrl;

            window.localStorage.setItem(`kth_demo_cand_profile_${candidateId}`, JSON.stringify(existingCandCustom));

            if (input.resumeUrl !== undefined) {
              const existingStored = resumeService.getStoredDemoResume(candidateId);
              resumeService.saveStoredDemoResume(candidateId, {
                url: input.resumeUrl || '',
                fileName: existingStored?.fileName || resumeService.extractResumeFileName(input.resumeUrl, 'Candidate_Resume.pdf'),
                fileSize: existingStored?.fileSize,
                uploadedAt: existingStored?.uploadedAt || new Date().toISOString(),
              });
            }
            return this.getMyCandidateProfile();
          }
        }
      }

      // 2. Real Supabase Session
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
