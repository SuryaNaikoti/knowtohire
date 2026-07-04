import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) => {
  // Variant styles mapping
  const variants = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200/60',
    secondary: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    accent: 'bg-orange-50 text-orange-700 border-orange-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Size styles mapping
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border border-solid transition-all duration-150 select-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
