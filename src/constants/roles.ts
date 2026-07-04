export const ROLES = {
  CANDIDATE: 'Candidate',
  EMPLOYER: 'Employer',
  ADMIN: 'Admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
