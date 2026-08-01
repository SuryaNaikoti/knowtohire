import type { JobApplication, ApplicationStage } from './types';
import { applicationService } from './ApplicationService';

export class ApplicationTimelineService {
  async addTimelineEntry(
    applicationId: string,
    newStage: ApplicationStage,
    actingUser = 'Employer',
    notes?: string
  ): Promise<JobApplication | null> {
    const apps = applicationService.getApplications();
    const target = apps.find((a) => a.id === applicationId);
    if (!target) return null;

    target.stage = newStage;
    target.updatedAt = new Date().toISOString();
    target.timeline.unshift({
      id: crypto.randomUUID(),
      stage: newStage,
      timestamp: new Date().toISOString(),
      actingUser,
      notes,
    });

    try {
      localStorage.setItem('kth_job_applications', JSON.stringify(apps));
    } catch (err) {
      console.error('Failed to append timeline entry:', err);
    }
    return target;
  }
}

export const applicationTimelineService = new ApplicationTimelineService();
