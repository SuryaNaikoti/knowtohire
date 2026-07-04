export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[keyof typeof APPLICATION_STATUSES];
