// Common email domain typo mapping
const DOMAIN_TYPOS: Record<string, string> = {
  'gmail.con': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yahoo.con': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'outlook.con': 'outlook.com',
  'outlok.com': 'outlook.com',
  'hotmail.con': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'icloud.con': 'icloud.com',
};

// Known disposable email provider domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'dispostable.com',
  'throwawaymail.com',
  'tempmail.org',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'getairmail.com',
  'maildrop.cc',
  'crazymailing.com',
]);

/**
 * Checks an email string for common domain typos.
 * Returns suggested correction if a typo is found, or null otherwise.
 */
export function getEmailDomainSuggestion(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const parts = email.split('@');
  if (parts.length !== 2) return null;

  const domain = parts[1].toLowerCase().trim();
  const correction = DOMAIN_TYPOS[domain];

  if (correction) {
    return `${parts[0]}@${correction}`;
  }
  return null;
}

/**
 * Checks if the email domain belongs to a known temporary/disposable provider.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(domain);
}
