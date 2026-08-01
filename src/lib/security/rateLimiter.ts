/**
 * Security Rate Limiter & Lockout Policy Manager
 * Protects against brute-force login attacks, credential stuffing, and email enumeration abuse.
 */

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsCount: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_SECONDS = 30;

class RateLimiterService {
  private attemptsMap: Map<string, { count: number; lockedUntil: number }> = new Map();

  /**
   * Get current lockout status for an email or IP key.
   */
  public getLockoutStatus(identifier: string): LockoutStatus {
    const key = identifier.toLowerCase().trim();
    const entry = this.attemptsMap.get(key);

    if (!entry) {
      return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
    }

    const now = Date.now();
    if (entry.lockedUntil > now) {
      const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attemptsCount: entry.count };
    }

    // Lockout expired
    if (entry.lockedUntil !== 0 && entry.lockedUntil <= now) {
      this.attemptsMap.delete(key);
      return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, attemptsCount: entry.count };
  }

  /**
   * Record a failed authentication attempt. Calculates exponential backoff lockout if threshold exceeded.
   */
  public recordFailedAttempt(identifier: string): LockoutStatus {
    const key = identifier.toLowerCase().trim();
    const entry = this.attemptsMap.get(key) || { count: 0, lockedUntil: 0 };

    entry.count += 1;

    if (entry.count >= MAX_FAILED_ATTEMPTS) {
      // Exponential backoff calculation: 30s for 5th attempt, 60s for 6th, etc.
      const multiplier = Math.pow(2, entry.count - MAX_FAILED_ATTEMPTS);
      const lockoutDurationMs = BASE_LOCKOUT_SECONDS * multiplier * 1000;
      entry.lockedUntil = Date.now() + lockoutDurationMs;
    }

    this.attemptsMap.set(key, entry);
    return this.getLockoutStatus(key);
  }

  /**
   * Clear failed attempt history upon successful authentication.
   */
  public resetAttempts(identifier: string): void {
    const key = identifier.toLowerCase().trim();
    this.attemptsMap.delete(key);
  }

  /**
   * Sanitize error message to prevent user enumeration attacks.
   */
  public getGenericAuthErrorMessage(originalErrorMsg: string): string {
    const lower = originalErrorMsg.toLowerCase();
    if (
      lower.includes('invalid login credentials') ||
      lower.includes('user not found') ||
      lower.includes('wrong password') ||
      lower.includes('email not confirmed')
    ) {
      return 'Invalid email or password. Please verify your credentials and try again.';
    }
    return originalErrorMsg;
  }
}

export const rateLimiter = new RateLimiterService();
