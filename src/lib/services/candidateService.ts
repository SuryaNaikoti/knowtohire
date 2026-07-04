import { supabase, isSupabaseConfigured } from '../supabase';

import type {
  CandidateProfile,
  CandidateSkill,
  CandidateEducation,
  CandidateExperience,
  CandidateCertification,
} from '../../types/candidate.types';

export type {
  CandidateProfile,
  CandidateSkill,
  CandidateEducation,
  CandidateExperience,
  CandidateCertification,
};

// Local Storage simulation helpers
const getSimulatedData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setSimulatedData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const candidateService = {
  // PROFILES API
  getProfile: async (candidateId: string): Promise<CandidateProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', candidateId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          // Record doesn't exist, create it below or return null
          return null;
        }
        console.error('[SUPABASE GET PROFILE ERROR]', error);
        throw error;
      }
      return data as CandidateProfile;
    } else {
      // Local Storage simulation fallback
      const defaultProfile: CandidateProfile = {
        id: candidateId,
        title: 'Senior Frontend Architect',
        bio: 'Over 6 years of experience building scalable SaaS web interfaces with React, TypeScript, and Tailwind CSS.',
        desired_salary: 120000,
        currency: 'USD',
        resume_url: '',
        profile_visibility: 'public',
      };
      return getSimulatedData<CandidateProfile>(`kth_profile_${candidateId}`, defaultProfile);
    }
  },

  updateProfile: async (candidateId: string, profile: Partial<CandidateProfile>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_profiles')
        .upsert({ id: candidateId, ...profile, updated_at: new Date().toISOString() });
      if (error) {
        console.error('[SUPABASE UPDATE PROFILE ERROR]', error);
        throw error;
      }
      return true;
    } else {
      const current = await candidateService.getProfile(candidateId) || { id: candidateId } as CandidateProfile;
      const updated = { ...current, ...profile };
      setSimulatedData(`kth_profile_${candidateId}`, updated);
      return true;
    }
  },

  // RESUME UPLOADER
  uploadResume: async (candidateId: string, file: File): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${candidateId}/resume-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('[SUPABASE RESUME UPLOAD ERROR]', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update candidate profile resume URL reference
      await candidateService.updateProfile(candidateId, { resume_url: publicUrl });
      return publicUrl;
    } else {
      // Local simulation upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const simulatedUrl = `https://mockstorage.knowtohire.com/resumes/${candidateId}/${file.name}`;
      await candidateService.updateProfile(candidateId, { resume_url: simulatedUrl });
      return simulatedUrl;
    }
  },

  // SKILLS API
  getSkills: async (candidateId: string): Promise<CandidateSkill[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('candidate_skills')
        .select('*')
        .eq('candidate_id', candidateId);
      if (error) throw error;
      return data as CandidateSkill[];
    } else {
      const defaultSkills: CandidateSkill[] = [
        { id: 'sk-1', candidate_id: candidateId, skill_name: 'React', years_of_experience: 5, competency_level: 'Expert' },
        { id: 'sk-2', candidate_id: candidateId, skill_name: 'TypeScript', years_of_experience: 4, competency_level: 'Expert' },
        { id: 'sk-3', candidate_id: candidateId, skill_name: 'Tailwind CSS', years_of_experience: 3, competency_level: 'Expert' },
      ];
      return getSimulatedData<CandidateSkill[]>(`kth_skills_${candidateId}`, defaultSkills);
    }
  },

  addSkill: async (skill: Omit<CandidateSkill, 'id'>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('candidate_skills').insert(skill);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getSkills(skill.candidate_id);
      const newSkill: CandidateSkill = {
        id: `sk_${Math.random().toString(36).substring(2, 9)}`,
        ...skill,
      };
      // Prevent duplicates in simulation
      if (current.some((s) => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase())) {
        return false;
      }
      setSimulatedData(`kth_skills_${skill.candidate_id}`, [...current, newSkill]);
      return true;
    }
  },

  deleteSkill: async (candidateId: string, skillId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('id', skillId);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getSkills(candidateId);
      setSimulatedData(`kth_skills_${candidateId}`, current.filter((s) => s.id !== skillId));
      return true;
    }
  },

  // EXPERIENCE API
  getExperience: async (candidateId: string): Promise<CandidateExperience[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('candidate_experience')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as CandidateExperience[];
    } else {
      const defaultExp: CandidateExperience[] = [
        {
          id: 'exp-1',
          candidate_id: candidateId,
          company_name: 'InnoTech Solutions',
          role_title: 'Senior React Developer',
          location: 'San Francisco, CA',
          start_date: '2023-01-01',
          end_date: null,
          is_current: true,
          description: 'Lead frontend architect managing state containers and loading systems.',
        },
      ];
      return getSimulatedData<CandidateExperience[]>(`kth_experience_${candidateId}`, defaultExp);
    }
  },

  upsertExperience: async (exp: Omit<CandidateExperience, 'id'> & { id?: string }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('candidate_experience').upsert(exp);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getExperience(exp.candidate_id);
      if (exp.id) {
        // Update
        const updated = current.map((e) => (e.id === exp.id ? { ...e, ...exp } : e));
        setSimulatedData(`kth_experience_${exp.candidate_id}`, updated);
      } else {
        // Create
        const newExp: CandidateExperience = {
          id: `exp_${Math.random().toString(36).substring(2, 9)}`,
          ...exp,
        } as CandidateExperience;
        setSimulatedData(`kth_experience_${exp.candidate_id}`, [newExp, ...current]);
      }
      return true;
    }
  },

  deleteExperience: async (candidateId: string, expId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_experience')
        .delete()
        .eq('id', expId);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getExperience(candidateId);
      setSimulatedData(`kth_experience_${candidateId}`, current.filter((e) => e.id !== expId));
      return true;
    }
  },

  // EDUCATION API
  getEducation: async (candidateId: string): Promise<CandidateEducation[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as CandidateEducation[];
    } else {
      const defaultEdu: CandidateEducation[] = [
        {
          id: 'edu-1',
          candidate_id: candidateId,
          institution: 'State University',
          degree: 'Bachelors of Science',
          field_of_study: 'Computer Science',
          start_date: '2016-09-01',
          end_date: '2020-05-20',
          description: 'Specialized in Software Engineering paradigms.',
        },
      ];
      return getSimulatedData<CandidateEducation[]>(`kth_education_${candidateId}`, defaultEdu);
    }
  },

  upsertEducation: async (edu: Omit<CandidateEducation, 'id'> & { id?: string }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('candidate_education').upsert(edu);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getEducation(edu.candidate_id);
      if (edu.id) {
        // Update
        const updated = current.map((e) => (e.id === edu.id ? { ...e, ...edu } : e));
        setSimulatedData(`kth_education_${edu.candidate_id}`, updated);
      } else {
        // Create
        const newEdu: CandidateEducation = {
          id: `edu_${Math.random().toString(36).substring(2, 9)}`,
          ...edu,
        } as CandidateEducation;
        setSimulatedData(`kth_education_${edu.candidate_id}`, [newEdu, ...current]);
      }
      return true;
    }
  },

  deleteEducation: async (candidateId: string, eduId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_education')
        .delete()
        .eq('id', eduId);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getEducation(candidateId);
      setSimulatedData(`kth_education_${candidateId}`, current.filter((e) => e.id !== eduId));
      return true;
    }
  },

  // CERTIFICATIONS API
  getCertifications: async (candidateId: string): Promise<CandidateCertification[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('candidate_certifications')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('issue_date', { ascending: false });
      if (error) throw error;
      return data as CandidateCertification[];
    } else {
      const defaultCert: CandidateCertification[] = [
        {
          id: 'cert-1',
          candidate_id: candidateId,
          name: 'Certified React Professional',
          issuing_organization: 'Frontend Institute',
          issue_date: '2024-02-15',
          expiration_date: '2026-02-15',
          credential_id: 'CRP-99238',
          credential_url: 'https://verify.frontendinstitute.org/certs/99238',
        },
      ];
      return getSimulatedData<CandidateCertification[]>(`kth_certifications_${candidateId}`, defaultCert);
    }
  },

  upsertCertification: async (cert: Omit<CandidateCertification, 'id'> & { id?: string }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('candidate_certifications').upsert(cert);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getCertifications(cert.candidate_id);
      if (cert.id) {
        // Update
        const updated = current.map((c) => (c.id === cert.id ? { ...c, ...cert } : c));
        setSimulatedData(`kth_certifications_${cert.candidate_id}`, updated);
      } else {
        // Create
        const newCert: CandidateCertification = {
          id: `cert_${Math.random().toString(36).substring(2, 9)}`,
          ...cert,
        } as CandidateCertification;
        setSimulatedData(`kth_certifications_${cert.candidate_id}`, [newCert, ...current]);
      }
      return true;
    }
  },

  deleteCertification: async (candidateId: string, certId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_certifications')
        .delete()
        .eq('id', certId);
      if (error) throw error;
      return true;
    } else {
      const current = await candidateService.getCertifications(candidateId);
      setSimulatedData(`kth_certifications_${candidateId}`, current.filter((c) => c.id !== certId));
      return true;
    }
  },
};
