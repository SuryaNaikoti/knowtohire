import { profileCompletionService } from './ProfileCompletionService';
import type { ProfileCompletionResult } from './ProfileCompletionService';

export interface CareerIntelligenceResult {
  completion: ProfileCompletionResult;
  atsScore: number;
  recruiterScore: number;
  overallCareerScore: number;
  skillsGapCount: number;
  salaryReadiness: 'Low' | 'Medium' | 'High';
}

export interface ICareerIntelligenceService {
  computeCareerScore(profile: any, education: any[], experience: any[], certifications: any[], projects: any[], skills: any[]): CareerIntelligenceResult;
}

export class CareerIntelligenceService implements ICareerIntelligenceService {
  computeCareerScore(
    profile: any,
    education: any[] = [],
    experience: any[] = [],
    certifications: any[] = [],
    projects: any[] = [],
    skills: any[] = []
  ): CareerIntelligenceResult {
    const completion = profileCompletionService.calculateCompletion(
      profile,
      education,
      experience,
      certifications,
      projects,
      skills
    );

    // Calculate ATS Score out of 100
    let atsScore = 20; // baseline
    if (profile?.resume_url) atsScore += 30;
    if (skills.length >= 3) atsScore += 20;
    if (experience.length >= 1) atsScore += 20;
    if (projects.length >= 1) atsScore += 10;

    // Recruiter Visibility Score out of 100
    let recruiterScore = 15;
    if (profile?.avatar_url) recruiterScore += 15;
    if (profile?.headline) recruiterScore += 20;
    if (certifications.length >= 1) recruiterScore += 20;
    if (education.length >= 1) recruiterScore += 15;
    if (profile?.location) recruiterScore += 15;

    const overallCareerScore = Math.round((completion.completionPercentage + atsScore + recruiterScore) / 3);

    const skillsGapCount = Math.max(0, 5 - skills.length);
    const salaryReadiness = experience.length >= 2 ? 'High' : experience.length >= 1 ? 'Medium' : 'Low';

    return {
      completion,
      atsScore,
      recruiterScore,
      overallCareerScore,
      skillsGapCount,
      salaryReadiness
    };
  }
}

export const careerIntelligenceService = new CareerIntelligenceService();
