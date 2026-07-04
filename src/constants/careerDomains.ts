export const CAREER_DOMAINS = [
  'General',
  'Environmental',
  'ESG',
  'Patent',
  'IPR',
  'Research',
  'Consulting'
] as const;

export type CareerDomain = typeof CAREER_DOMAINS[number];
