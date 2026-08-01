import type { CandidateResume } from '../resume/types';

export class ResumeExportService {
  exportToPDF(resume: CandidateResume): void {
    console.log(`[ResumeExportService] Triggering structured PDF export for ${resume.fullName}`);
    window.print();
  }
}

export const resumeExportService = new ResumeExportService();
