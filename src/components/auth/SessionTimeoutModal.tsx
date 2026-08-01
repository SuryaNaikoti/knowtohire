import React, { useState, useEffect, useRef } from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  warningDurationSeconds?: number;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onExtend,
  onLogout,
  warningDurationSeconds = 60,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(warningDurationSeconds);
  const modalRef = useRef<HTMLDivElement>(null);
  const extendButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trapping and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus primary action button when modal opens
    extendButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onExtend();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExtend]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      setSecondsRemaining(warningDurationSeconds);
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, warningDurationSeconds, onLogout]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn motion-reduce:animate-none"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 text-center transform transition-all scale-100 motion-reduce:transition-none"
      >
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-inner">
          <Clock className="w-7 h-7 animate-pulse motion-reduce:animate-none" />
        </div>

        <div className="space-y-2">
          <h3 id="session-timeout-title" className="text-lg font-extrabold text-slate-850 tracking-tight">
            Session Inactivity Warning
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            You have been inactive for a while. For security, your session will automatically expire in:
          </p>
          <div className="inline-block px-4 py-1.5 bg-amber-100/70 border border-amber-200 rounded-full text-amber-900 text-sm font-black tracking-widest my-1">
            00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex-1 h-11 min-h-[44px] text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer focus:ring-2 focus:ring-slate-400"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Now</span>
          </Button>

          <Button
            ref={extendButtonRef}
            onClick={onExtend}
            className="flex-1 h-11 min-h-[44px] text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer focus:ring-2 focus:ring-emerald-500"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Stay Logged In</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
