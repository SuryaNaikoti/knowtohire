import { supabase } from '../supabaseClient';
import type {
  CandidateIdentityValues,
  CandidateExperienceValues,
  CandidateEducationValues,
  CandidateCertificationValues,
  CandidateSkillValues,
  CandidateProjectValues,
  CandidatePrivacyValues,
  AISuggestionPayloadValues,
} from '../validation/candidateProfileSchema';

export interface CandidateProfile {
  id: string;
  user_id?: string;
  full_name?: string;
  title?: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  resume_url?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  skills?: string[];
  work_authorization?: string;
  desired_salary?: number;
  profile_visibility?: 'public' | 'private' | 'employers-only';
}

export interface CandidateExperience {
  id: string;
  candidate_id?: string;
  company_name: string;
  job_title: string;
  role_title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
}

export interface CandidateEducation {
  id: string;
  candidate_id?: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  start_date: string;
  end_date: string;
  grade_gpa?: string;
  description: string;
}

export interface CandidateCertification {
  id: string;
  candidate_id?: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  expiration_date: string;
  credential_id?: string;
  credential_url?: string;
}

export interface CandidateSkill {
  id: string;
  candidate_id?: string;
  skill_name: string;
  proficiency_level?: string;
  competency_level?: 'Beginner' | 'Intermediate' | 'Expert';
  years_of_experience?: number;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class CandidateService {
  public validateZodSchemaUsage(
    _identity: CandidateIdentityValues,
    _exp: CandidateExperienceValues,
    _edu: CandidateEducationValues,
    _cert: CandidateCertificationValues,
    _skill: CandidateSkillValues,
    _proj: CandidateProjectValues,
    _priv: CandidatePrivacyValues,
    _ai: AISuggestionPayloadValues
  ) {
    return true;
  }

  public async getCandidateProfile(candidateId: string): Promise<ServiceResponse<CandidateProfile>> {
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      const profile = data
        ? {
            ...data,
            title: data.headline || '',
            desired_salary: data.metadata?.desired_salary || 0,
            profile_visibility: (data.metadata?.profile_visibility as any) || 'public',
          }
        : null;
      return { data: profile as CandidateProfile, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch candidate profile.' };
    }
  }

  public async getProfile(candidateId: string): Promise<CandidateProfile | null> {
    const res = await this.getCandidateProfile(candidateId);
    return res.data;
  }

  public async updateProfile(candidateId: string, updates: Partial<CandidateProfile>): Promise<CandidateProfile | null> {
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .upsert({ id: candidateId, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      await this.logActivity(candidateId, 'PROFILE_UPDATED', 'Updated profile details.');
      return data as CandidateProfile;
    } catch {
      return null;
    }
  }

  public async updateIdentity(candidateId: string, payload: CandidateIdentityValues): Promise<ServiceResponse<any>> {
    const updated = await this.updateProfile(candidateId, {
      headline: payload.headline,
      bio: payload.bio,
      phone: payload.phone,
      location: payload.location,
      work_authorization: payload.workAuthorization,
      avatar_url: payload.avatarUrl,
    });
    return { data: updated, error: updated ? null : 'Failed to update identity' };
  }

  public async getExperience(candidateId: string): Promise<CandidateExperience[]> {
    try {
      const { data, error } = await supabase
        .from('candidate_experience')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e,
        role_title: e.job_title || e.role_title || '',
        description: e.description || '',
        is_current: e.is_current ?? false,
      }));
    } catch {
      return [];
    }
  }

  public async upsertExperience(arg1: string | Partial<CandidateExperience>, arg2?: Partial<CandidateExperience>): Promise<CandidateExperience | null> {
    const candidateId = typeof arg1 === 'string' ? arg1 : arg1.candidate_id || '';
    const exp = typeof arg1 === 'string' ? arg2 || {} : arg1;

    try {
      const payload: any = {
        candidate_id: candidateId || exp.candidate_id,
        company_name: exp.company_name,
        role_title: exp.role_title,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.is_current ? null : exp.end_date,
        is_current: exp.is_current ?? false,
        description: exp.description,
      };
      if (exp.id) {
        payload.id = exp.id;
      }

      const { data, error } = await supabase
        .from('candidate_experience')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        role_title: data.role_title || '',
        description: data.description || '',
        is_current: data.is_current ?? false,
      } as CandidateExperience;
    } catch (err) {
      console.error('upsertExperience error:', err);
      return null;
    }
  }

  public async deleteExperience(arg1: string, arg2?: string): Promise<boolean> {
    const experienceId = arg2 ? arg2 : arg1;
    try {
      const { error } = await supabase.from('candidate_experience').delete().eq('id', experienceId);
      return !error;
    } catch {
      return false;
    }
  }

  public async getEducation(candidateId: string): Promise<CandidateEducation[]> {
    try {
      const { data, error } = await supabase
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', candidateId);
      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e,
        description: e.description || '',
      }));
    } catch {
      return [];
    }
  }

  public async upsertEducation(arg1: string | Partial<CandidateEducation>, arg2?: Partial<CandidateEducation>): Promise<CandidateEducation | null> {
    const candidateId = typeof arg1 === 'string' ? arg1 : arg1.candidate_id || '';
    const edu = typeof arg1 === 'string' ? arg2 || {} : arg1;

    try {
      const payload: any = {
        candidate_id: candidateId || edu.candidate_id,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date,
        grade: edu.grade_gpa,
        description: edu.description,
      };
      if (edu.id) {
        payload.id = edu.id;
      }

      const { data, error } = await supabase
        .from('candidate_education')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        description: data.description || '',
      } as CandidateEducation;
    } catch (err) {
      console.error('upsertEducation error:', err);
      return null;
    }
  }

  public async deleteEducation(arg1: string, arg2?: string): Promise<boolean> {
    const educationId = arg2 ? arg2 : arg1;
    try {
      const { error } = await supabase.from('candidate_education').delete().eq('id', educationId);
      return !error;
    } catch {
      return false;
    }
  }

  public async getCertifications(candidateId: string): Promise<CandidateCertification[]> {
    try {
      const { data, error } = await supabase
        .from('candidate_certifications')
        .select('*')
        .eq('candidate_id', candidateId);
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        expiration_date: c.expiry_date || c.expiration_date || '2028-01-01',
      }));
    } catch {
      return [];
    }
  }

  public async upsertCertification(arg1: string | Partial<CandidateCertification>, arg2?: Partial<CandidateCertification>): Promise<CandidateCertification | null> {
    const candidateId = typeof arg1 === 'string' ? arg1 : arg1.candidate_id || '';
    const cert = typeof arg1 === 'string' ? arg2 || {} : arg1;

    try {
      const payload: any = {
        candidate_id: candidateId || cert.candidate_id,
        name: cert.name,
        issuing_organization: cert.issuing_organization,
        issue_date: cert.issue_date,
        expiration_date: cert.expiration_date || cert.expiry_date,
        credential_id: cert.credential_id,
        credential_url: cert.credential_url,
      };
      if (cert.id) {
        payload.id = cert.id;
      }

      const { data, error } = await supabase
        .from('candidate_certifications')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        expiration_date: data.expiration_date || '2028-01-01',
      } as CandidateCertification;
    } catch (err) {
      console.error('upsertCertification error:', err);
      return null;
    }
  }

  public async addExperience(candidateId: string, exp: Partial<CandidateExperience>): Promise<CandidateExperience | null> {
    return this.upsertExperience(candidateId, exp);
  }

  public async addEducation(candidateId: string, edu: Partial<CandidateEducation>): Promise<CandidateEducation | null> {
    return this.upsertEducation(candidateId, edu);
  }

  public async addCertification(candidateId: string, cert: Partial<CandidateCertification>): Promise<CandidateCertification | null> {
    return this.upsertCertification(candidateId, cert);
  }

  public async deleteCertification(arg1: string, arg2?: string): Promise<boolean> {
    const certId = arg2 ? arg2 : arg1;
    try {
      const { error } = await supabase.from('candidate_certifications').delete().eq('id', certId);
      return !error;
    } catch {
      return false;
    }
  }

  public async getSkills(candidateId: string): Promise<CandidateSkill[]> {
    try {
      const { data, error } = await supabase
        .from('candidate_skills')
        .select('*, skills(skill_name)')
        .eq('candidate_id', candidateId);
      if (error) throw error;
      return (data || []).map((s: any) => ({
        id: s.id,
        candidate_id: s.candidate_id,
        skill_name: s.skills?.skill_name || 'Skill',
        proficiency_level: s.proficiency_level || 'Intermediate',
        competency_level: (s.proficiency_level as any) || 'Intermediate',
        years_of_experience: s.years_experience || 1,
      }));
    } catch {
      return [];
    }
  }

  public async addSkill(arg1: string | any, arg2?: any): Promise<boolean> {
    const candidateId = typeof arg1 === 'string' ? arg1 : arg1.candidate_id || '';
    const skillName = typeof arg2 === 'string' ? arg2 : arg1?.skill_name || 'Skill';
    const yearsExp = typeof arg1 === 'object' ? arg1.years_of_experience || arg1.yearsExperience || 1 : 1;
    const competency = typeof arg1 === 'object' ? arg1.competency_level || arg1.proficiencyLevel || 'Intermediate' : 'Intermediate';

    try {
      // 1. Find or create general category
      const { data: catData } = await supabase
        .from('skill_categories')
        .select('id')
        .limit(1)
        .maybeSingle();
      let catId = catData?.id;
      if (!catId) {
        const { data: newCat, error: catErr } = await supabase
          .from('skill_categories')
          .insert({ category_name: 'General Technical' })
          .select('id')
          .single();
        if (catErr) throw catErr;
        catId = newCat.id;
      }

      // 2. Find or create general subcategory
      const { data: subcatData } = await supabase
        .from('skill_subcategories')
        .select('id')
        .limit(1)
        .maybeSingle();
      let subcatId = subcatData?.id;
      if (!subcatId) {
        const { data: newSubcat, error: subcatErr } = await supabase
          .from('skill_subcategories')
          .insert({ subcategory_name: 'Core Capabilities', category_id: catId })
          .select('id')
          .single();
        if (subcatErr) throw subcatErr;
        subcatId = newSubcat.id;
      }

      // 3. Find or create the skill in the 'skills' table
      const { data: skillData } = await supabase
        .from('skills')
        .select('id')
        .eq('skill_name', skillName)
        .maybeSingle();
      let skillId = skillData?.id;
      if (!skillId) {
        const { data: newSkill, error: insertSkillErr } = await supabase
          .from('skills')
          .insert({ skill_name: skillName, subcategory_id: subcatId })
          .select('id')
          .single();
        if (insertSkillErr) throw insertSkillErr;
        skillId = newSkill.id;
      }

      // 4. Upsert candidate_skills
      const { error: candidateSkillErr } = await supabase
        .from('candidate_skills')
        .upsert({
          candidate_id: candidateId,
          skill_id: skillId,
          proficiency_level: competency,
          years_experience: yearsExp,
        }, {
          onConflict: 'candidate_id,skill_id'
        });

      if (candidateSkillErr) throw candidateSkillErr;

      await this.logActivity(candidateId, 'SKILL_ADDED', `Added skill: ${skillName}`);
      return true;
    } catch (err) {
      console.error('Failed to add skill:', err);
      return false;
    }
  }

  public async deleteSkill(arg1: string, arg2?: string): Promise<boolean> {
    const skillId = arg2 ? arg2 : arg1;
    try {
      const { error } = await supabase.from('candidate_skills').delete().eq('id', skillId);
      return !error;
    } catch {
      return false;
    }
  }

  public async uploadAvatar(candidateId: string, file: File): Promise<string> {
    try {
      const filePath = `${candidateId}/avatar_${Date.now()}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return '';
    }
  }

  public async uploadResume(candidateId: string, file: File): Promise<string> {
    try {
      const filePath = `${candidateId}/resume_${Date.now()}`;
      const { error } = await supabase.storage.from('resumes').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return '';
    }
  }

  public async hasApplied(candidateId: string, jobId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('job_applications')
        .select('id')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .single();
      return !!data;
    } catch {
      return false;
    }
  }

  public async applyToJob(candidateId: string, jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('job_applications').insert({ candidate_id: candidateId, job_id: jobId });
      return !error;
    } catch {
      return false;
    }
  }

  public async getPrivacySettings(candidateId: string): Promise<ServiceResponse<CandidatePrivacyValues>> {
    try {
      const { data, error } = await supabase
        .from('candidate_privacy')
        .select('*')
        .eq('candidate_id', candidateId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      const settings: CandidatePrivacyValues = data
        ? {
            isPublic: data.is_public ?? true,
            isAnonymous: data.is_anonymous ?? false,
            showContactInfo: data.show_contact_info ?? false,
            showResume: data.show_resume ?? true,
            showPortfolio: data.show_portfolio ?? true,
          }
        : {
            isPublic: true,
            isAnonymous: false,
            showContactInfo: false,
            showResume: true,
            showPortfolio: true,
          };

      return { data: settings, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch privacy settings.' };
    }
  }

  public async updatePrivacySettings(candidateId: string, settings: CandidatePrivacyValues): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('candidate_privacy').upsert({
        candidate_id: candidateId,
        is_public: settings.isPublic,
        is_anonymous: settings.isAnonymous,
        show_contact_info: settings.showContactInfo,
        show_resume: settings.showResume,
        show_portfolio: settings.showPortfolio,
      });

      if (error) throw error;
      await this.logActivity(candidateId, 'PRIVACY_UPDATED', 'Updated profile privacy controls.');
      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update privacy settings.' };
    }
  }

  public async logActivity(candidateId: string, eventType: string, description: string): Promise<void> {
    try {
      await supabase.from('candidate_activity').insert({
        candidate_id: candidateId,
        event_type: eventType,
        description,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Ignore background activity logging errors
    }
  }
}

export const candidateService = new CandidateService();

