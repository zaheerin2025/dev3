'use client';

import * as React from 'react';
import { ExternalLink, Inbox } from 'lucide-react';
import { CaseStudyCard, CATEGORY_LABELS } from '@/components/common/case-study-card';
import { CTABand } from '@/components/common/cta-band';
import { PageHero } from '@/components/common/page-hero';
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
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              {item.imageUrl ? (
                 
                <img
                  src={item.imageUrl}
                  alt={`${item.title} website screenshot`}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-base text-muted-foreground">
                  {item.category}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-800">
                {item.category}
              </p>
              <h3 className="mt-2 text-xl font-bold leading-snug">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-auto pt-5">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('portfolio_visit', { title: item.title })}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-base font-bold text-gray-800 transition-colors hover:text-gray-900"
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

const DEFAULT_PORTFOLIOS: PortfolioItem[] = [
  {
    id: 'lumina-boutique',
    title: 'Lumina Boutique — E-Commerce Platform',
    url: 'https://developers3.com/portfolio/lumina-boutique',
    description: 'High-converting Shopify e-commerce store with automated email flows, instant search, and localized checkout.',
    category: 'E-Commerce',
    imageUrl: '/images/portfolio/lumina-boutique.png',
    order: 1,
    published: true,
  },
  {
    id: 'meridian-dental',
    title: 'Meridian Dental — Patient Portal & Booking',
    url: 'https://developers3.com/portfolio/meridian-dental',
    description: 'Custom Next.js clinic website with online booking, SMS appointment reminders, and patient intake forms.',
    category: 'Website',
    imageUrl: '/images/portfolio/meridian-dental.png',
    order: 2,
    published: true,
  },
  {
    id: 'pulsefit',
    title: 'PulseFit — Health & Fitness Tracker App',
    url: 'https://developers3.com/portfolio/pulsefit',
    description: 'Cross-platform Flutter mobile app featuring workout tracking, real-time metrics, and Apple Health / Google Fit sync.',
    category: 'Mobile App',
    imageUrl: '/images/portfolio/pulsefit.png',
    order: 3,
    published: true,
  },
  {
    id: 'vantage-realty',
    title: 'Vantage Realty — Interactive Property Search',
    url: 'https://developers3.com/portfolio/vantage-realty',
    description: 'Real estate portal with map-based property search, virtual tours, and automated lead routing.',
    category: 'Website',
    imageUrl: '/images/portfolio/vantage-realty.png',
    order: 4,
    published: true,
  },
];

/** Portfolio hub: live client websites (from the DB) + full case studies. */
export function PortfolioView() {
  const [active, setActive] = React.useState<CategoryFilter>('all');
  const [sites, setSites] = React.useState<PortfolioItem[]>(DEFAULT_PORTFOLIOS);

  // Load admin-managed client websites; updates state when DB items are fetched.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/public/portfolios', { cache: 'no-store' });
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          portfolios?: PortfolioItem[];
        } | null;
        if (!cancelled && payload?.ok && Array.isArray(payload.portfolios) && payload.portfolios.length > 0) {
          setSites(payload.portfolios);
        }
      } catch {
        // Keeps default portfolios on network/server error
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
      {/* Hero — same left-aligned pattern as every page */}
      <PageHero
        eyebrow="Featured Work"
        title="Our **Portfolio**"
        description="Real projects for real clients — live websites you can visit right now, plus case studies with measurable results and the full story behind them."
        crumbs={[{ label: 'Portfolio' }]}
      />

      {/* Live client websites (admin-managed with instant fallback) */}
      <Section className="py-10">
        <SectionHeading
          eyebrow="Client Websites"
          title="Live Sites We **Built & Shipped**"
          description="Real, working websites — open any of them and kick the tires."
        />
        <WebsiteGrid items={sites} />
      </Section>

      {/* Case studies */}
      <Section>
        <SectionHeading
          eyebrow="Case Studies"
          title="The Stories Behind **The Results**"
          description="Filter by category — every study includes the full build story and the measurable outcome."
          className="mb-8"
        />
        <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Filter projects by category">
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
                    'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-[#161613] text-white hover:bg-[#161613]'
                      : 'bg-white text-foreground/70 ring-1 ring-inset ring-gray-900/10 hover:text-gray-900 hover:ring-gray-500/30'
                  )}
                >
                  {filter.label}
                  <span className={cn('text-sm', isActive ? 'opacity-80' : 'opacity-60')}>
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-base text-muted-foreground" aria-live="polite">
            Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </p>

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
          <div className="relative mt-10 flex flex-col items-center gap-4 rounded-[1.5rem] border border-dashed border-gray-900/15 bg-white/60 px-6 py-16 text-center">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-800/15"
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
