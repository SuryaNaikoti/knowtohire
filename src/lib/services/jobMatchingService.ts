import { supabase } from '../supabase';

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  gap_analysis?: string;
  created_at: string;
  job?: any;
}

export const jobMatchingService = {
  async getMatches(): Promise<JobMatch[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('ai_job_matches')
      .select('*, job:jobs(*)')
      .eq('user_id', userData.user.id)
      .order('match_percentage', { ascending: false });

    if (error) throw error;
    return data as JobMatch[];
  },

  async calculateMatch(jobId: string): Promise<JobMatch> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Unauthorized');

    // Simulate semantic AI matching matching metrics
    const match_percentage = Math.floor(Math.random() * 30) + 70; // 70% - 100%
    const matched_skills = ['React', 'TypeScript', 'TailwindCSS', 'PostgreSQL'];
    const missing_skills = ['CI/CD pipelines', 'Docker containerization'];
    const gap_analysis = 'This role heavily stresses CI/CD integration. We recommend completing the "GitHub Actions Deployments" resource guide to fill this gap.';

    // Check if match already exists
    const { data: existing } = await supabase
      .from('ai_job_matches')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('job_id', jobId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('ai_job_matches')
        .update({ match_percentage, matched_skills, missing_skills, gap_analysis })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as JobMatch;
    }

    const { data, error } = await supabase
      .from('ai_job_matches')
      .insert({
        user_id: userData.user.id,
        job_id: jobId,
        match_percentage,
        matched_skills,
        missing_skills,
        gap_analysis
      })
      .select()
      .single();

    if (error) throw error;
    return data as JobMatch;
  }
};
