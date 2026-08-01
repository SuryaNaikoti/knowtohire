import type { ApplicationStage } from './types';
import { applicationTimelineService } from './ApplicationTimelineService';
import { notificationEngine } from '../notifications';
import { analyticsService } from '../analytics/AnalyticsService';

export class ATSWorkflowService {
  async updateStage(
    applicationId: string,
    newStage: ApplicationStage,
    actingUser = 'Employer'
  ): Promise<boolean> {
    const updated = await applicationTimelineService.addTimelineEntry(
      applicationId,
      newStage,
      actingUser
    );

    if (!updated) return false;

    // Emit Telemetry
    analyticsService.track('job_application', 'application_stage_updated', {
      applicationId,
      newStage,
    });

    // Notify Candidate
    await notificationEngine.dispatch({
      recipientId: updated.candidateId,
      category: 'job_alert',
      title: `Application Status Updated: ${updated.jobTitle}`,
      body: `Your application status for "${updated.jobTitle}" has been updated to ${newStage}.`,
    });

    return true;
  }
}

export const atsWorkflowService = new ATSWorkflowService();
