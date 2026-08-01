/**
 * Generic Route & Asset Prefetching Utility
 * Supports hover, idle, manual, and viewport prefetching.
 */

// Cache of already prefetched module paths
const prefetchedModules = new Set<string>();

/**
 * Dynamically prefetches a route module factory function.
 * Safe against duplicate network requests.
 */
export const prefetchRoute = (factory: () => Promise<unknown>): void => {
  try {
    const factoryString = factory.toString();
    if (prefetchedModules.has(factoryString)) return;

    prefetchedModules.add(factoryString);
    factory();
  } catch (err) {
    console.debug('Prefetch request ignored or failed:', err);
  }
};

/**
 * Schedule prefetching when browser CPU is idle.
 */
export const prefetchOnIdle = (factory: () => Promise<unknown>): void => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => prefetchRoute(factory));
  } else {
    setTimeout(() => prefetchRoute(factory), 2000);
  }
};

/**
 * Link Hover Handler helper to bind onMouseEnter/onFocus events.
 */
export const createHoverPrefetchHandler = (factory: () => Promise<unknown>) => {
  return {
    onMouseEnter: () => prefetchRoute(factory),
    onFocus: () => prefetchRoute(factory),
  };
};
