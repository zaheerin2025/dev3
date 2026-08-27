'use client';

import * as React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { FAQSection } from '@/components/common/faq-section';
import { LeadForm } from '@/components/common/lead-form';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { JsonLd } from '@/components/common/json-ld';
import { comparisonTable, pricingFaqs, servicePricingBlocks, websiteTiers } from '@/data';
import { buildOfferCatalogSchema } from '@/lib/schema';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const QUOTE_PROMISES = [
  'Reply within 1 business day',
  'Fixed price for 30 days',
  'NDA on request',
];

/** /pricing — fixed, itemized price list for all services. */
export function PricingView() {
  return (
    <>
      <JsonLd data={buildOfferCatalogSchema(websiteTiers, servicePricingBlocks)} />

      {/* Hero */}
      <Section tinted>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Pricing' }]} />
          <h1 className="mt-6 text-3xl font-bold text-balance sm:text-5xl">Website &amp; Digital Pricing</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Wondering what a website development cost looks like in 2025? Here is our full price
            list — no &ldquo;contact us for pricing&rdquo; games. Every package is fixed and
            itemized, most projects ship in 2–4 weeks, and every quote starts with a free strategy
            call. Need something different? Custom quotes are free and take one business day.
          </p>
        </div>
      </Section>

      {/* Packages */}
      <Section>
        <SectionHeading
          eyebrow="Packages"
          title="Website Packages With Real Prices"
          description="Pick the package that matches your stage. Every tier is fixed-price, itemized, and delivered by senior developers and designers."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {websiteTiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 80} className="h-full">
              <Card
                className={cn(
                  'relative h-full rounded-2xl p-6 lg:p-8',
                  tier.highlighted && 'ring-2 ring-emerald-600'
                )}
              >
                {tier.highlighted ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950">
                    Most Popular
                  </Badge>
                ) : null}
                <CardContent className="flex h-full flex-col gap-4 p-0">
                  <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
                  <p>
                    <span className="text-4xl font-bold">{tier.price}</span>{' '}
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </p>
                  <p className="text-sm italic text-muted-foreground">Best for: {tier.bestFor}</p>
                  <p className="text-sm">{tier.blurb}</p>
                  <ul className="flex flex-col gap-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className="mt-auto h-11 w-full"
                    onClick={() => trackEvent('cta_click', { location: 'pricing', tier: tier.name })}
                  >
                    <Link href="/contact">
                      {tier.ctaLabel}
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Comparison table */}
        <Reveal className="mt-12">
          <h3 className="mb-6 text-center text-2xl font-bold sm:text-3xl">Compare Packages Side by Side</h3>
          <Card className="rounded-2xl p-6">
            <div className="custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Feature</TableHead>
                    <TableHead className="font-semibold">Starter</TableHead>
                    <TableHead className="font-semibold">Business</TableHead>
                    <TableHead className="font-semibold">E-commerce / Custom</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonTable.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium">{row.feature}</TableCell>
                      <TableCell className="text-muted-foreground">{row.starter}</TableCell>
                      <TableCell className="text-muted-foreground">{row.business}</TableCell>
                      <TableCell className="text-muted-foreground">{row.ecommerce}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </Reveal>
      </Section>

      {/* Other services */}
      <Section tinted>
        <SectionHeading
          eyebrow="Everything else"
          title="Simple Pricing For Every Service"
          description="One team for design, development, and growth — each service with a clear starting price."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicePricingBlocks.map((block, index) => (
            <Reveal key={block.serviceSlug} delay={index * 60} className="h-full">
              <Card className="h-full rounded-2xl p-6">
                <CardContent className="flex h-full flex-col gap-3 p-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <ServiceIconGlyph icon={block.icon} />
                  </span>
                  <h3 className="font-semibold">{block.name}</h3>
                  <p className="text-sm text-muted-foreground">{block.blurb}</p>
                  <p>
                    <span className="font-bold text-emerald-700">From {block.startingAt}</span>{' '}
                    <span className="text-xs text-muted-foreground">{block.unit}</span>
                  </p>
                  <Link
                    href={`/${block.serviceSlug}`}
                    className="mt-auto inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Learn more →
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <FAQSection faqs={pricingFaqs} title="Pricing FAQs" />
      </Section>

      {/* Quote form */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold text-balance sm:text-4xl">Get Your Custom Quote</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Tell us what you need and we will send an itemized, fixed quote — usually within one
              business day.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {QUOTE_PROMISES.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <Card className="rounded-2xl p-6">
              <LeadForm source="pricing" />
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
