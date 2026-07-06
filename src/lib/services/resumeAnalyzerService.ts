import { supabase } from '../supabase';

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  score: number;
  parsed_skills: string[];
  missing_keywords: string[];
  improvements: { field: string; suggestion: string }[];
  feedback?: string;
  created_at: string;
}

export const resumeAnalyzerService = {
  async getLatestAnalysis(): Promise<ResumeAnalysis | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('ai_resume_analyses')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as ResumeAnalysis;
  },

  async analyzeResume(_resumeText: string): Promise<ResumeAnalysis> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Unauthorized');

    // Simulate high-fidelity AI resume analysis (OpenAI GPT-4/Claude Mocking)
    const score = Math.floor(Math.random() * 25) + 65; // 65 - 90
    const parsed_skills = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'REST APIs'];
    const missing_keywords = ['CI/CD', 'Docker', 'GraphQL', 'AWS EC2', 'Redis'];
    const improvements = [
      { field: 'Executive Summary', suggestion: 'Quantify achievements (e.g., "managed team of 5 yielding 20% efficiency increase").' },
      { field: 'Experience Section', suggestion: 'Incorporate actionable ATS keywords such as "orchestrated", "refactored", and "spearheaded".' },
      { field: 'Skills Highlight', suggestion: 'Group technical competencies logically into subcategories (Frontend, Backend, Tools).' }
    ];
    const feedback = 'Strong developer profile. Consider highlighting cloud deployment credentials and automated pipelines to optimize recruiter visibility.';

    const { data, error } = await supabase
      .from('ai_resume_analyses')
      .insert({
        user_id: userData.user.id,
        score,
        parsed_skills,
        missing_keywords,
        improvements,
        feedback
      })
      .select()
      .single();

    if (error) throw error;
    return data as ResumeAnalysis;
  }
};
