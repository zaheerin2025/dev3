import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Dark brand section (#05130e). */
  dark?: boolean;
  /** Deep dark gradient variant. */
  darkDeep?: boolean;
  /** Light emerald tint background. */
  tinted?: boolean;
  /** Subtle grid pattern background (light sections). */
  grid?: boolean;
  /** Dot pattern for dark sections. */
  dots?: boolean;
  /** Remove default vertical padding. */
  noPad?: boolean;
}

/** Consistent page section with centered container and vertical rhythm. */
export function Section({
  children,
  className,
  id,
  dark,
  darkDeep,
  tinted,
  grid,
  dots,
  noPad,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative w-full',
        !noPad && 'py-16 md:py-24',
        dark && 'section-dark',
        darkDeep && 'section-dark-deep',
        tinted && 'bg-emerald-50/50',
        grid && 'bg-grid-light',
        dots && 'bg-dots-dark',
        className
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
