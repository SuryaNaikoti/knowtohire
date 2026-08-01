export interface ProfileCompletionResult {
  completionPercentage: number;
  strengthScore: number;
  recruiterReadiness: 'Low' | 'Medium' | 'High';
  atsReadiness: 'Low' | 'Medium' | 'High';
  completedSections: string[];
  missingSections: string[];
  priorityActions: string[];
  recommendations: string[];
  weakAreas: string[];
  lastCalculatedAt: string;
}

export interface IProfileCompletionService {
  calculateCompletion(profile: any, education: any[], experience: any[], certifications: any[], projects: any[], skills: any[]): ProfileCompletionResult;
}

export class ProfileCompletionService implements IProfileCompletionService {
  calculateCompletion(
    profile: any,
    education: any[] = [],
    experience: any[] = [],
    certifications: any[] = [],
    projects: any[] = [],
    skills: any[] = []
  ): ProfileCompletionResult {
    const completedSections: string[] = [];
    const missingSections: string[] = [];
    const priorityActions: string[] = [];
    const recommendations: string[] = [];
    const weakAreas: string[] = [];

    let score = 0;
    let maxScore = 0;

    // 1. Resume
    maxScore += 20;
    if (profile?.resume_url) {
      score += 20;
      completedSections.push('Resume');
    } else {
      missingSections.push('Resume');
      priorityActions.push('Upload your professional resume');
      recommendations.push('Upload a PDF resume to enable AI match scoring.');
    }

    // 2. Headline & Bio
    maxScore += 15;
    if (profile?.headline && profile?.bio) {
      score += 15;
      completedSections.push('About Me');
    } else {
      missingSections.push('About Me');
      priorityActions.push('Add your professional headline and bio summary');
      recommendations.push('Write a short bio detailing your core career focus.');
    }

    // 3. Education
    maxScore += 15;
    if (education && education.length > 0) {
      score += 15;
      completedSections.push('Education');
    } else {
      missingSections.push('Education');
      priorityActions.push('Add your educational background');
      recommendations.push('Add school or university degrees to verify academic focus.');
    }

    // 4. Experience
    maxScore += 20;
    if (experience && experience.length > 0) {
      score += 20;
      completedSections.push('Work Experience');
    } else {
      missingSections.push('Work Experience');
      priorityActions.push('Add your professional work history');
      recommendations.push('Add past jobs to establish chronological industry experience.');
    }

    // 5. Skills
    maxScore += 15;
    if (skills && skills.length >= 3) {
      score += 15;
      completedSections.push('Skills');
    } else {
      maxScore -= 15; // adjust or keep ratio
      missingSections.push('Skills');
      priorityActions.push('Add at least 3 technical skills');
      recommendations.push('Select from the core capabilities registry to increase match scores.');
      weakAreas.push('Skills Inventory');
    }

    // 6. Projects & Certs
    maxScore += 15;
    let extraScore = 0;
    if (projects && projects.length > 0) {
      extraScore += 10;
      completedSections.push('Projects');
    } else {
      missingSections.push('Projects');
      recommendations.push('Add links to portfolio projects or GitHub repos.');
    }

    if (certifications && certifications.length > 0) {
      extraScore += 5;
      completedSections.push('Certifications');
    } else {
      missingSections.push('Certifications');
      recommendations.push('Add professional badges to stand out to employers.');
    }
    score += extraScore;

    const percentage = Math.round((score / maxScore) * 100);

    const recruiterReadiness = percentage >= 80 ? 'High' : percentage >= 50 ? 'Medium' : 'Low';
    const atsReadiness = profile?.resume_url && skills.length >= 3 ? 'High' : 'Low';

    return {
      completionPercentage: percentage,
      strengthScore: score,
      recruiterReadiness,
      atsReadiness,
      completedSections,
      missingSections,
      priorityActions,
      recommendations,
      weakAreas,
      lastCalculatedAt: new Date().toISOString()
    };
  }
}

export const profileCompletionService = new ProfileCompletionService();
