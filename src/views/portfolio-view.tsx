'use client';

import * as React from 'react';
import { Building2, FolderKanban, Inbox, Star } from 'lucide-react';
import { CaseStudyCard, CATEGORY_LABELS } from '@/components/common/case-study-card';
import { CTABand } from '@/components/common/cta-band';
import { Reveal } from '@/components/common/reveal';
import { Section } from '@/components/common/section';
import { caseStudies, testimonials } from '@/data';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { CaseStudyCategory } from '@/lib/types';

type CategoryFilter = 'all' | CaseStudyCategory;

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'web', label: CATEGORY_LABELS.web },
  { value: 'ecommerce', label: CATEGORY_LABELS.ecommerce },
  { value: 'apps', label: CATEGORY_LABELS.apps },
  { value: 'marketing', label: CATEGORY_LABELS.marketing },
];

/** Portfolio hub with category filtering and links to full case studies. */
export function PortfolioView() {
  const [active, setActive] = React.useState<CategoryFilter>('all');

  const counts = React.useMemo(() => {
    const map: Record<CategoryFilter, number> = {
      all: caseStudies.length,
      web: 0,
      ecommerce: 0,
      apps: 0,
      marketing: 0,
    };
    for (const study of caseStudies) {
      map[study.category] += 1;
    }
    return map;
  }, []);

  // Honest, data-derived hero stats (no hard-coded marketing numbers).
  const industryCount = React.useMemo(
    () => new Set(caseStudies.map((study) => study.industry)).size,
    []
  );

  const averageRating = React.useMemo(() => {
    if (testimonials.length === 0) return null;
    const total = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
    return total / testimonials.length;
  }, []);

  const filtered =
    active === 'all' ? caseStudies : caseStudies.filter((study) => study.category === active);

  return (
    <>
      {/* Hero */}
      <Section grid className="md:pt-20">
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb left-[-10rem] top-[-9rem] h-[26rem] w-[26rem] bg-blue-300/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-10rem] top-1/4 h-80 w-80 bg-cyan-300/20"
          aria-hidden="true"
        />
        <span
          className="glow-orb bottom-[-10rem] left-1/3 h-80 w-80 bg-blue-200/30"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <div className="flex flex-col items-center gap-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
              <span
                className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-blue-500"
                aria-hidden="true"
              />
              Featured Work
            </span>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Our <span className="text-gradient">Portfolio</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Real projects for real clients — every case study below includes measurable results and the
              full story behind them. Click any project to read the complete write-up, from challenge to
              solution to outcome.
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground">
                <FolderKanban className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {caseStudies.length} featured projects
              </span>
              <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {industryCount} industries
              </span>
              {averageRating !== null ? (
                <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {averageRating.toFixed(1)} client rating
                </span>
              ) : null}
            </div>
          </div>
        </Reveal>

        {/* Filter bar */}
        <div className="relative mt-12 flex flex-col items-center gap-4">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap justify-center gap-2.5"
          >
            {FILTERS.map((filter) => {
              const isActive = active === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActive(filter.value);
                    trackEvent('portfolio_filter', { category: filter.value });
                  }}
                  className={cn(
                    'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_8px_20px_-8px_rgb(13_148_136/0.65)] hover:from-blue-500 hover:to-cyan-500'
                      : 'bg-white text-foreground/70 ring-1 ring-inset ring-blue-900/10 hover:text-blue-800 hover:ring-blue-500/30'
                  )}
                >
                  {filter.label}
                  <span className={cn('text-xs', isActive ? 'opacity-80' : 'opacity-60')}>
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {/* Project grid */}
        {filtered.length > 0 ? (
          <div className="relative mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((study, index) => (
              <Reveal key={study.slug} delay={(index % 3) * 60}>
                <CaseStudyCard study={study} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="relative mt-10 flex flex-col items-center gap-4 rounded-[1.5rem] border border-dashed border-blue-900/15 bg-white/60 px-6 py-16 text-center">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/15"
              aria-hidden="true"
            >
              <Inbox className="h-5 w-5" />
            </span>
            <p className="text-muted-foreground">
              No projects in this category yet — check back soon.
            </p>
          </div>
        )}
      </Section>

      <CTABand title="Your Project Could Be Next" />
    </>
  );
}
