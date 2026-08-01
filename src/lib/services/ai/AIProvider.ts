export interface AIProvider {
  generateCompletion(prompt: string, options?: any): Promise<string>;
}

export class GeminiProvider implements AIProvider {
  async generateCompletion(prompt: string, _options?: any): Promise<string> {
    // Simulated Gemini Provider response.
    // In production, this integrates with the Google Gemini API.
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (prompt.toLowerCase().includes('resume')) {
      return JSON.stringify({
        suggestions: [
          'Add a detailed list of projects in your profile to showcase hands-on experience.',
          'Quantify achievements in your professional experience section (e.g., improved metrics by 25%).',
          'Include links to verification sources for AWS and other certs.'
        ]
      });
    }

    if (prompt.toLowerCase().includes('roadmap')) {
      return JSON.stringify({
        milestones: [
          { phase: 'Phase 1: Advanced Typescript', focus: 'Master Generics and Decorators' },
          { phase: 'Phase 2: NextJS App Router', focus: 'Server components and streaming strategies' }
        ]
      });
    }

    return 'Default Career recommendations populated.';
  }
}

export class AIProviderRegistry {
  private static provider: AIProvider = new GeminiProvider();

  static setProvider(newProvider: AIProvider): void {
    this.provider = newProvider;
  }

  static getProvider(): AIProvider {
    return this.provider;
  }
}
