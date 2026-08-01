import type { JobApplication } from './types';
import { notificationEngine } from '../notifications';
import { analyticsService } from '../analytics/AnalyticsService';

const APP_STORAGE_KEY = 'kth_job_applications';

export class ApplicationService {
  getApplications(filter?: { candidateId?: string; employerId?: string }): JobApplication[] {
    try {
      const data = localStorage.getItem(APP_STORAGE_KEY);
      const all: JobApplication[] = data ? JSON.parse(data) : [];

      return all.filter((app) => {
        if (filter?.candidateId && app.candidateId !== filter.candidateId) return false;
        if (filter?.employerId && app.employerId !== filter.employerId) return false;
        return true;
      });
    } catch {
      return [];
    }
  }

  async submitApplication(
    jobId: string,
    jobTitle: string,
    employerId: string,
    candidateId: string,
    candidateName: string,
    candidateEmail: string,
    resumeId: string,
    resumeSummary: string
  ): Promise<JobApplication> {
    const existing = this.getApplications();
    const now = new Date().toISOString();
    const newApp: JobApplication = {
      id: crypto.randomUUID(),
      jobId,
      jobTitle,
      employerId,
      candidateId,
      candidateName,
      candidateEmail,
      candidateLocation: 'San Francisco, CA',
      candidateSalary: '$145,000 / yr',
      resumeId,
      resumeSummary,
      matchScore: 88,
      resumeScore: 92,
      stage: 'New',
      appliedAt: now,
      updatedAt: now,
      timeline: [
        {
          id: crypto.randomUUID(),
          stage: 'New',
          timestamp: now,
          actingUser: candidateName,
          notes: 'Submitted application via Global Discovery',
        },
      ],
      notes: [],
      rating: 4,
    };

    existing.unshift(newApp);
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to submit job application:', err);
    }

    // Emit Telemetry
    analyticsService.track('job_application', 'application_submitted', { jobId, candidateId });

    // Notify Employer
    await notificationEngine.dispatch({
      recipientId: employerId,
      category: 'job_alert',
      title: `New Application for "${jobTitle}"`,
      body: `${candidateName} has applied for ${jobTitle}.`,
    });

    return newApp;
  }

  async withdrawApplication(applicationId: string, candidateId: string): Promise<boolean> {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === applicationId && a.candidateId === candidateId);
    if (index < 0) return false;

    apps.splice(index, 1);
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(apps));
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      return false;
    }

    analyticsService.track('job_application', 'application_withdrawn', { applicationId, candidateId });
    return true;
  }
}

export const applicationService = new ApplicationService();
