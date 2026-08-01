import type {
  BroadcastRequest,
  BroadcastDeliveryReport,
  NotificationEvent,
} from '../types';
import { notificationEngine } from '../engine/NotificationEngine';
import { auditService } from '../../auditService';

export class AdminBroadcastService {
  private history: BroadcastDeliveryReport[] = [];

  estimateAudienceReach(targetAudience: BroadcastRequest['targetAudience']): number {
    switch (targetAudience) {
      case 'candidates':
        return 1450;
      case 'employers':
        return 320;
      case 'admins':
        return 12;
      case 'all':
      default:
        return 1782;
    }
  }

  async sendBroadcast(
    adminUserId: string,
    request: BroadcastRequest
  ): Promise<BroadcastDeliveryReport> {
    const startedAt = new Date().toISOString();
    const startTimeMs = Date.now();
    const broadcastId = request.id || crypto.randomUUID();

    const mockRecipients = this.getMockRecipientsForAudience(request.targetAudience);
    const totalRecipients = mockRecipients.length;

    let inAppDelivered = 0;
    let emailQueued = 0;
    let skippedByPreferences = 0;

    if (!request.dryRun) {
      for (const user of mockRecipients) {
        const event: NotificationEvent = {
          recipientId: user.id,
          recipientEmail: request.deliveryMode !== 'in_app' ? user.email : undefined,
          category: request.category,
          title: request.title,
          body: request.body,
        };

        const results = await notificationEngine.dispatch(event);

        if (results.some((r) => r.channel === 'in_app' && r.success)) {
          inAppDelivered += 1;
        }
        if (results.some((r) => r.channel === 'email' && r.success)) {
          emailQueued += 1;
        }
        if (results.length === 0) {
          skippedByPreferences += 1;
        }
      }

      await auditService.logEvent(
        adminUserId,
        'AdminBroadcast',
        `Dispatched system broadcast "${request.title}" to target "${request.targetAudience}"`,
        undefined,
        { broadcastId, recipients: totalRecipients }
      );
    }

    const completedAt = new Date().toISOString();
    const report: BroadcastDeliveryReport = {
      broadcastId,
      startedAt,
      completedAt,
      totalRecipients,
      eligibleRecipients: totalRecipients - skippedByPreferences,
      skippedByPreferences,
      inAppDelivered,
      emailQueued,
      processingDurationMs: Date.now() - startTimeMs,
      status: request.dryRun ? 'draft' : 'completed',
    };

    if (!request.dryRun) {
      this.history.unshift(report);
    }

    return report;
  }

  getBroadcastHistory(): BroadcastDeliveryReport[] {
    return [...this.history];
  }

  private getMockRecipientsForAudience(
    target: BroadcastRequest['targetAudience']
  ): { id: string; email: string; role: string }[] {
    const list = [
      { id: 'user-c1', email: 'candidate1@example.com', role: 'candidate' },
      { id: 'user-c2', email: 'candidate2@example.com', role: 'candidate' },
      { id: 'user-e1', email: 'employer1@example.com', role: 'employer' },
      { id: 'user-a1', email: 'admin1@example.com', role: 'admin' },
    ];

    if (target === 'candidates') return list.filter((u) => u.role === 'candidate');
    if (target === 'employers') return list.filter((u) => u.role === 'employer');
    if (target === 'admins') return list.filter((u) => u.role === 'admin');
    return list;
  }
}

export const adminBroadcastService = new AdminBroadcastService();
