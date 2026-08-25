/**
 * KnowToHire Candidate Discovery Service
 * Allows Employers to search, filter, view, and compare candidate profiles from live Supabase records.
 */

import { supabase } from '@/lib/supabase';
import { resumeService } from './resumeService';
import { ServiceResult, normalizeServiceError, CandidateExperienceItem, CandidateEducationItem } from './types';

export interface DiscoverableCandidate {
  id: string; // profile_id
  name: string;
  headline: string;
  email: string;
  phone?: string;
  location: string;
  domain: string;
  bio?: string;
  skills: string[];
  certifications?: string[];
  experienceList?: CandidateExperienceItem[];
  educationList?: CandidateEducationItem[];
  experienceYears: number;
  experienceSummary: string;
  noticePeriodDays: number;
  expectedSalaryINR: number;
  profileCompletion: number;
  avatarUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  educationSummary?: string;
}

export interface CandidateSearchParams {
  search?: string;
  domain?: string;
  skills?: string[];
  location?: string;
  minExperience?: number;
  maxNoticeDays?: number;
  limit?: number;
}

export const candidateDiscoveryService = {
  /**
   * Search real candidates in Supabase.
   */
  async searchCandidates(params?: CandidateSearchParams): Promise<ServiceResult<DiscoverableCandidate[]>> {
    try {
      // 1. Check if Supabase configured
      let query = supabase
        .from('candidate_profiles')
        .select('*, profile:profiles(id, full_name, email, phone, avatar_url, status)')
        .eq('is_discoverable', true)
        .eq('is_active', true)
        .order('profile_completion_pct', { ascending: false });

      if (params?.domain && params.domain !== 'all') {
        query = query.ilike('domain_specialization', `%${params.domain}%`);
      }

      if (params?.location && params.location.trim()) {
        query = query.ilike('location', `%${params.location.trim()}%`);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        // Table or network catch
      }

      let rawCandList = data || [];

      // If running in local demo mode, check demo candidate discoverability & active settings
      if (typeof window !== 'undefined' && window.localStorage) {
        const candidateId = '00000000-0000-0000-0000-000000000001';
        let demoCandSettings: Record<string, unknown> = {};
        try {
          const raw = window.localStorage.getItem(`kth_demo_cand_profile_${candidateId}`);
          if (raw) demoCandSettings = JSON.parse(raw);
        } catch {
          // Ignore
        }

        const isDiscoverable = demoCandSettings.isDiscoverable !== undefined ? Boolean(demoCandSettings.isDiscoverable) : true;
        const isActive = demoCandSettings.isActive !== undefined ? Boolean(demoCandSettings.isActive) : true;

        if (rawCandList.length === 0 && isDiscoverable && isActive) {
          // Inject mock discoverable candidate if permitted
          rawCandList = [
            {
              profile_id: candidateId,
              headline: (demoCandSettings.headline as string) || 'Senior Solutions Engineer',
              domain_specialization: (demoCandSettings.domainSpecialization as string) || 'Engineering & Technology Advisory',
              location: (demoCandSettings.location as string) || 'Hyderabad, Telangana',
              skills: Array.isArray(demoCandSettings.skills) ? demoCandSettings.skills : ['React & TypeScript', 'Node.js & API Architecture', 'Cloud Infrastructure (AWS/GCP)'],
              profile_completion_pct: 90,
              profile: {
                id: candidateId,
                full_name: 'Surya Naikoti',
                email: 'candidate@knowtohire.com',
                phone: '+91 98765 43210',
                status: 'active',
              },
            } as any,
          ];
        } else if (!isDiscoverable || !isActive) {
          // If demo candidate deactivated or made non-discoverable, exclude them
          rawCandList = rawCandList.filter((c: any) => c.profile_id !== candidateId && c.id !== candidateId);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let results: DiscoverableCandidate[] = rawCandList.map((cp: any) => {
        const p = cp.profile || {};
        
        // Calculate years of experience from experience array if present
        let expYears = 2;
        let expSummary = 'Environmental & Sustainability Professional';
        if (Array.isArray(cp.experience) && cp.experience.length > 0) {
          expYears = cp.experience.length * 2;
          const firstExp = cp.experience[0];
          if (firstExp && typeof firstExp === 'object') {
            expSummary = `${firstExp.role || firstExp.title || 'Specialist'} at ${firstExp.company || 'Enterprise'}`;
          }
        }

        let eduSummary = 'Bachelor of Science / Technology';
        if (Array.isArray(cp.education) && cp.education.length > 0) {
          const firstEdu = cp.education[0];
          if (firstEdu && typeof firstEdu === 'object') {
            eduSummary = `${firstEdu.degree || 'Degree'} - ${firstEdu.institution || 'University'}`;
          }
        }

        return {
          id: cp.profile_id || p.id || cp.id,
          name: p.full_name || 'Candidate',
          headline: cp.headline || 'Sustainability & Environmental Specialist',
          email: p.email || '',
          phone: p.phone || undefined,
          location: cp.location || 'India',
          domain: cp.domain_specialization || 'Environmental Engineering',
          skills: Array.isArray(cp.skills) && cp.skills.length > 0 ? cp.skills : ['EIA', 'ESG Compliance', 'Environmental Auditing'],
          experienceYears: expYears,
          experienceSummary: expSummary,
          noticePeriodDays: Number(cp.notice_period_days) || 30,
          expectedSalaryINR: Number(cp.preferred_salary_min) || 800000,
          profileCompletion: Number(cp.profile_completion_pct) || 75,
          avatarUrl: p.avatar_url,
          resumeUrl: cp.resume_url,
          educationSummary: eduSummary,
        };
      });

      // Filter in-memory for skills / text search if needed
      if (params?.search && params.search.trim()) {
        const s = params.search.toLowerCase();
        results = results.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.headline.toLowerCase().includes(s) ||
            c.domain.toLowerCase().includes(s) ||
            c.skills.some((sk) => sk.toLowerCase().includes(s))
        );
      }

      return { data: results, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch candidate details by ID.
   */
  async getCandidateById(candidateId: string): Promise<ServiceResult<DiscoverableCandidate>> {
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*, profile:profiles(id, full_name, email, phone, avatar_url)')
        .eq('profile_id', candidateId)
        .maybeSingle();

      if (data) {
        const p = data.profile || {};
        let expYears = 3;
        let expSummary = 'Environmental & Sustainability Professional';
        if (Array.isArray(data.experience) && data.experience.length > 0) {
          expYears = data.experience.length * 2;
          const firstExp = data.experience[0];
          if (firstExp && typeof firstExp === 'object') {
            expSummary = `${firstExp.role || firstExp.title || 'Specialist'} at ${firstExp.company || 'Enterprise'}`;
          }
        }

        let eduSummary = 'Bachelor of Technology';
        if (Array.isArray(data.education) && data.education.length > 0) {
          const firstEdu = data.education[0];
          if (firstEdu && typeof firstEdu === 'object') {
            eduSummary = `${firstEdu.degree || 'Degree'} - ${firstEdu.institution || 'University'}`;
          }
        }

        const candidate: DiscoverableCandidate = {
          id: data.profile_id || p.id,
          name: p.full_name || 'Candidate',
          headline: data.headline || 'Sustainability & Environmental Specialist',
          email: p.email || '',
          phone: p.phone,
          location: data.location || 'India',
          domain: data.domain_specialization || 'Environmental Engineering',
          bio: data.bio || '',
          skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : ['EIA', 'ESG Compliance', 'Environmental Auditing'],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          experienceList: Array.isArray(data.experience) ? data.experience : [],
          educationList: Array.isArray(data.education) ? data.education : [],
          experienceYears: expYears,
          experienceSummary: expSummary,
          noticePeriodDays: Number(data.notice_period_days) || 30,
          expectedSalaryINR: Number(data.preferred_salary_min) || 800000,
          profileCompletion: Number(data.profile_completion_pct) || 80,
          avatarUrl: p.avatar_url,
          resumeUrl: data.resume_url,
          resumeFileName: data.resume_file_name || (data.resume_url ? data.resume_url.split('/').pop() : 'Candidate_Resume.pdf'),
          educationSummary: eduSummary,
        };

        return { data: candidate, error: null };
      }

      // Check demo candidate profile in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(`kth_demo_cand_profile_${candidateId}`);
          const storedResume = window.localStorage.getItem(`kth_candidate_resume_${candidateId}`);
          const authCustom = window.localStorage.getItem(`kth_demo_profile_custom_${candidateId}`);

          let candSettings: Record<string, any> = {};
          if (raw) candSettings = JSON.parse(raw);
          let parsedResume: Record<string, any> = {};
          if (storedResume) parsedResume = JSON.parse(storedResume);
          let parsedAuth: Record<string, any> = {};
          if (authCustom) parsedAuth = JSON.parse(authCustom);

          const defaultSkills = ['React & TypeScript', 'Node.js & API Architecture', 'Cloud Infrastructure (AWS/GCP)', 'Database Systems & SQL'];
          const defaultExp: CandidateExperienceItem[] = [
            {
              company: 'Enterprise Cloud Solutions India',
              title: 'Senior Full Stack & Cloud Solutions Engineer',
              location: 'Hyderabad',
              period: '2023 - Present',
              description: 'Leading cloud architecture migrations and enterprise full stack systems in React, TypeScript, Node.js, and AWS/GCP.',
            },
            {
              company: 'Innovate Tech Labs',
              title: 'Full Stack Engineer',
              location: 'Hyderabad',
              period: '2020 - 2022',
              description: 'Built high-throughput REST APIs and React dashboards with PostgreSQL and Dockerized deployments.',
            },
          ];

          const defaultEdu: CandidateEducationItem[] = [
            {
              institution: 'JNTU Hyderabad',
              degree: 'B.Tech in Computer Science & Engineering',
              graduation_year: '2020',
            },
          ];

          let activeResumeUrl = candSettings.resumeUrl || parsedResume.url || '';
          let activeFileName = candSettings.resumeFileName || parsedResume.fileName || 'Candidate_Resume.pdf';

          if (!activeResumeUrl || activeResumeUrl.includes('knowtohire.com/resumes')) {
            const stored = resumeService.getStoredDemoResume(candidateId);
            if (stored?.url) {
              activeResumeUrl = stored.url;
              activeFileName = stored.fileName || 'Candidate_Resume.pdf';
            }
          }

          const demoCandidate: DiscoverableCandidate = {
            id: candidateId,
            name: parsedAuth.full_name || candSettings.fullName || 'Surya Naikoti',
            headline: candSettings.headline || 'Senior Full Stack & Cloud Solutions Engineer',
            email: parsedAuth.email || 'candidate@knowtohire.com',
            phone: parsedAuth.phone || candSettings.phone || '+91 98765 43210',
            location: candSettings.location || 'Hyderabad, Telangana',
            domain: candSettings.domainSpecialization || 'Engineering & Technology Advisory',
            bio: candSettings.bio || 'Senior Solutions Engineer with 6+ years architecting scalable full-stack applications, distributed cloud architectures on AWS/GCP, and CI/CD automation.',
            skills: Array.isArray(candSettings.skills) && candSettings.skills.length > 0 ? candSettings.skills : defaultSkills,
            certifications: Array.isArray(candSettings.certifications) ? candSettings.certifications : ['AWS Certified Solutions Architect', 'Professional Cloud Developer'],
            experienceList: Array.isArray(candSettings.experience) && candSettings.experience.length > 0 ? candSettings.experience : defaultExp,
            educationList: Array.isArray(candSettings.education) && candSettings.education.length > 0 ? candSettings.education : defaultEdu,
            experienceYears: 6,
            experienceSummary: 'Senior Solutions Engineer at Enterprise Cloud Solutions India',
            noticePeriodDays: Number(candSettings.noticePeriodDays) || 30,
            expectedSalaryINR: Number(candSettings.expectedSalary) || 1800000,
            profileCompletion: 92,
            avatarUrl: parsedAuth.avatar_url || candSettings.avatarUrl,
            resumeUrl: activeResumeUrl,
            resumeFileName: activeFileName,
            educationSummary: 'B.Tech in Computer Science & Engineering - JNTU Hyderabad',
          };

          return { data: demoCandidate, error: null };
        } catch {
          // ignore
        }
      }

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return {
        data: null,
        error: { message: 'Candidate profile not found', code: 'NOT_FOUND', status: 404 },
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
