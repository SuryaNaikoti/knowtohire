import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';

interface FormErrorSummaryProps {
  errors: FieldErrors;
  title?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title = 'Please correct the following errors before proceeding:',
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorEntries = Object.entries(errors);

  useEffect(() => {
    if (errorEntries.length > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [errorEntries.length]);

  if (errorEntries.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all motion-reduce:transition-none"
    >
      <div className="flex items-center gap-2 font-bold text-xs text-red-950">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        <span>{title}</span>
      </div>

      <ul className="list-disc list-inside text-xs text-red-800 space-y-1 font-medium pl-1">
        {errorEntries.map(([field, err]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              onClick={(e) => {
                e.preventDefault();
                const elem = document.getElementById(field);
                elem?.focus();
              }}
              className="hover:underline font-semibold focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1"
            >
              {err?.message ? String(err.message) : `Invalid ${field}`}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
