import type { NotificationCategory, UserNotificationPreferences, NotificationChannelPreference } from '../types';

export const DEFAULT_USER_PREFERENCES: UserNotificationPreferences = {
  application_update: { in_app_enabled: true, email_enabled: true, push_enabled: true },
  job_alert: { in_app_enabled: true, email_enabled: true, push_enabled: false },
  payment: { in_app_enabled: true, email_enabled: true, push_enabled: true },
  system: { in_app_enabled: true, email_enabled: true, push_enabled: false },
  marketing: { in_app_enabled: true, email_enabled: false, push_enabled: false },
  security: { in_app_enabled: true, email_enabled: true, push_enabled: true },
  account: { in_app_enabled: true, email_enabled: true, push_enabled: false },
  moderation: { in_app_enabled: true, email_enabled: true, push_enabled: false },
  community: { in_app_enabled: true, email_enabled: false, push_enabled: false },
  marketplace: { in_app_enabled: true, email_enabled: true, push_enabled: false },
  subscription: { in_app_enabled: true, email_enabled: true, push_enabled: true },
  ai_processing: { in_app_enabled: true, email_enabled: false, push_enabled: false },
};

export class PreferenceEvaluator {
  private userPreferencesMap = new Map<string, UserNotificationPreferences>();

  getUserPreferences(userId: string): UserNotificationPreferences {
    return this.userPreferencesMap.get(userId) || DEFAULT_USER_PREFERENCES;
  }

  setUserPreferences(userId: string, preferences: UserNotificationPreferences): void {
    this.userPreferencesMap.set(userId, preferences);
  }

  shouldDeliver(
    userId: string,
    category: NotificationCategory,
    channel: 'in_app' | 'email' | 'push'
  ): boolean {
    const prefs = this.getUserPreferences(userId);
    const categoryPref: NotificationChannelPreference = prefs[category] || {
      in_app_enabled: true,
      email_enabled: true,
      push_enabled: false,
    };

    switch (channel) {
      case 'in_app':
        return categoryPref.in_app_enabled;
      case 'email':
        return categoryPref.email_enabled;
      case 'push':
        return categoryPref.push_enabled;
      default:
        return true;
    }
  }
}

export const preferenceEvaluator = new PreferenceEvaluator();
