/**
 * Session Storage Preferences Utility
 * Securely manages user session storage preferences (e.g. Remember Me) and session restoration tokens.
 */

const REMEMBER_ME_KEY = 'knowtohire_remember_me_pref';

export const setRememberMePreference = (remember: boolean): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to set Remember Me preference:', err);
  }
};

export const getRememberMePreference = (): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const value = window.localStorage.getItem(REMEMBER_ME_KEY);
    return value === 'true';
  } catch (err) {
    console.error('Failed to read Remember Me preference:', err);
    return false;
  }
};

export const clearSessionPreferences = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(REMEMBER_ME_KEY);
  } catch (err) {
    console.error('Failed to clear session preferences:', err);
  }
};
