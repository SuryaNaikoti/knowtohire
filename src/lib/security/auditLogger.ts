/**
 * Security Audit Logging Subsystem
 * Emits structured security event payloads for authentication compliance, threat analysis, and admin audit trails.
 */

export type SecurityEventType =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'REGISTER_SUCCESS'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'MFA_CHALLENGE'
  | 'MFA_VERIFIED'
  | 'SESSION_REVOKED'
  | 'ACCOUNT_LOCKED';

export interface SecurityAuditEvent {
  eventType: SecurityEventType;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent: string;
  details?: Record<string, any>;
}

class AuditLoggerService {
  private eventsLog: SecurityAuditEvent[] = [];

  /**
   * Log a security event.
   */
  public logSecurityEvent(
    eventType: SecurityEventType,
    payload: { userId?: string; userEmail?: string; details?: Record<string, any> }
  ): SecurityAuditEvent {
    const event: SecurityAuditEvent = {
      eventType,
      userId: payload.userId,
      userEmail: payload.userEmail,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server Environment',
      details: payload.details,
    };

    this.eventsLog.push(event);

    // Development & Audit Log output
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SECURITY AUDIT] [${event.eventType}]`, event);
    }

    return event;
  }

  /**
   * Retrieve recent security audit events log.
   */
  public getRecentAuditEvents(limit = 50): SecurityAuditEvent[] {
    return this.eventsLog.slice(-limit);
  }
}

export const auditLogger = new AuditLoggerService();
