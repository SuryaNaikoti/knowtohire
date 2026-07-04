export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
