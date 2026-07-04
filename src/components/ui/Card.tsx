import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  overflowVisible?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  overflowVisible = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 border-solid shadow-sm transition-all duration-300 ${
        overflowVisible ? 'overflow-visible' : 'overflow-hidden'
      } ${
        hoverEffect ? 'hover:shadow-md hover:-translate-y-1 hover:border-slate-300/85' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-lg font-bold font-heading text-gray-900 tracking-tight leading-none ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-sm text-gray-500 font-normal leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pt-0 flex items-center border-t border-gray-100 border-solid mt-auto ${className}`} {...props}>
      {children}
    </div>
  );
};
