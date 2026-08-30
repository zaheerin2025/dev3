import * as React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs, type BreadcrumbEntry } from './breadcrumbs';
import { Reveal } from './reveal';

interface PageHeroProps {
  eyebrow?: string;
  /** H1 content — supports `**accent**` markup for brand-colored words. */
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: BreadcrumbEntry[];
  /** CTA buttons rendered under the description. */
  actions?: React.ReactNode;
  /** Extra content below the actions (stat grids, search, filters…). */
  children?: React.ReactNode;
  /** Right-hand rail rendered on lg+ screens (desktop-only by design). */
  aside?: React.ReactNode;
  /** Surface tone — paper white (default) or warm cream. */
  tone?: 'white' | 'cream';
  className?: string;
}

/** Renders `**words**` inside a title string as the tangerine accent. */
function renderAccent(title: React.ReactNode) {
  if (typeof title !== 'string' || !title.includes('**')) return title;
  return title.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className="not-italic text-[#FF4D00]">
        {part}
      </em>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

/**
 * PAGE HERO — the one hero pattern used on every inner page: left-aligned
 * breadcrumbs, mono eyebrow, oversized grotesk H1, roomy description and
 * optional actions, with an optional right rail for related content.
 * Mirrors the service-detail hero so the whole site reads consistently.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  children,
  aside,
  tone = 'white',
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden pb-14 pt-10 md:pb-16 md:pt-14',
        tone === 'cream' ? 'section-cream' : 'section-white',
        className
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn('grid gap-10', aside && 'lg:grid-cols-12 lg:gap-8')}>
          {/* Left — all the page's primary content */}
          <div className={cn(aside && 'lg:col-span-7')}>
            <Reveal className="flex flex-col items-start">
              {crumbs?.length ? (
                <Breadcrumbs items={crumbs} className="text-sm [&_ol]:text-sm" />
              ) : null}
              {eyebrow ? (
                <p className={cn('eyebrow inline-flex items-center gap-2.5', crumbs?.length ? 'mt-7' : '')}>
                  <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className={cn(
                  'text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-[#161613] sm:text-5xl lg:text-6xl',
                  eyebrow ? 'mt-4' : crumbs?.length ? 'mt-7' : ''
                )}
              >
                {renderAccent(title)}
              </h1>
              {description ? (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6f6e66] sm:text-xl">
                  {description}
                </p>
              ) : null}
              {actions ? (
                <div className="mt-8 flex flex-wrap items-center gap-3.5">{actions}</div>
              ) : null}
            </Reveal>
            {children ? <div className="mt-12 md:mt-14">{children}</div> : null}
          </div>

          {/* Right — related content rail (desktop) */}
          {aside ? (
            <div className="lg:col-span-5 lg:border-l lg:border-[#e6e5de] lg:pl-10">{aside}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
