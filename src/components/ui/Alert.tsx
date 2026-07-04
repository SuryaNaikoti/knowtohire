import React from 'react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
}) => {
  // Variant styling mapping
  const styles = {
    info: {
      wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      svgPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    success: {
      wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: 'text-emerald-500',
      svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
      wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: 'text-amber-500',
      svgPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    error: {
      wrapper: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      svgPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`flex p-4 rounded-xl border border-solid transition-all duration-200 ${currentStyle.wrapper} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <svg
          className={`h-5 w-5 ${currentStyle.icon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={currentStyle.svgPath} />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        {title && <h4 className="text-sm font-bold font-heading mb-1">{title}</h4>}
        <div className="text-sm font-medium leading-relaxed">{message || children}</div>
      </div>
      {onClose && (
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className="inline-flex rounded-md p-1 hover:bg-black/5 focus:outline-none cursor-pointer"
            aria-label="Dismiss alert"
          >
            <svg className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
