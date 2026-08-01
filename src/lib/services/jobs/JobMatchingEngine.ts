import type {
  SkillMatch,
  ExperienceMatch,
  EducationMatch,
  SalaryMatch,
  LocationMatch,
  ATSCompatibility,
  MatchRecommendation,
  MatchBreakdown,
  JobMatchResult,
  ISkillMatchScorer,
  IExperienceMatchScorer,
  IEducationMatchScorer,
  ISalaryMatchScorer,
  ILocationMatchScorer,
  IATSCompatibilityScorer,
  IMatchAggregator,
  IJobMatchingEngine
} from './jobMatchingTypes';
import { analyticsService } from '../analyticsService';

export class SkillMatchScorer implements ISkillMatchScorer {
  score(candidateSkills: string[], requiredSkills: string[], preferredSkills: string[] = []): SkillMatch {
    const matchedSkills = candidateSkills.filter(s => requiredSkills.includes(s));
    const missingSkills = requiredSkills.filter(s => !candidateSkills.includes(s));
    
    let baseScore = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 100;
    
    // Add small preferred skill bonus
    const matchedPreferred = candidateSkills.filter(s => preferredSkills.includes(s));
    if (preferredSkills.length > 0) {
      baseScore += (matchedPreferred.length / preferredSkills.length) * 10;
    }

    const finalScore = Math.min(100, Math.round(baseScore));
    return {
      score: finalScore,
      weight: 35,
      matchedSkills,
      missingSkills,
      explanation: `Matched ${matchedSkills.length} out of ${requiredSkills.length} required skills.`
    };
  }
}

export class ExperienceMatchScorer implements IExperienceMatchScorer {
  score(candidateYears: number, requiredYears: number): ExperienceMatch {
    let score = 100;
    if (candidateYears < requiredYears) {
      score = Math.max(10, Math.round((candidateYears / requiredYears) * 80));
    }
    return {
      score,
      weight: 25,
      candidateYears,
      requiredYears,
      explanation: `Candidate has ${candidateYears} years of experience vs required ${requiredYears} years.`
    };
  }
}

export class EducationMatchScorer implements IEducationMatchScorer {
  score(candidateDegree: string, requiredDegree: string): EducationMatch {
    const normalize = (d: string) => d.toLowerCase().replace(/[^a-z]/g, '');
    const candNorm = normalize(candidateDegree || '');
    const reqNorm = normalize(requiredDegree || '');

    let score = 50;
    if (candNorm === reqNorm) {
      score = 100;
    } else if (candNorm.includes('master') || candNorm.includes('phd')) {
      score = 90;
    } else if (candNorm.includes('bachelor')) {
      score = 80;
    }
    return {
      score,
      weight: 15,
      candidateDegree,
      requiredDegree,
      explanation: `Candidate holds ${candidateDegree} degree vs required ${requiredDegree}.`
    };
  }
}

export class SalaryMatchScorer implements ISalaryMatchScorer {
  score(candidateExpected: number, jobBudgetMax: number): SalaryMatch {
    let score = 100;
    if (candidateExpected > jobBudgetMax) {
      const delta = candidateExpected - jobBudgetMax;
      score = Math.max(10, Math.round(100 - (delta / jobBudgetMax) * 100));
    }
    return {
      score,
      weight: 15,
      candidateExpected,
      jobBudgetMax,
      explanation: `Candidate expectations ($${candidateExpected}) relative to max budget ($${jobBudgetMax}).`
    };
  }
}

export class LocationMatchScorer implements ILocationMatchScorer {
  score(candidatePreference: string, jobLocationType: 'remote' | 'hybrid' | 'onsite'): LocationMatch {
    const pref = (candidatePreference || '').toLowerCase();
    let score = 50;

    if (jobLocationType === 'remote' && pref.includes('remote')) {
      score = 100;
    } else if (jobLocationType === 'hybrid' && (pref.includes('hybrid') || pref.includes('remote'))) {
      score = 90;
    } else if (jobLocationType === 'onsite' && pref.includes('onsite')) {
      score = 100;
    }

    return {
      score,
      weight: 10,
      candidatePreference,
      jobLocationType,
      explanation: `Preferences align at ${score}% level with job layout.`
    };
  }
}

