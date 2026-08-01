import type { CandidateResume } from './types';
import { aiService } from '../ai';

const RESUME_STORAGE_KEY = 'kth_candidate_resumes';

export class ResumeService {
  getResumes(candidateId: string): CandidateResume[] {
    try {
      const data = localStorage.getItem(`${RESUME_STORAGE_KEY}_${candidateId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveResume(resume: CandidateResume): CandidateResume {
    const existing = this.getResumes(resume.candidateId);
    const index = existing.findIndex((r) => r.id === resume.id);
    resume.updatedAt = new Date().toISOString();

    if (index >= 0) {
      existing[index] = resume;
    } else {
      existing.unshift(resume);
    }

    try {
      localStorage.setItem(`${RESUME_STORAGE_KEY}_${resume.candidateId}`, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to persist candidate resume:', err);
    }
    return resume;
  }

  async analyzeResumeWithAI(candidateId: string, resumeId: string) {
    const resumes = this.getResumes(candidateId);
    const target = resumes.find((r) => r.id === resumeId);
    if (!target) throw new Error('Resume not found for AI analysis');

    const resumeText = `${target.summary} ${target.skills.join(' ')} ${target.experience.map((e) => e.description).join(' ')}`;
    return await aiService.analyzeResume({
      candidateId,
      resumeText,
      targetJobTitle: target.title,
    });
  }
}

export const resumeService = new ResumeService();
