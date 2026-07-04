import { supabase, isSupabaseConfigured } from '../supabase';

export interface CandidateProject {
  id: string;
  candidate_id: string;
  title: string;
  description?: string;
  tech_stack?: string; // comma-separated
  project_url?: string;
  github_url?: string;
  thumbnail_url?: string;
  start_date?: string;
  end_date?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

const getLocalProjects = (candidateId: string): CandidateProject[] => {
  try {
    const data = localStorage.getItem(`kth_projects_${candidateId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalProjects = (candidateId: string, projects: CandidateProject[]) => {
  localStorage.setItem(`kth_projects_${candidateId}`, JSON.stringify(projects));
};

export const projectsService = {
  getProjects: async (candidateId: string): Promise<CandidateProject[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('candidate_projects')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[projectsService.getProjects error]', error);
        return getLocalProjects(candidateId);
      }
      return data as CandidateProject[];
    }
    return getLocalProjects(candidateId);
  },

  upsertProject: async (project: Omit<CandidateProject, 'id'> & { id?: string }): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('candidate_projects').upsert(project);
      if (error) {
        console.error('[projectsService.upsertProject error]', error);
        throw error;
      }
      return true;
    }
    const current = getLocalProjects(project.candidate_id);
    if (project.id) {
      setLocalProjects(
        project.candidate_id,
        current.map((p) => (p.id === project.id ? { ...p, ...project } as CandidateProject : p))
      );
    } else {
      const newProject: CandidateProject = {
        ...project,
        id: `proj_${Math.random().toString(36).substring(2, 9)}`,
      } as CandidateProject;
      if (newProject.is_featured === undefined) newProject.is_featured = false;
      setLocalProjects(project.candidate_id, [newProject, ...current]);
    }
    return true;
  },

  deleteProject: async (candidateId: string, projectId: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_projects')
        .delete()
        .eq('id', projectId);
      if (error) {
        console.error('[projectsService.deleteProject error]', error);
        throw error;
      }
      return true;
    }
    const current = getLocalProjects(candidateId);
    setLocalProjects(candidateId, current.filter((p) => p.id !== projectId));
    return true;
  },

  toggleFeatured: async (candidateId: string, projectId: string, isFeatured: boolean): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('candidate_projects')
        .update({ is_featured: isFeatured })
        .eq('id', projectId);
      if (error) {
        console.error('[projectsService.toggleFeatured error]', error);
        throw error;
      }
      return true;
    }
    const current = getLocalProjects(candidateId);
    setLocalProjects(
      candidateId,
      current.map((p) => (p.id === projectId ? { ...p, is_featured: isFeatured } : p))
    );
    return true;
  },

  uploadThumbnail: async (candidateId: string, projectId: string, file: File): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${candidateId}/${projectId}.${fileExt}`;
      const { error } = await supabase.storage
        .from('project-thumbnails')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (error) {
        console.error('[projectsService.uploadThumbnail error]', error);
        throw error;
      }
      const { data } = supabase.storage.from('project-thumbnails').getPublicUrl(filePath);
      return data.publicUrl;
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    return `https://placehold.co/400x225/1e293b/94a3b8?text=${encodeURIComponent(file.name)}`;
  },
};
