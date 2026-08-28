'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Transition delay in ms (for staggering). */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

/**
 * Scroll-reveal wrapper: fades/slides content in when it enters the viewport.
 *
 * Safety model (fixes "blank sections" for crawlers / screenshots / no-JS):
 * 1. Server-rendered HTML is fully visible (no CSS hiding by default).
 * 2. After mount, the element is "armed" (hidden) ONLY if it is currently
 *    below the viewport — above-the-fold content never flashes.
 * 3. IntersectionObserver reveals it as it scrolls into view.
 * 4. A failsafe timer force-reveals any armed element after ~3.2s so content
 *    can never stay invisible (print, full-page captures, edge cases).
 * Respects prefers-reduced-motion via CSS.
 */
export function Reveal({ children, className, delay, as = 'div' }: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof IntersectionObserver === 'undefined' || reduced) {
      el.classList.add('is-visible');
      return;
    }

    const rect = el.getBoundingClientRect();
    const belowFold = rect.top > window.innerHeight * 0.9;

    if (belowFold) {
      el.classList.add('is-armed');
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
              observer.disconnect();
            }
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );
      observer.observe(el);

      // Failsafe: never leave content hidden for more than ~3.2s.
      const failsafe = window.setTimeout(() => el.classList.add('is-visible'), 3200 + (delay ?? 0));

      return () => {
        observer.disconnect();
        window.clearTimeout(failsafe);
      };
    }

    return undefined;
  }, [delay]);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
