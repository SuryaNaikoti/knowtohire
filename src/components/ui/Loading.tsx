import React from 'react';

// Spinner Component
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: 'h-4 w-4 stroke-[3px]',
    md: 'h-8 w-8 stroke-[2px]',
    lg: 'h-12 w-12 stroke-[2px]',
  };

  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Shimmer Skeleton Component
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  count = 1,
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';

  const variants = {
    text: 'h-4 w-full rounded-md',
    rect: 'h-24 w-full rounded-xl',
    circle: 'h-12 w-12 rounded-full shrink-0',
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variants[variant]} ${className}`}
        />
      ))}
    </div>
  );
};

// Loading Overlay Component
export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading dashboard intelligence...',
}) => {
  return (
    <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-40 flex flex-col items-center justify-center animate-fade-in-up">
      <div className="flex flex-col items-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-gray-500 tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export interface LoadingProps {
  label?: string;
}

export const Loading: React.FC<LoadingProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 w-full">
      <Spinner size="md" />
      <p className="text-xs font-bold text-gray-500 tracking-wide">{label}</p>
    </div>
  );
};
