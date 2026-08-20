import React from 'react';
import { cn } from '@/lib/utils';

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
    {children}
  </div>
);

export const Section: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, children, ...props }) => (
  <section className={cn("py-12 md:py-16", className)} {...props}>
    {children}
  </section>
);