export class ATSCompatibilityScorer implements IATSCompatibilityScorer {
  score(atsHealthScore: number): ATSCompatibility {
    return {
      score: atsHealthScore,
      warnings: atsHealthScore < 70 ? ['Formatting issues detected.'] : [],
      explanation: `Standard parser compatibility index currently standing at ${atsHealthScore}%.`
    };
  }
}

export class MatchAggregator implements IMatchAggregator {
  aggregate(breakdown: MatchBreakdown): { overallScore: number; explanation: string } {
    const { skills, experience, education, salary, location } = breakdown;
    
    const weighted = 
      (skills.score * (skills.weight / 100)) +
      (experience.score * (experience.weight / 100)) +
      (education.score * (education.weight / 100)) +
      (salary.score * (salary.weight / 100)) +
      (location.score * (location.weight / 100));

    const overallScore = Math.round(weighted);
    const explanation = `Job match compatibility calculated deterministically at ${overallScore}%.`;
    return { overallScore, explanation };
  }
}

export class JobMatchingEngine implements IJobMatchingEngine {
  private skillScorer: ISkillMatchScorer;
  private expScorer: IExperienceMatchScorer;
  private eduScorer: IEducationMatchScorer;
  private salaryScorer: ISalaryMatchScorer;
  private locScorer: ILocationMatchScorer;
  private atsScorer: IATSCompatibilityScorer;
  private aggregator: IMatchAggregator;

  constructor(
    skillScorer: ISkillMatchScorer,
    expScorer: IExperienceMatchScorer,
    eduScorer: IEducationMatchScorer,
    salaryScorer: ISalaryMatchScorer,
    locScorer: ILocationMatchScorer,
    atsScorer: IATSCompatibilityScorer,
    aggregator: IMatchAggregator
  ) {
    this.skillScorer = skillScorer;
    this.expScorer = expScorer;
    this.eduScorer = eduScorer;
    this.salaryScorer = salaryScorer;
    this.locScorer = locScorer;
    this.atsScorer = atsScorer;
    this.aggregator = aggregator;
  }

  async matchJob(candidateProfile: any, jobListing: any, atsHealthScore: number): Promise<JobMatchResult> {
    const candidateSkills = candidateProfile.skills || [];
    const requiredSkills = jobListing.required_skills || [];
    const preferredSkills = jobListing.preferred_skills || [];

    const skills = this.skillScorer.score(candidateSkills, requiredSkills, preferredSkills);
    const experience = this.expScorer.score(candidateProfile.experience_years || 2, jobListing.required_experience_years || 3);
    const education = this.eduScorer.score(candidateProfile.education_level || 'Bachelor', jobListing.required_education || 'Bachelor');
    const salary = this.salaryScorer.score(candidateProfile.desired_salary || 80000, jobListing.salary_max || 90000);
    const location = this.locScorer.score(candidateProfile.location_preference || 'Remote', jobListing.location_type || 'remote');
    const ats = this.atsScorer.score(atsHealthScore);

    const breakdown: MatchBreakdown = {
      skills,
      experience,
      education,
      salary,
      location,
      ats
    };

    const { overallScore, explanation } = this.aggregator.aggregate(breakdown);

    // Generate recommendations
    const recommendations: MatchRecommendation[] = [];
    skills.missingSkills.forEach((s, idx) => {
      recommendations.push({
        id: `rec_skill_${idx}`,
        type: 'skill',
        suggestion: `Acquire and list ${s} skill to match core job requirements.`,
        impactScore: 15
      });
    });

    const result: JobMatchResult = {
      id: `match_${Date.now()}`,
      candidateId: candidateProfile.id,
      jobId: jobListing.id,
      overallScore,
      breakdown,
      recommendations,
      explanation,
      generatedAt: new Date().toISOString()
    };

    analyticsService.track({
      event_type: 'click',
      event_category: 'auth',
      properties: { action: 'Job Matched', jobId: jobListing.id, overallScore }
    });

    return result;
  }
}

// Instantiate default engine singleton
export const jobMatchingEngine = new JobMatchingEngine(
  new SkillMatchScorer(),
  new ExperienceMatchScorer(),
  new EducationMatchScorer(),
  new SalaryMatchScorer(),
  new LocationMatchScorer(),
  new ATSCompatibilityScorer(),
  new MatchAggregator()
);
export default jobMatchingEngine;
