import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeoutMs: number; // e.g. 15 * 60 * 1000 (15 minutes)
  warningMs: number; // e.g. 14 * 60 * 1000 (14 minutes)
  onWarning: () => void;
  onTimeout: () => void;
  enabled?: boolean;
}

export function useIdleTimer({
  timeoutMs,
  warningMs,
  onWarning,
  onTimeout,
  enabled = true,
}: UseIdleTimerOptions) {
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    if (!enabled) return;

    warningTimerRef.current = setTimeout(() => {
      onWarning();
    }, warningMs);

    timeoutTimerRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  }, [clearTimers, enabled, warningMs, timeoutMs, onWarning, onTimeout]);

  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // Debounce activity resetting
      startTimers();
    };

    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    startTimers();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
  }, [enabled, startTimers, clearTimers]);

  return { resetTimer };
}
