import type { BackgroundJob, RetryPolicy } from '../types';
import { emailQueue } from '../../notifications';

export class DigestEmailWorker implements BackgroundJob {
  id = 'worker-digest-emails';
  name = 'Daily Notification Digest Dispatcher';
  intervalMs = 120000; // 120s
  enabled = true;
  retryPolicy: RetryPolicy = { maxAttempts: 3, backoffMs: 5000 };

  async execute(): Promise<void> {
    // Enqueue periodic digest summaries
    emailQueue.enqueue(
      'candidate@example.com',
      'Your Daily KnowToHire Digest Summary',
      'Here is your daily summary of job recommendations, profile views, and platform updates.'
    );
  }
}
