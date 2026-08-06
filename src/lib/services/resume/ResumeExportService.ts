import type { CandidateResume } from '../resume/types';

export class ResumeExportService {
  exportToPDF(resume: CandidateResume): void {
    const originalTitle = document.title;
    document.title = `${resume.fullName.replace(/\s+/g, '_')}_Resume`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }
}

export const resumeExportService = new ResumeExportService();
