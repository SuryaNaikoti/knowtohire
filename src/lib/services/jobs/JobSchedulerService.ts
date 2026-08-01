import { jobRegistry } from './JobRegistry';
import { jobDispatcher } from './JobDispatcher';

export class JobSchedulerService {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  startAll(): void {
    const jobs = jobRegistry.getAllJobs();
    for (const job of jobs) {
      if (job.enabled && !this.timers.has(job.id)) {
        const timer = setInterval(() => {
          jobDispatcher.dispatch(job);
        }, job.intervalMs);
        this.timers.set(job.id, timer);
      }
    }
  }

  stopAll(): void {
    for (const [id, timer] of this.timers.entries()) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  async runJobNow(jobId: string): Promise<boolean> {
    const job = jobRegistry.getJob(jobId);
    if (!job) return false;
    await jobDispatcher.dispatch(job);
    return true;
  }
}

export const jobSchedulerService = new JobSchedulerService();
