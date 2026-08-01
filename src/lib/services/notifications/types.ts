/**
 * Event-Driven Notification System Core Types & Contracts
 */

export type NotificationCategory =
  | 'application_update'
  | 'job_alert'
  | 'payment'
  | 'system'
  | 'marketing'
  | 'security'
  | 'account'
  | 'moderation'
  | 'community'
  | 'marketplace'
  | 'subscription'
  | 'ai_processing';

export type NotificationChannel = 'in_app' | 'email' | 'push';

export type DeliveryStatus =
  | 'created'
  | 'queued'
  | 'sending'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'archived';

export interface NotificationRecipient {
  id: string;
  email?: string;
  name?: string;
}

export interface NotificationChannelPreference {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
}

export type UserNotificationPreferences = Record<NotificationCategory, NotificationChannelPreference>;

export interface NotificationPayload {
  id: string;
  recipientId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
  status: DeliveryStatus;
  isRead: boolean;
  created_at: string;
}

export interface NotificationEvent {
  category: NotificationCategory;
  title: string;
  body: string;
  recipientId: string;
  recipientEmail?: string;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationDeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

export type BroadcastTargetAudience = 'all' | 'candidates' | 'employers' | 'admins';
export type BroadcastDeliveryMode = 'in_app' | 'email' | 'both';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';

export interface BroadcastRequest {
  id?: string;
  title: string;
  body: string;
  category: NotificationCategory;
  targetAudience: BroadcastTargetAudience;
  deliveryMode: BroadcastDeliveryMode;
  scheduledAt?: string;
  dryRun?: boolean;
}

export interface BroadcastDeliveryReport {
  broadcastId: string;
  startedAt: string;
  completedAt: string;
  totalRecipients: number;
  eligibleRecipients: number;
  skippedByPreferences: number;
  inAppDelivered: number;
  emailQueued: number;
  processingDurationMs: number;
  status: BroadcastStatus;
}
