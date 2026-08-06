export const CAREER_DOMAINS = [
  'General',
  'Environmental',
  'ESG',
  'Sustainability',
  'Patent',
  'IPR',
  'Research',
  'Consulting'
] as const;

export type CareerDomain = typeof CAREER_DOMAINS[number];
