'use client';

import * as React from 'react';
import {
  ArrowRight,
  Blocks,
  Check,
  Clock,
  FileCheck2,
  Files,
  LayoutTemplate,
  LifeBuoy,
  Lock,
  Puzzle,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { FAQSection } from '@/components/common/faq-section';
import { QuoteBuilder } from '@/components/common/quote-builder';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { JsonLd } from '@/components/common/json-ld';
import { comparisonTable, pricingFaqs, servicePricingBlocks, websiteTiers } from '@/data';
import { buildOfferCatalogSchema } from '@/lib/schema';
import { trackEvent } from '@/lib/analytics';
import { useSiteSettings } from '@/lib/use-site-settings';
import { cn } from '@/lib/utils';
import type { PricingBlock, PricingTier } from '@/lib/types';

const QUOTE_PROMISES = [
  'Reply within 1 business day',
  'Fixed price for 30 days',
  'NDA on request',
];

const QUOTE_PROMISE_ICONS = [Clock, FileCheck2, Lock];

const HOW_IT_WORKS_STEPS = ['Pick a package', 'Free discovery call', 'Fixed quote & kickoff'];

const PRICE_MOVERS = [
  {
    icon: LayoutTemplate,
    title: 'Page count & design',
    text: 'More pages and fully custom visuals add design hours.',
  },
  {
    icon: Puzzle,
    title: 'Custom functionality',
    text: 'Bookings, portals and checkout flows go beyond templates.',
  },
  {
    icon: Blocks,
    title: 'Integrations',
    text: 'CRMs, payments and shipping APIs add setup and testing.',
  },
  {
    icon: Files,
    title: 'Content volume',
    text: 'Large catalogues and copywriting extend the timeline.',
  },
];

const SUPPORT_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Fixed-price guarantee',
    text: 'The quote we sign is the invoice you pay — no surprise line items.',
  },
  {
    icon: Clock,
    title: 'On-time delivery',
    text: 'Launch dates are committed in writing and reviewed weekly.',
  },
  {
    icon: LifeBuoy,
    title: 'Ongoing support',
    text: 'Free post-launch support with every package, plus optional care plans.',
  },
];

/** Shared tier card body — the highlighted tier gets a different visual wrapper. */
function TierContent({ tier }: { tier: PricingTier }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
      <p>
        <span className="text-gradient font-display text-4xl font-bold tracking-tight">
          {tier.price}
        </span>{' '}
        <span className="text-sm text-muted-foreground">{tier.period}</span>
      </p>
      <p className="text-sm italic text-muted-foreground">Best for: {tier.bestFor}</p>
      <p className="text-sm">{tier.blurb}</p>
      <ul className="flex flex-col gap-2.5">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-800/15">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        size="lg"
        variant={tier.highlighted ? 'default' : 'outline'}
        className="mt-auto w-full"
        onClick={() => trackEvent('cta_click', { location: 'pricing', tier: tier.name })}
      >
        <Link href="/contact">
          {tier.ctaLabel}
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

/** Comparison cell: check for included values, muted dash otherwise, copy intact. */
function ComparisonCell({ value }: { value: string }) {
  if (value === 'Included') {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
        <Check className="h-4 w-4" aria-hidden="true" />
        {value}
      </span>
    );
  }
  if (value === '—') {
    return <span className="text-muted-foreground/40">{value}</span>;
  }
  return <span>{value}</span>;
}

