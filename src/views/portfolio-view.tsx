'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CaseStudyCard, CATEGORY_LABELS } from '@/components/common/case-study-card';
import { CTABand } from '@/components/common/cta-band';
import { Reveal } from '@/components/common/reveal';
import { Section } from '@/components/common/section';
import { caseStudies } from '@/data';
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

  const filtered =
    active === 'all' ? caseStudies : caseStudies.filter((study) => study.category === active);

  return (
    <>
      <Section className="md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-balance sm:text-5xl">Our Portfolio</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real projects for real clients — every case study below includes measurable results and the
            full story behind them. Click any project to read the complete write-up, from challenge to
            solution to outcome.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap justify-center gap-2"
          >
            {FILTERS.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={active === filter.value ? 'default' : 'outline'}
                aria-pressed={active === filter.value}
                className="h-11 rounded-full px-5 sm:h-9 sm:px-4"
                onClick={() => {
                  setActive(filter.value);
                  trackEvent('portfolio_filter', { category: filter.value });
                }}
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-70">{counts[filter.value]}</span>
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((study, index) => (
              <Reveal key={study.slug} delay={(index % 3) * 60}>
                <CaseStudyCard study={study} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-muted-foreground">
            No projects in this category yet — check back soon.
          </p>
        )}
      </Section>

      <CTABand title="Your Project Could Be Next" />
    </>
  );
}
