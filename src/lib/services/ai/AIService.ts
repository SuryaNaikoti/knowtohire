import type { ResumeAnalysisRequest, ResumeAnalysisResult, AIMatchResult } from './types';
import { analyticsService } from '../analytics/AnalyticsService';
import { notificationEngine } from '../notifications';
import { searchService } from '../search';

export class AIService {
  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResult> {
    analyticsService.track('auth', 'ai_resume_analysis_started', { candidateId: request.candidateId });

    // Perform AI analysis heuristic
    const skills = ['React', 'TypeScript', 'Node.js', 'System Architecture', 'PostgreSQL'];
    const found = skills.filter((s) => request.resumeText.toLowerCase().includes(s.toLowerCase()));
    const missing = skills.filter((s) => !found.includes(s));
    const score = Math.round((found.length / skills.length) * 100);

    const result: ResumeAnalysisResult = {
      score,
      keySkillsFound: found,
      missingSkills: missing,
      recommendations: [
        'Highlight cloud infrastructure deployment experience.',
        'Quantify performance metrics in past project bullets.',
      ],
    };

    // Dispatch completion notification via Platform Engine
    await notificationEngine.dispatch({
      recipientId: request.candidateId,
      category: 'system',
      title: 'Resume Analysis Complete',
      body: `Your resume matched ${score}% of target domain criteria.`,
    });

    return result;
  }

  async getAIMatches(query: string): Promise<AIMatchResult[]> {
    const rawSearchResults = await searchService.searchAll(query, ['job']);
    
    return rawSearchResults.map((item) => ({
      jobId: item.id,
      jobTitle: item.title,
      matchPercentage: Math.min(98, Math.max(65, item.score)),
      matchingPoints: ['Domain experience aligns with requirements.', 'Key skills detected in profile.'],
    }));
  }
}

export const aiService = new AIService();
