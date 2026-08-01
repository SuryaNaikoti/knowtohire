import React from 'react';

export interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  eventName?: string;
  eventCategory?: string;
  eventLabel?: string;
  onTrackEvent?: (eventInfo: { name?: string; category?: string; label?: string }) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  className = '',
  eventName,
  eventCategory,
  eventLabel,
  onTrackEvent,
  ariaLabel,
  disabled = false,
  onKeyDown,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (onTrackEvent || eventName) {
      onTrackEvent?.({ name: eventName, category: eventCategory, label: eventLabel });
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onTrackEvent || eventName) {
        onTrackEvent?.({ name: eventName, category: eventCategory, label: eventLabel });
      }
      if (onClick) {
        onClick(e);
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative rounded-[24px] bg-white border border-slate-200 
        transition-all duration-300 ease-out transform
        ${onClick && !disabled ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2' : ''}
        ${disabled ? 'opacity-60 pointer-events-none' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
