export type JobState =
  | 'Pending'
  | 'Queued'
  | 'Running'
  | 'Succeeded'
  | 'Failed'
  | 'Retrying'
  | 'Disabled';

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

export interface JobExecutionLog {
  jobId: string;
  executionId: string;
  startedAt: string;
  completedAt?: string;
  state: JobState;
  attempts: number;
  durationMs?: number;
  error?: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  intervalMs: number;
  retryPolicy: RetryPolicy;
  enabled: boolean;
  execute(): Promise<void>;
}
