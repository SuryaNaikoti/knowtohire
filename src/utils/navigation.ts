/**
 * Unified Client-Side Navigation Utility for KnowToHire SPA.
 * Handles smooth popstate-based routing without full page browser reloads.
 */

export function navigateTo(path: string, options: { replace?: boolean; scrollToTop?: boolean } = {}) {
  if (typeof window === 'undefined') return;

  const { replace = false, scrollToTop = true } = options;

  if (replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }

  // Dispatch popstate so App.tsx and any listening components update their route
  window.dispatchEvent(new PopStateEvent('popstate'));

  if (scrollToTop) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
}

/**
 * Helper to extract query parameters from the current URL.
 */
export function getQueryParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(key);
}
