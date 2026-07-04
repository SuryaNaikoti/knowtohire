export const JOB_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type JobStatus = typeof JOB_STATUSES[keyof typeof JOB_STATUSES];
