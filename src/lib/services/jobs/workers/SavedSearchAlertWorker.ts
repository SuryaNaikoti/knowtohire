import type { BackgroundJob, RetryPolicy } from '../types';
import { discoveryController, savedSearchesService } from '../../search';
import { notificationEngine } from '../../notifications';

export class SavedSearchAlertWorker implements BackgroundJob {
  id = 'worker-saved-search-alerts';
  name = 'Saved Search Alert Dispatcher';
  intervalMs = 60000; // 60s
  enabled = true;
  retryPolicy: RetryPolicy = { maxAttempts: 3, backoffMs: 2000 };

  async execute(): Promise<void> {
    const activeSearches = savedSearchesService.getSavedSearches('guest-user');
    for (const search of activeSearches) {
      if (!search.notificationsEnabled) continue;
      const results = await discoveryController.discover(search.filters);

      if (results.length > 0) {
        await notificationEngine.dispatch({
          recipientId: search.userId,
          category: 'job_alert',
          title: `New Matches for "${search.name}"`,
          body: `Found ${results.length} new matching entries for your saved search query.`,
        });
      }
    }
  }
}
