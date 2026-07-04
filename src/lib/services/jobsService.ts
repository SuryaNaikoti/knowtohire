import { supabase, isSupabaseConfigured } from '../supabase';

import type {
  JobCategory,
  Job,
  JobSkill,
  SavedJob,
  JobFilter,
  JobPayload,
  JobSkillPayload,
} from '../../types/job.types';

export type {
  JobCategory,
  Job,
  JobSkill,
  SavedJob,
  JobFilter,
  JobPayload,
  JobSkillPayload,
};

// Local Storage helpers
const getSimulatedData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setSimulatedData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed Local Storage Categories
const seedCategories = (): JobCategory[] => {
  const defaultCategories: JobCategory[] = [
    {
      id: 'cat-tech',
      name: 'Technology & Engineering',
      slug: 'technology-engineering',
      description: 'Software, data, systems, and product engineering.',
      parent_category_id: null
    },
    {
      id: 'cat-legal',
      name: 'Legal & Intellectual Property',
      slug: 'legal-ip',
      description: 'Patent, copyright, licensing, and legal consulting.',
      parent_category_id: null
    },
    {
      id: 'cat-sust',
      name: 'Sustainability & Environmental',
      slug: 'sustainability-environmental',
      description: 'ESG, climate tech, ecology, and sustainability initiatives.',
      parent_category_id: null
    },
    {
      id: 'cat-dev',
      name: 'Software Development',
      slug: 'software-development',
      description: 'Frontend, backend, and fullstack positions.',
      parent_category_id: 'cat-tech'
    },
    {
      id: 'cat-patent',
      name: 'Patent Engineering',
      slug: 'patent-engineering',
      description: 'Intellectual property and patent writing roles.',
      parent_category_id: 'cat-legal'
    },
    {
      id: 'cat-esg',
      name: 'ESG Strategy',
      slug: 'esg-strategy',
      description: 'Corporate social responsibility and ESG reporting.',
      parent_category_id: 'cat-sust'
    }
  ];
  return getSimulatedData<JobCategory[]>('kth_job_categories', defaultCategories);
};

