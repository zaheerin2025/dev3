'use client';

import * as React from 'react';
import { ExternalLink, Inbox } from 'lucide-react';
import { CaseStudyCard, CATEGORY_LABELS } from '@/components/common/case-study-card';
import { CTABand } from '@/components/common/cta-band';
import { Reveal } from '@/components/common/reveal';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { caseStudies } from '@/data';
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

interface PortfolioItem {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  imageUrl: string | null;
  order: number;
  published: boolean;
}

/** Client websites straight from the database (managed in /#/admin → Portfolio). */
function WebsiteGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="relative mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <Reveal key={item.id} delay={(index % 3) * 60}>
          <article className="card-surface card-hover group flex h-full flex-col overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/10] overflow-hidden bg-purple-50">
              {item.imageUrl ? (
                 
                <img
                  src={item.imageUrl}
                  alt={`${item.title} website screenshot`}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {item.category}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-600">
                {item.category}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-auto pt-5">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('portfolio_visit', { title: item.title })}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-purple-600 transition-colors hover:text-purple-800"
                >
                  Visit website
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

/** Portfolio hub: live client websites (from the DB) + full case studies. */
export function PortfolioView() {
  const [active, setActive] = React.useState<CategoryFilter>('all');
  const [sites, setSites] = React.useState<PortfolioItem[] | null>(null);

  // Load admin-managed client websites; empty/failed fetch → static fallback only.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/public/portfolios', { cache: 'no-store' });
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          portfolios?: PortfolioItem[];
        } | null;
        if (!cancelled && payload?.ok && Array.isArray(payload.portfolios)) {
          // The API already returns only published items, newest ordering applied.
          setSites(payload.portfolios);
        }
      } catch {
        // Static case studies remain the content.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      {/* Hero */}
      <Section grid className="md:pt-20">
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb left-[-10rem] top-[-9rem] h-[26rem] w-[26rem] bg-purple-300/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-10rem] top-1/4 h-80 w-80 bg-pink-300/20"
          aria-hidden="true"
        />
        <span
          className="glow-orb bottom-[-10rem] left-1/3 h-80 w-80 bg-purple-200/30"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <div className="flex flex-col items-center gap-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-600">
              Featured Work
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Our <span className="text-gradient">Portfolio</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Real projects for real clients — live websites you can visit right now, plus case
              studies with measurable results and the full story behind them.
            </p>
          </div>
        </Reveal>

        {/* Live client websites (admin-managed) */}
        {sites && sites.length > 0 ? (
          <div className="relative mt-14">
            <SectionHeading
              eyebrow="Client Websites"
              title="Live Sites We **Built & Shipped**"
              description="Real, working websites — open any of them and kick the tires."
            />
            <WebsiteGrid items={sites} />
          </div>
        ) : null}

        {/* Case studies filter bar */}
        <div className="relative mt-16 flex flex-col items-center gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-600">
            Case Studies
          </p>
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
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-[0_8px_20px_-8px_rgb(124_58_237/0.65)] hover:from-purple-500 hover:to-pink-500'
                      : 'bg-white text-foreground/70 ring-1 ring-inset ring-purple-900/10 hover:text-purple-800 hover:ring-purple-500/30'
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
          <div className="relative mt-10 flex flex-col items-center gap-4 rounded-[1.5rem] border border-dashed border-purple-900/15 bg-white/60 px-6 py-16 text-center">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-600/15"
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

export default PortfolioView;
