import { useState, useCallback } from 'react';

/**
 * Custom hook to track Caps Lock status during keyboard interactions.
 */
export function useCapsLock() {
  const [capsLockActive, setCapsLockActive] = useState(false);

  const checkCapsLock = useCallback((event: React.KeyboardEvent | React.FocusEvent) => {
    if ('getModifierState' in event && typeof event.getModifierState === 'function') {
      const isCapsLock = event.getModifierState('CapsLock');
      setCapsLockActive(isCapsLock);
    }
  }, []);

  const resetCapsLock = useCallback(() => {
    setCapsLockActive(false);
  }, []);

  return {
    capsLockActive,
    onKeyDown: checkCapsLock,
    onKeyUp: checkCapsLock,
    onFocus: checkCapsLock,
    onBlur: resetCapsLock,
  };
}
