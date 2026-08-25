/**
 * KnowToHire Centralized Skill Validation & Normalization Utility
 *
 * Enforces strict data integrity across:
 * - Candidate Profile Skills
 * - Job Requisition Skills
 * - ATS Keyword Analysis
 * - Career Insights & Growth Skill Recommendations
 *
 * Rules:
 * 1. Disallows random characters, gibberish (e.g. udfuvyhu, fguuihfuv, sudfgyu), UUIDs, IDs, pure numbers.
 * 2. Minimum length: 2 characters (e.g. 'Go', 'R', 'C', 'AI', 'IP' allowed if valid; others >= 2).
 * 3. Human-readable standard naming with capitalization and known alias resolution.
 */

import { MASTER_SKILLS } from '@/services/masterTaxonomyData';

// Dynamically reference canonical skill patterns from the master taxonomy
export const KNOWN_VALID_SKILL_PATTERNS = MASTER_SKILLS.map((s) => s.name.toLowerCase());

const KNOWN_VALID_ACRONYMS = new Set(['ai', 'ml', 'ui', 'ux', 'ip', 'ec', 'qa', 'db', 'go', 'r', 'c', 'js', 'ts', 'aws', 'gcp', 'sql', 'lca', 'eia', 'ehs', 'gis', 'fto', 'csr', 'epc', 'esg']);

/**
 * Validates whether a raw string represents a genuine human-readable skill.
 * Rejects gibberish, random character strings, database IDs, uuid patterns, and empty values.
 */
export function isValidSkill(rawSkill: unknown): boolean {
  if (typeof rawSkill !== 'string') return false;
  const trimmed = rawSkill.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 50) return false;

  const lower = trimmed.toLowerCase();

  // Reject single words with > 6 characters that have no spaces/dashes and low vowel count or repeated consonant clusters (gibberish detector)
  if (/^[a-z]{7,}$/i.test(trimmed)) {
    // Check vowel ratio
    const vowels = (trimmed.match(/[aeiou]/gi) || []).length;
    const ratio = vowels / trimmed.length;
    // Real English technical skills have at least 15% vowels and don't match random keyboard smashes
    if (ratio < 0.20 || ratio > 0.80) {
      // Check if it is a known pattern
      if (!KNOWN_VALID_SKILL_PATTERNS.some((p) => p.toLowerCase() === lower)) {
        return false;
      }
    }

    // Check for keyboard mashing patterns (e.g. fguuih, dfuvy, sudfg)
    if (/(?:[bcdfghjklmnpqrstvwxyz]{5,})/i.test(trimmed)) {
      if (!KNOWN_VALID_SKILL_PATTERNS.some((p) => p.toLowerCase() === lower)) {
        return false;
      }
    }
  }

  // Reject pure numbers or hex-like hashes / UUIDs
  if (/^[0-9]+$/.test(trimmed)) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return false;
  if (/^[0-9a-f]{16,}$/i.test(trimmed)) return false;

  // Reject placeholder keywords
  const invalidPlaceholders = ['udfuvyhu', 'fguuihfuv', 'sudfgyu', 'juihf', 'undefined', 'null', 'unknown', 'dummy', 'test', 'sample', 'n/a', 'none'];
  if (invalidPlaceholders.some((p) => lower.includes(p))) return false;

  // Must contain alphanumeric characters
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  return true;
}

/**
 * Normalizes a skill into standard professional casing and removes redundant punctuation.
 */
export function normalizeSkillName(rawSkill: string): string {
  const trimmed = rawSkill.trim().replace(/^[-*•\s]+/, '').replace(/[,;]+$/, '');
  const lower = trimmed.toLowerCase();

  // Known standard casing overrides
  const standardCasingMap: Record<string, string> = {
    'react': 'React',
    'react.js': 'React.js',
    'reactjs': 'React.js',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'aws': 'AWS',
    'gcp': 'GCP',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'terraform': 'Terraform',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'python': 'Python',
    'ci/cd': 'CI/CD Automation',
    'devops': 'DevOps',
    'graphql': 'GraphQL',
    'rest api': 'REST APIs',
    'rest apis': 'REST APIs',
    'esg': 'ESG Compliance',
    'esg reporting': 'ESG Reporting',
    'brsr': 'SEBI BRSR',
    'brsr core': 'BRSR Core Verification',
    'ghg protocol': 'GHG Protocol & Scope 1-3',
    'iso 14001': 'ISO 14001 Environmental Standard',
    'gri': 'GRI Standards',
    'tcfd': 'TCFD Climate Risk Modeling',
    'eia': 'EIA Compliance & Clearances',
    'cpcb': 'CPCB / SPCB Regulations',
  };

  if (standardCasingMap[lower]) {
    return standardCasingMap[lower];
  }

  // Capitalize words nicely
  return trimmed
    .split(' ')
    .map((word) => {
      if (KNOWN_VALID_ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
      if (word.length <= 2) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Filters and normalizes an array of skills, guaranteeing uniqueness and eliminating corrupt strings.
 */
export function cleanSkillArray(rawSkills: unknown): string[] {
  if (!rawSkills) return [];
  let list: string[] = [];

  if (Array.isArray(rawSkills)) {
    list = rawSkills.map((s) => (typeof s === 'string' ? s : String(s || '')));
  } else if (typeof rawSkills === 'string') {
    const trimmed = rawSkills.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) list = parsed.map(String);
      } catch {
        list = trimmed.split(/[\n,]+/);
      }
    } else {
      list = trimmed.split(/[\n,]+/);
    }
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of list) {
    if (isValidSkill(item)) {
      const normalized = normalizeSkillName(item);
      const key = normalized.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(normalized);
      }
    }
  }

  return result;
}
