/**
 * Web Vitals Measurement & Telemetry Adapter
 * Initializes instrumentation exclusively in production environments.
 */

export interface MetricPayload {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export type WebVitalsReporter = (metric: MetricPayload) => void;

let activeReporter: WebVitalsReporter | null = null;

/**
 * Configure target analytics provider (Supabase analytics_events, PostHog, GA4, etc.)
 */
export const registerWebVitalsReporter = (reporter: WebVitalsReporter): void => {
  activeReporter = reporter;
};

/**
 * Initialize Web Vitals performance observers in production mode.
 */
export const initWebVitals = (): void => {
  if (import.meta.env.DEV) {
    return; // Defer measurement during local development
  }

  // Observe Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          reportMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor',
            delta: lastEntry.startTime,
            id: 'lcp-' + Date.now(),
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // PerformanceObserver type unsupported
    }
  }
};

const reportMetric = (payload: MetricPayload): void => {
  if (activeReporter) {
    activeReporter(payload);
  }
};
