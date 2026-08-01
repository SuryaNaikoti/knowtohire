import { emailAdapter } from '../adapters/EmailAdapter';
import { GenericNotificationTemplate } from '../templates/EmailTemplates';

export interface EmailJob {
  id: string;
  to: string;
  title: string;
  body: string;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'sending' | 'delivered' | 'failed';
  lastError?: string;
}

export class EmailQueue {
  private queue: EmailJob[] = [];
  private isProcessing = false;
  private template = new GenericNotificationTemplate();

  enqueue(to: string, title: string, body: string): void {
    const job: EmailJob = {
      id: crypto.randomUUID(),
      to,
      title,
      body,
      attempts: 0,
      maxAttempts: 3,
      status: 'queued',
    };
    this.queue.push(job);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const job = this.queue.shift();

    if (!job) {
      this.isProcessing = false;
      return;
    }

    job.status = 'sending';
    job.attempts += 1;

    try {
      const rendered = this.template.render({ title: job.title, body: job.body });
      const result = await emailAdapter.sendEmail(job.to, rendered.subject, rendered.body, rendered.htmlBody);

      if (result.success) {
        job.status = 'delivered';
      } else {
        throw new Error(result.error || 'Delivery failed');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown dispatch error';
      job.lastError = errorMsg;

      if (job.attempts < job.maxAttempts) {
        job.status = 'queued';
        // Exponential backoff retry queueing
        setTimeout(() => {
          this.queue.push(job);
          this.processNext();
        }, Math.pow(2, job.attempts) * 1000);
      } else {
        job.status = 'failed';
        console.error(`[EmailQueue] Job ${job.id} permanently failed after ${job.attempts} attempts: ${errorMsg}`);
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processNext();
    }
  }

  getQueueStatus(): EmailJob[] {
    return [...this.queue];
  }
}

export const emailQueue = new EmailQueue();
