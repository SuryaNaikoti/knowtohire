import { AIProviderRegistry } from './AIProvider';

export interface CareerSuggestion {
  suggestions: string[];
}

export interface CareerRoadmap {
  milestones: { phase: string; focus: string }[];
}

export interface IAICareerInsightsService {
  getResumeSuggestions(skillsList: string[]): Promise<CareerSuggestion>;
  getCareerRoadmap(targetRole: string): Promise<CareerRoadmap>;
}

export class AICareerInsightsService implements IAICareerInsightsService {
  async getResumeSuggestions(skillsList: string[]): Promise<CareerSuggestion> {
    const provider = AIProviderRegistry.getProvider();
    const prompt = `Analyze skills: ${skillsList.join(', ')}. Provide 3 suggestions to improve resume health.`;
    const response = await provider.generateCompletion(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return {
        suggestions: [
          'Detail your technical stack across projects.',
          'Quantify team leadership experiences.',
          'Improve headline to match primary role competencies.'
        ]
      };
    }
  }

  async getCareerRoadmap(targetRole: string): Promise<CareerRoadmap> {
    const provider = AIProviderRegistry.getProvider();
    const prompt = `Create a 2-step milestones career learning path for target role: ${targetRole}.`;
    const response = await provider.generateCompletion(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return {
        milestones: [
          { phase: 'Phase 1: Core Competency', focus: 'Master React state management and APIs.' },
          { phase: 'Phase 2: System Architecture', focus: 'Deploy robust Supabase RLS schema designs.' }
        ]
      };
    }
  }
}

export const aiCareerInsightsService = new AICareerInsightsService();