/** /pricing — fixed, itemized price list for all services. */
export function PricingView() {
  // Admin-editable pricing overrides (fall back to the static data when unset
  // or when the saved JSON does not parse). See the admin panel Pricing tab.
  const settings = useSiteSettings((s) => s.settings);
  const tiers = React.useMemo<PricingTier[]>(() => {
    const raw = settings['pricing.websiteTiers'];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PricingTier[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Malformed JSON — keep the static tiers.
      }
    }
    return websiteTiers;
  }, [settings]);
  const blocks = React.useMemo<PricingBlock[]>(() => {
    const raw = settings['pricing.servicePricingBlocks'];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PricingBlock[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Malformed JSON — keep the static blocks.
      }
    }
    return servicePricingBlocks;
  }, [settings]);

  return (
    <>
      <JsonLd data={buildOfferCatalogSchema(tiers, blocks)} />

      {/* Hero */}
      <Section grid className="lg:py-20">
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb left-[-10rem] top-[-9rem] h-[26rem] w-[26rem] bg-gray-300/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-11rem] top-1/3 h-96 w-96 bg-gray-300/20"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Pricing' }]} />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-800">
            Simple, fixed pricing
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Website &amp; <span className="text-gradient">Digital Pricing</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Real prices, published up front. Pick a package, book a free call, and get a fixed,
            itemized quote within one business day.
          </p>
        </div>
      </Section>

      {/* Packages */}
      <Section tinted>
        <SectionHeading
          eyebrow="Packages"
          title="Website Packages With **Real Prices**"
          description="Pick the package that matches your stage. Every tier is fixed-price, itemized, and delivered by senior developers and designers."
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 80} className="h-full">
              {tier.highlighted ? (
                <div className="relative h-full lg:scale-[1.04]">
                  <div className="gradient-frame h-full shadow-[0_28px_56px_-28px_rgb(0_0_0/0.5)]">
                    <span className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-gray-500 to-gray-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      Most Popular
                    </span>
                    <div className="h-full rounded-[1.45rem] bg-gradient-to-b from-gray-100/80 to-white p-8">
                      <TierContent tier={tier} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-surface h-full rounded-[1.5rem] p-8">
                  <TierContent tier={tier} />
                </div>
              )}
            </Reveal>
          ))}
        </div>

        {/* How it works — 3-step strip */}
        <Reveal className="mt-10">
          <div className="card-surface rounded-[1.5rem] p-6 sm:p-8">
            <h3 className="text-center font-display text-lg font-bold sm:text-xl">
              How it works in <span className="text-gradient">3 steps</span>
            </h3>
            <ol className="mt-6 grid gap-5 sm:grid-cols-3 sm:gap-4">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3.5 sm:flex-col sm:gap-3 sm:text-center"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-400 font-display text-base font-bold text-white shadow-[0_8px_20px_-8px_rgb(0_0_0/0.6)]"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold sm:text-[15px]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Comparison table */}
        <Reveal className="mt-12">
          <h3 className="mb-6 text-center text-2xl font-bold text-balance sm:text-3xl">
            Compare Packages <span className="text-gradient">Side by Side</span>
          </h3>
          <div className="card-surface overflow-hidden rounded-[1.5rem]">
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gray-100/70">
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-900"
                    >
                      Feature
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-900"
                    >
                      Starter
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-900"
                    >
                      Business
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-900"
                    >
                      E-commerce / Custom
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/[0.06]">
                  {comparisonTable.map((row, rowIndex) => (
                    <tr
                      key={row.feature}
                      className={cn(
                        'transition-colors hover:bg-gray-100/60',
                        rowIndex % 2 === 1 && 'bg-gray-100/40'
                      )}
                    >
                      <th
                        scope="row"
                        className={cn(
                          'sticky left-0 z-10 px-6 py-4 text-left font-medium text-foreground',
                          rowIndex % 2 === 1 ? 'bg-gray-100' : 'bg-white'
                        )}
                      >
                        {row.feature}
                      </th>
                      <td className="px-6 py-4 text-muted-foreground">
                        <ComparisonCell value={row.starter} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <ComparisonCell value={row.business} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <ComparisonCell value={row.ecommerce} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* What moves the price */}
      <Section>
        <SectionHeading
          eyebrow="Scope factors"
          title="What **Moves the Price**"
          description="Four things shape every quote. Fix these during scoping and the number we sign never changes."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICE_MOVERS.map((mover, index) => {
            const Icon = mover.icon;
            return (
              <Reveal key={mover.title} delay={index * 60} className="h-full">
                <div className="card-surface card-hover h-full rounded-[1.25rem] p-6">
                  <span className="icon-tile h-11 w-11">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold">{mover.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {mover.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Other services */}
      <Section tinted>
        <SectionHeading
          eyebrow="Everything else"
          title="Simple Pricing For **Every Service**"
          description="One team for design, development, and growth — each service with a clear starting price."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blocks.map((block, index) => (
            <Reveal key={block.serviceSlug} delay={index * 60} className="h-full">
              <div className="card-surface card-hover flex h-full flex-col gap-3 rounded-[1.25rem] p-6">
                <span className="icon-tile h-10 w-10">
                  <ServiceIconGlyph icon={block.icon} className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{block.name}</h3>
                <p className="text-sm text-muted-foreground">{block.blurb}</p>
                <p>
                  <span className="font-display text-lg font-bold text-gray-800">
                    From {block.startingAt}
                  </span>{' '}
                  <span className="text-xs text-muted-foreground">{block.unit}</span>
                </p>
                <Link
                  href={`/${block.serviceSlug}`}
                  className="mt-auto inline-flex min-h-11 items-center text-sm font-semibold text-gray-800 transition-colors hover:text-gray-900"
                >
                  Learn more →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Guarantees + FAQ */}
      <Section>
        <Reveal className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-balance sm:text-3xl">
            Every Project, <span className="text-gradient">Protected</span>
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {SUPPORT_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={index * 60} className="h-full">
                <div className="card-surface flex h-full items-start gap-4 rounded-[1.25rem] p-5">
                  <span className="icon-tile h-10 w-10 shrink-0">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {card.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-14">
          <FAQSection faqs={pricingFaqs} title="Pricing FAQs" columns={2} />
        </div>
      </Section>

      {/* Quote form */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold text-balance sm:text-4xl">
              Get Your <span className="text-gradient">Custom Quote</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Tell us what you need and we will send an itemized, fixed quote — usually within one
              business day.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {QUOTE_PROMISES.map((item, index) => {
                const Icon = QUOTE_PROMISE_ICONS[index];
                return (
                  <li
                    key={item}
                    className="card-surface flex items-center gap-3.5 rounded-2xl p-4"
                  >
                    <span className="icon-tile h-10 w-10 shrink-0">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <QuoteBuilder source="pricing" variant="full" />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
