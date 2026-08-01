import type { BackgroundJob, JobExecutionLog } from './types';

export class JobDispatcher {
  private executionLogs: JobExecutionLog[] = [];

  async dispatch(job: BackgroundJob): Promise<JobExecutionLog> {
    const executionId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const startTimeMs = Date.now();

    const log: JobExecutionLog = {
      jobId: job.id,
      executionId,
      startedAt,
      state: 'Running',
      attempts: 1,
    };

    try {
      await job.execute();
      log.state = 'Succeeded';
      log.completedAt = new Date().toISOString();
      log.durationMs = Date.now() - startTimeMs;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Job execution failed';
      log.state = 'Failed';
      log.error = errorMsg;
      log.completedAt = new Date().toISOString();
      log.durationMs = Date.now() - startTimeMs;
      console.error(`[JobDispatcher] Job ${job.id} execution failed: ${errorMsg}`);
    }

    this.executionLogs.unshift(log);
    return log;
  }

  getLogs(): JobExecutionLog[] {
    return [...this.executionLogs];
  }
}

export const jobDispatcher = new JobDispatcher();
