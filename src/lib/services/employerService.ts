import { supabase, isSupabaseConfigured } from '../supabase';

import type {
  EmployerProfile,
  Company,
  CompanyLocation,
  CompanyTeamMember,
} from '../../types/employer.types';

export type {
  EmployerProfile,
  Company,
  CompanyLocation,
  CompanyTeamMember,
};

// Local Storage helpers
const getSimulatedData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setSimulatedData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const employerService = {
  // EMPLOYER PROFILES
  getEmployerProfile: async (employerId: string): Promise<EmployerProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('id', employerId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('[SUPABASE GET EMPLOYER PROFILE ERROR]', error);
        throw error;
      }
      return data as EmployerProfile;
    } else {
      const defaultProfile: EmployerProfile = {
        id: employerId,
        first_name: 'Sarah',
        last_name: 'Vance',
        job_title: 'Talent Acquisition Director',
        phone_number: '+1 (555) 019-2834',
      };
      return getSimulatedData<EmployerProfile>(`kth_employer_profile_${employerId}`, defaultProfile);
    }
  },

  updateEmployerProfile: async (employerId: string, profile: Partial<EmployerProfile>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('employer_profiles')
        .upsert({ id: employerId, ...profile, updated_at: new Date().toISOString() });
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getEmployerProfile(employerId) || { id: employerId } as EmployerProfile;
      const updated = { ...current, ...profile };
      setSimulatedData(`kth_employer_profile_${employerId}`, updated);
      return true;
    }
  },

  // COMPANIES API
  getCompany: async (companyId: string): Promise<Company | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Company;
    } else {
      const defaultCompany: Company = {
        id: companyId,
        name: 'InnoTech Solutions',
        logo_url: '',
        banner_url: '',
        company_email: 'recruiting@innotech.com',
        linkedin_url: 'https://linkedin.com/company/innotech-solutions',
        website_url: 'https://innotech.com',
        industry: 'Software Engineering & Cloud Solutions',
        company_size: '50-249 Employees',
        description: 'Building modern cloud infrastructure and next-generation SaaS architectures.',
        verification_status: 'verified',
      };
      return getSimulatedData<Company>(`kth_company_${companyId}`, defaultCompany);
    }
  },

  getCompanyByEmployer: async (employerId: string): Promise<Company | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('company_team_members')
        .select('company_id')
        .eq('employer_id', employerId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return employerService.getCompany(data.company_id);
    } else {
      // In local simulation, everyone belongs to company 'comp-1'
      return employerService.getCompany('comp-1');
    }
  },

  updateCompany: async (companyId: string, company: Partial<Company>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('companies')
        .upsert({ id: companyId, ...company, updated_at: new Date().toISOString() });
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getCompany(companyId) || { id: companyId } as Company;
      const updated = { ...current, ...company };
      setSimulatedData(`kth_company_${companyId}`, updated);
      return true;
    }
  },

  // UPLOADS
  uploadLogo: async (companyId: string, file: File): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${companyId}/logo-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error } = await supabase.storage.from('logos').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
      await employerService.updateCompany(companyId, { logo_url: data.publicUrl });
      return data.publicUrl;
    } else {
      await new Promise(r => setTimeout(r, 800));
      const mockUrl = `https://mockstorage.knowtohire.com/logos/${companyId}/${file.name}`;
      await employerService.updateCompany(companyId, { logo_url: mockUrl });
      return mockUrl;
    }
  },

  uploadBanner: async (companyId: string, file: File): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${companyId}/banner-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error } = await supabase.storage.from('logos').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
      await employerService.updateCompany(companyId, { banner_url: data.publicUrl });
      return data.publicUrl;
    } else {
      await new Promise(r => setTimeout(r, 800));
      const mockUrl = `https://mockstorage.knowtohire.com/banners/${companyId}/${file.name}`;
      await employerService.updateCompany(companyId, { banner_url: mockUrl });
      return mockUrl;
    }
  },

  // LOCATIONS
  getLocations: async (companyId: string): Promise<CompanyLocation[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('company_locations')
        .select('*')
        .eq('company_id', companyId)
        .order('is_headquarters', { ascending: false });
      if (error) throw error;
      return data as CompanyLocation[];
    } else {
      const defaultLocs: CompanyLocation[] = [
        {
          id: 'loc-1',
          company_id: companyId,
          address: '100 Innovation Way, Suite 400',
          city: 'San Francisco',
          state_province: 'CA',
          country: 'USA',
          postal_code: '94105',
          is_headquarters: true,
        },
      ];
      return getSimulatedData<CompanyLocation[]>(`kth_locations_${companyId}`, defaultLocs);
    }
  },

  upsertLocation: async (location: Omit<CompanyLocation, 'id'> & { id?: string }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      // If setting as headquarters, we must clear other headquarters flags first
      if (location.is_headquarters) {
        await supabase
          .from('company_locations')
          .update({ is_headquarters: false })
          .eq('company_id', location.company_id);
      }
      const { error } = await supabase.from('company_locations').upsert(location);
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getLocations(location.company_id);
      let updated = [...current];

      if (location.is_headquarters) {
        updated = updated.map(l => ({ ...l, is_headquarters: false }));
      }

      if (location.id) {
        updated = updated.map(l => l.id === location.id ? { ...l, ...location } : l);
      } else {
        const newLoc: CompanyLocation = {
          id: `loc_${Math.random().toString(36).substring(2, 9)}`,
          ...location,
        } as CompanyLocation;
        updated.unshift(newLoc);
      }
      setSimulatedData(`kth_locations_${location.company_id}`, updated);
      return true;
    }
  },

  deleteLocation: async (companyId: string, locationId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('company_locations')
        .delete()
        .eq('id', locationId);
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getLocations(companyId);
      setSimulatedData(`kth_locations_${companyId}`, current.filter(l => l.id !== locationId));
      return true;
    }
  },

  // TEAM MEMBERS
  getTeamMembers: async (companyId: string): Promise<CompanyTeamMember[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('company_team_members')
        .select(`
          id,
          company_id,
          employer_id,
          member_role,
          created_at,
          employer_profiles (
            first_name,
            last_name,
            job_title
          )
        `)
        .eq('company_id', companyId);
      if (error) throw error;
      
      return data.map((d: any) => ({
        id: d.id,
        company_id: d.company_id,
        employer_id: d.employer_id,
        member_role: d.member_role,
        first_name: d.employer_profiles?.first_name || 'N/A',
        last_name: d.employer_profiles?.last_name || 'N/A',
        job_title: d.employer_profiles?.job_title || 'N/A',
        created_at: d.created_at,
      }));
    } else {
      const defaultTeam: CompanyTeamMember[] = [
        {
          id: 'tm-1',
          company_id: companyId,
          employer_id: 'emp-1',
          member_role: 'Admin',
          first_name: 'Sarah',
          last_name: 'Vance',
          job_title: 'Talent Acquisition Director',
        },
        {
          id: 'tm-2',
          company_id: companyId,
          employer_id: 'emp-2',
          member_role: 'Recruiter',
          first_name: 'Michael',
          last_name: 'Choi',
          job_title: 'Technical Recruiter',
        },
      ];
      return getSimulatedData<CompanyTeamMember[]>(`kth_team_${companyId}`, defaultTeam);
    }
  },

  addTeamMember: async (member: Omit<CompanyTeamMember, 'id'>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('company_team_members').insert(member);
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getTeamMembers(member.company_id);
      const newMember: CompanyTeamMember = {
        id: `tm_${Math.random().toString(36).substring(2, 9)}`,
        ...member,
      };
      setSimulatedData(`kth_team_${member.company_id}`, [...current, newMember]);
      return true;
    }
  },

  updateTeamMemberRole: async (companyId: string, memberId: string, role: 'Admin' | 'Recruiter' | 'Viewer'): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('company_team_members')
        .update({ member_role: role })
        .eq('id', memberId);
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getTeamMembers(companyId);
      const updated = current.map(m => m.id === memberId ? { ...m, member_role: role } : m);
      setSimulatedData(`kth_team_${companyId}`, updated);
      return true;
    }
  },

  deleteTeamMember: async (companyId: string, memberId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('company_team_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      return true;
    } else {
      const current = await employerService.getTeamMembers(companyId);
      setSimulatedData(`kth_team_${companyId}`, current.filter(m => m.id !== memberId));
      return true;
    }
  },
};
