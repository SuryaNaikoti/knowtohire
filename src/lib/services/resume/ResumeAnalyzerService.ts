import type {
  ResumeMetadata,
  ResumeSection,
  ExtractedSkill,
  KeywordMatch,
  ATSAnalysis,
  SkillGap,
  ResumeRecommendation,
  ResumeHealth,
  ResumeAnalysis,
  IResumeParser,
  IResumeNormalizer,
  ISkillsExtractor,
  IKeywordAnalyzer,
  IATSAnalyzer,
  IResumeHealthCalculator,
  IResumeAnalyzerService
} from './resumeTypes';
import { analyticsService } from '../analyticsService';

export class MockResumeParser implements IResumeParser {
  async parse(fileUri: string): Promise<string> {
    return `Resume Plain Text from ${fileUri}. Summary: Professional Senior React and Typescript developer. Experience: Tech Solutions 2024 to present. Education: University of Mumbai, Master of Science.`;
  }
}

export class ResumeNormalizer implements IResumeNormalizer {
  async normalize(_rawText: string): Promise<ResumeSection[]> {
    return [
      { title: 'Summary', content: 'Professional Senior React and Typescript developer.' },
      { title: 'Experience', content: 'Tech Solutions 2024 to present. Developed SaaS widgets architecture.' },
      { title: 'Education', content: 'University of Mumbai, Master of Science.' }
    ];
  }
}

export class SkillsExtractor implements ISkillsExtractor {
  async extract(sections: ResumeSection[]): Promise<ExtractedSkill[]> {
    const skills: ExtractedSkill[] = [];
    const fullText = sections.map(s => s.content).join(' ').toLowerCase();

    if (fullText.includes('react')) {
      skills.push({ name: 'React', category: 'Frontend', confidence: 0.95 });
    }
    if (fullText.includes('typescript')) {
      skills.push({ name: 'TypeScript', category: 'Frontend', confidence: 0.90 });
    }
    if (fullText.includes('supabase') || fullText.includes('database')) {
      skills.push({ name: 'Supabase', category: 'Backend', confidence: 0.85 });
    }

    return skills;
  }
}

export class KeywordAnalyzer implements IKeywordAnalyzer {
  async analyze(sections: ResumeSection[], _targetRole: string): Promise<KeywordMatch[]> {
    const fullText = sections.map(s => s.content).join(' ').toLowerCase();
    const keywords: KeywordMatch[] = [
      { keyword: 'React', found: fullText.includes('react'), frequency: (fullText.match(/react/g) || []).length },
      { keyword: 'TypeScript', found: fullText.includes('typescript'), frequency: (fullText.match(/typescript/g) || []).length },
      { keyword: 'GraphQL', found: fullText.includes('graphql'), frequency: 0, suggestion: 'Add GraphQL under projects experience.' }
    ];
    return keywords;
  }
}

export class ATSAnalyzer implements IATSAnalyzer {
  async analyze(rawText: string): Promise<ATSAnalysis> {
    const warnings: string[] = [];
    const formattingIssues: string[] = [];

    if (rawText.includes('margin') || rawText.length < 100) {
      formattingIssues.push('Narrow margins might truncate text during print rendering.');
    }
    if (!rawText.toLowerCase().includes('education')) {
      warnings.push('No explicit Education section header parsed.');
    }

    const score = Math.max(10, 100 - (warnings.length * 15) - (formattingIssues.length * 10));

    return {
      score,
      warnings,
      formattingIssues,
      parsingEfficiency: 0.98
    };
  }
}

export class ResumeHealthCalculator implements IResumeHealthCalculator {
  async calculate(
    sections: ResumeSection[],
    skills: ExtractedSkill[],
    keywords: KeywordMatch[],
    ats: ATSAnalysis
  ): Promise<ResumeHealth> {
    let score = ats.score;
    if (skills.length >= 2) score += 5;
    if (keywords.every(k => k.found)) score += 5;

    const finalScore = Math.min(100, score);
    const grammarRating = 'Excellent';
    const completenessRating = sections.length >= 3 ? 'High' : 'Medium';
    const readabilityRating = ats.warnings.length === 0 ? 'Optimal' : 'Standard';

    return {
      score: finalScore,
      grammarRating,
      completenessRating,
      readabilityRating
    };
  }
}

export class ResumeAnalyzerService implements IResumeAnalyzerService {
  private parser: IResumeParser;
  private normalizer: IResumeNormalizer;
  private skillsExtractor: ISkillsExtractor;
  private keywordAnalyzer: IKeywordAnalyzer;
  private atsAnalyzer: IATSAnalyzer;
  private healthCalculator: IResumeHealthCalculator;

  constructor(
    parser: IResumeParser,
    normalizer: IResumeNormalizer,
    skillsExtractor: ISkillsExtractor,
    keywordAnalyzer: IKeywordAnalyzer,
    atsAnalyzer: IATSAnalyzer,
    healthCalculator: IResumeHealthCalculator
  ) {
    this.parser = parser;
    this.normalizer = normalizer;
    this.skillsExtractor = skillsExtractor;
    this.keywordAnalyzer = keywordAnalyzer;
    this.atsAnalyzer = atsAnalyzer;
    this.healthCalculator = healthCalculator;
  }

  async analyzeResume(
    fileName: string,
    fileSize: number,
    mimeType: string,
    rawText: string,
    targetRole: string
  ): Promise<ResumeAnalysis> {
    const timestamp = new Date().toISOString();
    const metadata: ResumeMetadata = { fileName, fileSize, mimeType, uploadedAt: timestamp };

    // 1. Process pipeline
    const parsedText = rawText || await this.parser.parse(fileName);
    
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Resume Parsed', fileName }
    });

    const sections = await this.normalizer.normalize(parsedText);
    
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Resume Normalized', fileName }
    });

    const skills = await this.skillsExtractor.extract(sections);
    const keywords = await this.keywordAnalyzer.analyze(sections, targetRole);
    const ats = await this.atsAnalyzer.analyze(parsedText);
    
    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'ATS Score Calculated', score: ats.score }
    });

    const health = await this.healthCalculator.calculate(sections, skills, keywords, ats);

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Resume Health Calculated', score: health.score }
    });

    // 2. Generate Skill Gaps & Recommendations
    const missingSkills = keywords.filter(k => !k.found).map(k => k.keyword);
    const gaps: SkillGap = {
      missingSkills,
      recommendations: missingSkills.map(s => `Acquire ${s} proficiency to align with target role standards.`)
    };

    const recommendations: ResumeRecommendation[] = [];
    if (ats.warnings.length > 0) {
      recommendations.push({
        section: 'ATS Formatting',
        type: 'critical',
        feedback: ats.warnings[0],
        suggestion: 'Rename section headers to standard ATS format (e.g. use "Education").'
      });
    }

    const analysis: ResumeAnalysis = {
      metadata,
      sections,
      skills,
      keywords,
      ats,
      gaps,
      health,
      recommendations
    };

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Resume Analyzed', finalScore: health.score }
    });

    return analysis;
  }
}

// Instantiate default service
export const resumeAnalyzerService = new ResumeAnalyzerService(
  new MockResumeParser(),
  new ResumeNormalizer(),
  new SkillsExtractor(),
  new KeywordAnalyzer(),
  new ATSAnalyzer(),
  new ResumeHealthCalculator()
);
