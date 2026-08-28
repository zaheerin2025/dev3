import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Deep ink-green brand section with gradient + glow. */
  dark?: boolean;
  /** Kept for API compatibility — renders the same deep dark variant. */
  darkDeep?: boolean;
  /** Dark variant with dot pattern layered. */
  dots?: boolean;
  /** Light emerald wash background. */
  tinted?: boolean;
  /** Subtle fading grid pattern background (light sections). */
  grid?: boolean;
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
        'relative w-full overflow-hidden',
        !noPad && 'py-16 md:py-24',
        (dark || darkDeep) && 'section-dark-deep',
        tinted && 'section-tint',
        dots && 'bg-dots-dark',
        className
      )}
    >
      {/* Decorative grid layer — separate element so its mask never fades content */}
      {grid ? (
        <span className="bg-grid-light pointer-events-none absolute inset-0" aria-hidden="true" />
      ) : null}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
