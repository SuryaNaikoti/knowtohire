import type { BackgroundJob } from './types';

export class JobRegistry {
  private jobs: Map<string, BackgroundJob> = new Map();

  register(job: BackgroundJob): void {
    this.jobs.set(job.id, job);
  }

  getJob(id: string): BackgroundJob | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values());
  }
}

export const jobRegistry = new JobRegistry();
