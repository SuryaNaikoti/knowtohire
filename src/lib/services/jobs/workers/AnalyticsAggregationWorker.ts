import type { BackgroundJob, RetryPolicy } from '../types';
import { analyticsService } from '../../analytics/AnalyticsService';

export class AnalyticsAggregationWorker implements BackgroundJob {
  id = 'worker-analytics-aggregation';
  name = 'Analytics Telemetry Aggregation Worker';
  intervalMs = 180000; // 180s
  enabled = true;
  retryPolicy: RetryPolicy = { maxAttempts: 3, backoffMs: 3000 };

  async execute(): Promise<void> {
    const summary = analyticsService.getSummary();
    console.log(`[AnalyticsAggregationWorker] Aggregated telemetry summary: ${summary.totalSearches} searches, ${summary.totalNotifications} notifications.`);
  }
}
