export interface ResumeMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ResumeSection {
  title: string;
  content: string;
}

export interface ExtractedSkill {
  name: string;
  category: string;
  confidence: number;
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  frequency: number;
  suggestion?: string;
}

export interface ATSAnalysis {
  score: number;
  warnings: string[];
  formattingIssues: string[];
  parsingEfficiency: number;
}

export interface SkillGap {
  missingSkills: string[];
  recommendations: string[];
}

export interface ResumeRecommendation {
  section: string;
  type: 'critical' | 'improvement' | 'grammar';
  feedback: string;
  suggestion: string;
}

export interface ResumeHealth {
  score: number;
  grammarRating: string;
  completenessRating: string;
  readabilityRating: string;
}

export interface ResumeAnalysis {
  metadata: ResumeMetadata;
  sections: ResumeSection[];
  skills: ExtractedSkill[];
  keywords: KeywordMatch[];
  ats: ATSAnalysis;
  gaps: SkillGap;
  health: ResumeHealth;
  recommendations: ResumeRecommendation[];
}

// Service Contracts
export interface IResumeParser {
  parse(fileUri: string): Promise<string>;
}

export interface IResumeNormalizer {
  normalize(rawText: string): Promise<ResumeSection[]>;
}

export interface ISkillsExtractor {
  extract(sections: ResumeSection[]): Promise<ExtractedSkill[]>;
}

export interface IKeywordAnalyzer {
  analyze(sections: ResumeSection[], targetRole: string): Promise<KeywordMatch[]>;
}

export interface IATSAnalyzer {
  analyze(rawText: string): Promise<ATSAnalysis>;
}

export interface IResumeHealthCalculator {
  calculate(
    sections: ResumeSection[],
    skills: ExtractedSkill[],
    keywords: KeywordMatch[],
    ats: ATSAnalysis
  ): Promise<ResumeHealth>;
}

export interface IResumeAnalyzerService {
  analyzeResume(
    fileName: string,
    fileSize: number,
    mimeType: string,
    rawText: string,
    targetRole: string
  ): Promise<ResumeAnalysis>;
}