// Seed Local Storage Jobs
const seedJobs = (): Job[] => {
  const defaultJobs: Job[] = [
    {
      id: 'job-1',
      company_id: 'comp-1',
      employer_id: 'emp-1',
      category_id: 'cat-dev',
      title: 'Senior Frontend Engineer',
      slug: 'senior-frontend-engineer-j831d',
      description: 'We are seeking a talented Senior Frontend Engineer to build robust React web interfaces. You will work on next-generation career intelligence systems.',
      requirements: '- 5+ years of experience in React and TypeScript\n- Knowledge of Tailwind CSS and web performance optimization\n- Experience building accessible layouts (WCAG 2.2)',
      benefits: '- Premium healthcare insurance\n- 401(k) retirement matching\n- Remote flexible schedules',
      career_domain: 'General',
      location_type: 'Remote',
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      employment_type: 'Full-time',
      salary_min: 135000,
      salary_max: 175000,
      salary_currency: 'USD',
      salary_visible: true,
      status: 'published',
      is_featured: true,
      featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      approval_status: 'approved',
      moderator_notes: 'Valid, approved posting.',
      view_count: 342,
      application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'job-2',
      company_id: 'comp-1',
      employer_id: 'emp-2',
      category_id: 'cat-patent',
      title: 'Intellectual Property & Patent Counsel',
      slug: 'ip-patent-counsel-a721c',
      description: 'We are looking for an experienced Patent Attorney or Patent Agent with a background in engineering or computing to manage our expanding IP portfolio.',
      requirements: '- Registered with the USPTO\n- Degree in Electrical Engineering, Computer Science or equivalent\n- 3+ years drafting software or hardware patent applications',
      benefits: '- Generous research and education stipend\n- Dental and vision plans\n- Profit sharing options',
      career_domain: 'Patent',
      location_type: 'Hybrid',
      country: 'United States',
      state: 'New York',
      city: 'New York City',
      employment_type: 'Full-time',
      salary_min: 150000,
      salary_max: 210000,
      salary_currency: 'USD',
      salary_visible: true,
      status: 'published',
      is_featured: false,
      featured_until: null,
      approval_status: 'approved',
      moderator_notes: 'Approved.',
      view_count: 120,
      application_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'job-3',
      company_id: 'comp-1',
      employer_id: 'emp-1',
      category_id: 'cat-esg',
      title: 'Lead ESG Reporting Analyst',
      slug: 'lead-esg-analyst-d902e',
      description: 'Help organizations measure, document, and present their ESG and sustainability initiatives. You will develop carbon accounts and supply chain sustainability reports.',
      requirements: '- 4+ years in Sustainability / Corporate Social Responsibility\n- Familiarity with GRI, SASB, and TCFD framework guidelines\n- strong data analysis and spreadsheet auditing skills',
      benefits: '- Green transport subsidy\n- Flexible work arrangements\n- Health and fitness allowances',
      career_domain: 'ESG',
      location_type: 'Remote',
      country: 'Canada',
      state: 'Ontario',
      city: 'Toronto',
      employment_type: 'Contract',
      salary_min: 90000,
      salary_max: 120000,
      salary_currency: 'CAD',
      salary_visible: false,
      status: 'published',
      is_featured: false,
      featured_until: null,
      approval_status: 'approved',
      moderator_notes: 'Approved.',
      view_count: 85,
      application_deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  return getSimulatedData<Job[]>('kth_jobs', defaultJobs);
};

// Seed Local Storage Job Skills
const seedJobSkills = (): JobSkill[] => {
  const defaultSkills: JobSkill[] = [
    { id: 'js-1', job_id: 'job-1', skill_name: 'React', required_level: 'Expert', years_experience_required: 4 },
    { id: 'js-2', job_id: 'job-1', skill_name: 'TypeScript', required_level: 'Intermediate', years_experience_required: 3 },
    { id: 'js-3', job_id: 'job-2', skill_name: 'USPTO filings', required_level: 'Expert', years_experience_required: 3 },
    { id: 'js-4', job_id: 'job-3', skill_name: 'ESG standards', required_level: 'Intermediate', years_experience_required: 2 }
  ];
  return getSimulatedData<JobSkill[]>('kth_job_skills', defaultSkills);
};

export const jobsService = {
  // CATEGORIES
  getJobCategories: async (): Promise<JobCategory[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as JobCategory[];
    } else {
      return seedCategories();
    }
  },

  // CANDIDATE: JOBS VIEW & FILTERS
  getPublishedJobs: async (filters?: JobFilter): Promise<Job[]> => {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .eq('status', 'published')
        .eq('approval_status', 'approved');
      
      // Apply Date Expirations
      const nowStr = new Date().toISOString();
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Apply Filters
      if (filters) {
        if (filters.locationType && filters.locationType.length > 0) {
          query = query.in('location_type', filters.locationType);
        }
        if (filters.employmentType && filters.employmentType.length > 0) {
          query = query.in('employment_type', filters.employmentType);
        }
        if (filters.categoryId) {
          // If category filter is passed, we check if it is a parent category
          const { data: subCats } = await supabase
            .from('job_categories')
            .select('id')
            .eq('parent_category_id', filters.categoryId);
          const ids = [filters.categoryId, ...(subCats || []).map(sc => sc.id)];
          query = query.in('category_id', ids);
        }
        if (filters.careerDomain && filters.careerDomain.length > 0) {
          query = query.in('career_domain', filters.careerDomain);
        }
        if (filters.minSalary) {
          query = query.gte('salary_max', filters.minSalary);
        }
        if (filters.salaryVisible !== undefined) {
          query = query.eq('salary_visible', filters.salaryVisible);
        }
        if (filters.country) {
          query = query.ilike('country', `%${filters.country}%`);
        }
        if (filters.state) {
          query = query.ilike('state', `%${filters.state}%`);
        }
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      // Filter out past deadline/expired on client side for robustness
      const filtered = (data || []).filter((j: any) => {
        if (j.application_deadline && j.application_deadline < todayStr) return false;
        if (j.expires_at && j.expires_at < nowStr) return false;
        return true;
      });

      return filtered.map((d: any) => ({
        ...d,
        company_name: d.companies?.name || 'InnoTech Solutions',
        company_logo: d.companies?.logo_url || ''
      })) as Job[];
    } else {
      const allJobs = seedJobs();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const nowStr = now.toISOString();

      let filtered = allJobs.filter(j => 
        j.status === 'published' && 
        j.approval_status === 'approved' &&
        (!j.application_deadline || j.application_deadline >= todayStr) &&
        (!j.expires_at || j.expires_at >= nowStr)
      );

      if (filters) {
        if (filters.locationType && filters.locationType.length > 0) {
          filtered = filtered.filter(j => filters.locationType!.includes(j.location_type));
        }
        if (filters.employmentType && filters.employmentType.length > 0) {
          filtered = filtered.filter(j => filters.employmentType!.includes(j.employment_type));
        }
        if (filters.categoryId) {
          const cats = seedCategories();
          const targetIds = [filters.categoryId, ...cats.filter(c => c.parent_category_id === filters.categoryId).map(c => c.id)];
          filtered = filtered.filter(j => j.category_id && targetIds.includes(j.category_id));
        }
        if (filters.careerDomain && filters.careerDomain.length > 0) {
          filtered = filtered.filter(j => filters.careerDomain!.includes(j.career_domain));
        }
        if (filters.minSalary) {
          filtered = filtered.filter(j => (j.salary_max || 0) >= filters.minSalary!);
        }
        if (filters.salaryVisible !== undefined) {
          filtered = filtered.filter(j => j.salary_visible === filters.salaryVisible);
        }
        if (filters.country) {
          filtered = filtered.filter(j => j.country.toLowerCase().includes(filters.country!.toLowerCase()));
        }
        if (filters.state) {
          filtered = filtered.filter(j => j.state && j.state.toLowerCase().includes(filters.state!.toLowerCase()));
        }
        if (filters.city) {
          filtered = filtered.filter(j => j.city.toLowerCase().includes(filters.city!.toLowerCase()));
        }
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(j => 
            j.title.toLowerCase().includes(q) || 
            j.description.toLowerCase().includes(q) ||
            j.slug.toLowerCase().includes(q)
          );
        }
      }

      // Hydrate Mock Companies
      const mockComp = getSimulatedData<any>('kth_company_comp-1', {
        name: 'InnoTech Solutions',
        logo_url: ''
      });

      return filtered.map(j => ({
        ...j,
        company_name: mockComp.name,
        company_logo: mockComp.logo_url
      }));
    }
  },

  getJobDetails: async (jobIdOrSlug: string): Promise<{ job: Job; skills: JobSkill[] } | null> => {
    if (isSupabaseConfigured && supabase) {
      // Check if parameter is UUID or slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobIdOrSlug);
      const selector = isUuid ? 'id' : 'slug';
      
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .eq(selector, jobIdOrSlug)
        .single();
      
      if (jobError) {
        if (jobError.code === 'PGRST116') return null;
        throw jobError;
      }
      
      const { data: skillsData, error: skillsError } = await supabase
        .from('job_skills')
        .select('*')
        .eq('job_id', jobData.id);
      
      if (skillsError) throw skillsError;

      const job: Job = {
        ...jobData,
        company_name: jobData.companies?.name || 'InnoTech Solutions',
        company_logo: jobData.companies?.logo_url || ''
      };

      return {
        job,
        skills: skillsData as JobSkill[]
      };
    } else {
      const allJobs = seedJobs();
      const allSkills = seedJobSkills();
      const job = allJobs.find(j => j.id === jobIdOrSlug || j.slug === jobIdOrSlug);
      
      if (!job) return null;
      
      const skills = allSkills.filter(s => s.job_id === job.id);
      
      const mockComp = getSimulatedData<any>('kth_company_comp-1', {
        name: 'InnoTech Solutions',
        logo_url: ''
      });
      
      return {
        job: { ...job, company_name: mockComp.name, company_logo: mockComp.logo_url },
        skills
      };
    }
  },

  incrementViewCount: async (jobId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.rpc('increment_job_view', { job_id: jobId });
      if (error) {
        // Fallback update in case RPC is missing in local supabase
        const { data: current } = await supabase.from('jobs').select('view_count').eq('id', jobId).single();
        const views = (current?.view_count || 0) + 1;
        await supabase.from('jobs').update({ view_count: views }).eq('id', jobId);
      }
      return true;
    } else {
      const allJobs = seedJobs();
      const updated = allJobs.map(j => j.id === jobId ? { ...j, view_count: j.view_count + 1 } : j);
      setSimulatedData('kth_jobs', updated);
      return true;
    }
  },

  // BOOKMARKS / SAVED JOBS
  getSavedJobs: async (candidateId: string): Promise<Job[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*, jobs(*, companies(name, logo_url))')
        .eq('candidate_id', candidateId);
      if (error) throw error;
      
      return data.map((d: any) => ({
        ...d.jobs,
        company_name: d.jobs?.companies?.name || 'InnoTech Solutions',
        company_logo: d.jobs?.companies?.logo_url || ''
      })).filter(Boolean) as Job[];
    } else {
      const saved = getSimulatedData<SavedJob[]>('kth_saved_jobs', []);
      const allJobs = seedJobs();
      const candidateSaves = saved.filter(s => s.candidate_id === candidateId);
      const jobs = candidateSaves.map(s => allJobs.find(j => j.id === s.job_id)).filter(Boolean) as Job[];

      const mockComp = getSimulatedData<any>('kth_company_comp-1', {
        name: 'InnoTech Solutions',
        logo_url: ''
      });
      return jobs.map(j => ({
        ...j,
        company_name: mockComp.name,
        company_logo: mockComp.logo_url
      }));
    }
  },

  toggleSaveJob: async (candidateId: string, jobId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .single();
      
      if (existing) {
        const { error } = await supabase.from('saved_jobs').delete().eq('id', existing.id);
        if (error) throw error;
        return false; // Not saved anymore
      } else {
        const { error } = await supabase.from('saved_jobs').insert({ candidate_id: candidateId, job_id: jobId });
        if (error) throw error;
        return true; // Bookmarked
      }
    } else {
      const saved = getSimulatedData<SavedJob[]>('kth_saved_jobs', []);
      const idx = saved.findIndex(s => s.candidate_id === candidateId && s.job_id === jobId);
      if (idx > -1) {
        saved.splice(idx, 1);
        setSimulatedData('kth_saved_jobs', saved);
        return false;
      } else {
        saved.push({
          id: `save_${Math.random().toString(36).substring(2, 9)}`,
          candidate_id: candidateId,
          job_id: jobId
        });
        setSimulatedData('kth_saved_jobs', saved);
        return true;
      }
    }
  },

  // EMPLOYER: JOB MANAGEMENT
  getCompanyJobs: async (companyId: string): Promise<Job[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((d: any) => ({
        ...d,
        company_name: d.companies?.name || '',
        company_logo: d.companies?.logo_url || ''
      })) as Job[];
    } else {
      const allJobs = seedJobs();
      const filtered = allJobs.filter(j => j.company_id === companyId);
      const mockComp = getSimulatedData<any>(`kth_company_${companyId}`, { name: 'InnoTech Solutions', logo_url: '' });
      return filtered.map(j => ({
        ...j,
        company_name: mockComp.name,
        company_logo: mockComp.logo_url
      }));
    }
  },

  createJob: async (job: JobPayload, skills: JobSkillPayload[]): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
      // Find company id and employer id from team member link
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('company_id')
        .eq('employer_id', user.user.id)
        .single();
      
      if (!teamMember) throw new Error('No linked company found');

      const jobRecord = {
        ...job,
        company_id: teamMember.company_id,
        employer_id: user.user.id,
        approval_status: 'pending',
        view_count: 0
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobRecord)
        .select('id')
        .single();
      
      if (error) throw error;
      const jobId = data.id;

      if (skills.length > 0) {
        const skillRecords = skills.map(s => ({
          job_id: jobId,
          skill_name: s.skill_name,
          required_level: s.required_level,
          years_experience_required: s.years_experience_required
        }));
        const { error: skillError } = await supabase.from('job_skills').insert(skillRecords);
        if (skillError) throw skillError;
      }

      return jobId;
    } else {
      const allJobs = seedJobs();
      const allSkills = seedJobSkills();
      const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;

      const newJob: Job = {
        id: jobId,
        company_id: 'comp-1',
        employer_id: 'emp-1',
        category_id: job.category_id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits || null,
        career_domain: job.career_domain,
        location_type: job.location_type,
        country: job.country,
        state: job.state || null,
        city: job.city,
        employment_type: job.employment_type,
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
        salary_currency: job.salary_currency,
        salary_visible: job.salary_visible,
        status: job.status as any,
        is_featured: false,
        featured_until: null,
        approval_status: 'pending',
        moderator_notes: null,
        view_count: 0,
        application_deadline: job.application_deadline || null,
        expires_at: job.expires_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      allJobs.unshift(newJob);
      setSimulatedData('kth_jobs', allJobs);

      if (skills.length > 0) {
        const newSkills = skills.map(s => ({
          id: `js_${Math.random().toString(36).substring(2, 9)}`,
          job_id: jobId,
          skill_name: s.skill_name,
          required_level: s.required_level,
          years_experience_required: s.years_experience_required
        }));
        setSimulatedData('kth_job_skills', [...allSkills, ...newSkills]);
      }

      return jobId;
    }
  },

  updateJob: async (jobId: string, job: Partial<JobPayload>, skills?: JobSkillPayload[]): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('jobs')
        .update({ ...job, updated_at: new Date().toISOString() })
        .eq('id', jobId);
      if (error) throw error;

      if (skills !== undefined) {
        // Delete all old skills and insert new ones
        await supabase.from('job_skills').delete().eq('job_id', jobId);
        if (skills.length > 0) {
          const skillRecords = skills.map(s => ({
            job_id: jobId,
            skill_name: s.skill_name,
            required_level: s.required_level,
            years_experience_required: s.years_experience_required
          }));
          const { error: skillError } = await supabase.from('job_skills').insert(skillRecords);
          if (skillError) throw skillError;
        }
      }
      return true;
    } else {
      const allJobs = seedJobs();
      const allSkills = seedJobSkills();

      const jobIdx = allJobs.findIndex(j => j.id === jobId);
      if (jobIdx === -1) return false;

      allJobs[jobIdx] = {
        ...allJobs[jobIdx],
        ...job,
        updated_at: new Date().toISOString()
      } as Job;

      setSimulatedData('kth_jobs', allJobs);

      if (skills !== undefined) {
        const remainingSkills = allSkills.filter(s => s.job_id !== jobId);
        const newSkills = skills.map(s => ({
          id: `js_${Math.random().toString(36).substring(2, 9)}`,
          job_id: jobId,
          skill_name: s.skill_name,
          required_level: s.required_level,
          years_experience_required: s.years_experience_required
        }));
        setSimulatedData('kth_job_skills', [...remainingSkills, ...newSkills]);
      }

      return true;
    }
  },

  deleteJob: async (jobId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      return true;
    } else {
      const allJobs = seedJobs();
      const allSkills = seedJobSkills();
      setSimulatedData('kth_jobs', allJobs.filter(j => j.id !== jobId));
      setSimulatedData('kth_job_skills', allSkills.filter(s => s.job_id !== jobId));
      return true;
    }
  },

  // ADMIN: MODERATION WORKFLOW
  getPendingApprovalJobs: async (): Promise<Job[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return data.map((d: any) => ({
        ...d,
        company_name: d.companies?.name || '',
        company_logo: d.companies?.logo_url || ''
      })) as Job[];
    } else {
      const allJobs = seedJobs();
      const pending = allJobs.filter(j => j.approval_status === 'pending');
      const mockComp = getSimulatedData<any>('kth_company_comp-1', { name: 'InnoTech Solutions', logo_url: '' });
      return pending.map(j => ({
        ...j,
        company_name: mockComp.name,
        company_logo: mockComp.logo_url
      }));
    }
  },

  moderateJob: async (jobId: string, status: 'approved' | 'rejected', notes?: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('jobs')
        .update({
          approval_status: status,
          moderator_notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (error) throw error;
      return true;
    } else {
      const allJobs = seedJobs();
      const updated = allJobs.map(j => j.id === jobId ? {
        ...j,
        approval_status: status,
        moderator_notes: notes || null,
        updated_at: new Date().toISOString()
      } : j);
      setSimulatedData('kth_jobs', updated);
      return true;
    }
  },

  toggleFeatureJob: async (jobId: string, isFeatured: boolean, featuredUntil?: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('jobs')
        .update({
          is_featured: isFeatured,
          featured_until: isFeatured ? (featuredUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (error) throw error;
      return true;
    } else {
      const allJobs = seedJobs();
      const updated = allJobs.map(j => j.id === jobId ? {
        ...j,
        is_featured: isFeatured,
        featured_until: isFeatured ? (featuredUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) : null,
        updated_at: new Date().toISOString()
      } : j);
      setSimulatedData('kth_jobs', updated);
      return true;
    }
  }
};
