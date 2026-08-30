'use client';

import {
  BadgeCheck,
  Check,
  Clock3,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CaseStudyCard } from '@/components/common/case-study-card';
import { FAQSection } from '@/components/common/faq-section';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { JsonLd } from '@/components/common/json-ld';
import { QuoteBuilder } from '@/components/common/quote-builder';
import { Link } from '@/components/common/link';
import { ProcessSteps } from '@/components/common/process-steps';
import { Reveal } from '@/components/common/reveal';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { ServiceCard } from '@/components/common/service-card';
import { TechPills } from '@/components/common/tech-pills';
import { getRelatedServices, getService, getServiceCaseStudies } from '@/data';
import { trackEvent } from '@/lib/analytics';
import { buildServiceSchema } from '@/lib/schema';

const PRICING_GUARANTEES = [
  'Fixed, itemized quote before we start',
  'No hidden fees or surprise invoices',
  'Free strategy call included',
];

const LEAD_PROMISES = ['Free consultation', 'NDA on request', 'No obligation'];

/** Lucide icons cycled across the "why" benefit rows. */
const WHY_BENEFIT_ICONS: LucideIcon[] = [TrendingUp, ShieldCheck, Clock3, BadgeCheck, Zap, Users];

/**
 * Splits the H1 so the service keyword phrase carries the brand gradient.
 * Tries the full service name, then progressively shorter prefixes (min. two
 * words) so phrases like "Website Maintenance & Support" still match their
 * mention inside the hero title. Falls back to the first up-to-3 words.
 * The returned tuple keeps the title text byte-for-byte intact.
 */
function splitHeroTitle(title: string, phrase: string): [string, string, string] {
  const lower = title.toLowerCase();
  const phraseWords = phrase.split(' ');
  for (let len = Math.min(phraseWords.length, 4); len >= 2; len -= 1) {
    const candidate = phraseWords.slice(0, len).join(' ').toLowerCase();
    const idx = lower.indexOf(candidate);
    if (idx === -1) continue;
    const end = idx + candidate.length;
    const boundaryBefore = idx === 0 || lower[idx - 1] === ' ';
    const boundaryAfter = end === lower.length || lower[end] === ' ';
    if (boundaryBefore && boundaryAfter) {
      return [title.slice(0, idx), title.slice(idx, end), title.slice(end)];
    }
  }
  const words = title.split(' ');
  const head = words.slice(0, Math.min(3, words.length)).join(' ');
  const tail = words.length > 3 ? ` ${words.slice(3).join(' ')}` : '';
  return ['', head, tail];
}

/** SEO landing template for a single service (e.g. /web-development). */
export function ServiceDetailView({ slug }: { slug: string }) {
  const service = getService(slug);

  if (!service) {
    return (
      <Section>
        <h1 className="text-4xl font-bold sm:text-5xl">Service not found</h1>
        <p className="mt-4 max-w-2xl text-xl text-muted-foreground">
          The service you are looking for does not exist or may have moved. Explore our full range of services from the homepage.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </Section>
    );
  }

  const relatedStudies = getServiceCaseStudies(service);
  const relatedServices = getRelatedServices(service);
  const [heroBefore, heroAccent, heroAfter] = splitHeroTitle(service.heroTitle, service.name);

  return (
    <>
      {/* 1 — Hero */}
      <Section grid className="lg:py-20">
        <JsonLd data={buildServiceSchema(service)} />
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] bg-gray-300/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-12rem] top-1/3 h-96 w-96 bg-gray-300/20"
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col items-start gap-5">
              <Breadcrumbs
                className="text-sm [&_ol]:text-sm"
                items={[{ label: 'Services', href: '/services' }, { label: service.name }]}
              />
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gray-800">
                {service.category === 'development' ? 'Development Service' : 'Growth Service'}
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {heroBefore}
                <span className="text-gradient">{heroAccent}</span>
                {heroAfter}
              </h1>
              <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">{service.heroSub}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  asChild
                  onClick={() => trackEvent('cta_click', { location: 'service-hero', service: slug })}
                >
                  <Link href="/contact">Get Free Quote</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Decorative service panel with gradient hairline frame */}
          <Reveal delay={150} className="relative">
            <span
              className="glow-orb bottom-0 right-0 h-80 w-80 bg-gray-400/30"
              aria-hidden="true"
            />
            <div className="gradient-frame shadow-[0_32px_64px_-32px_rgb(4_16_11/0.35)]">
              <div className="section-dark-deep bg-dots-dark relative flex h-full flex-col gap-6 overflow-hidden rounded-[1.45rem] p-8 sm:p-10">
                <span
                  className="glow-orb -right-16 -top-20 h-56 w-56 bg-gray-400/25"
                  aria-hidden="true"
                />
                <div className="relative flex items-center gap-4">
                  <span className="icon-tile h-16 w-16 shrink-0">
                    <ServiceIconGlyph icon={service.icon} className="h-8 w-8" />
                  </span>
                  <h2 className="text-3xl font-bold text-white">{service.name}</h2>
                </div>
                <ul className="relative flex flex-col gap-2.5">
                  {service.offerings.slice(0, 3).map((offering) => (
                    <li
                      key={offering.title}
                      className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-2.5 text-base font-medium text-slate-100 ring-1 ring-inset ring-white/10"
                    >
                      <Check className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
                      {offering.title}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-auto border-t border-white/10 pt-5">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-gray-300/80">
                    Starting at
                  </p>
                  <p className="text-gradient-soft mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {service.startingPrice}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 2 — What we offer */}
      <Section>
        <SectionHeading
          eyebrow="What we offer"
          title="What's Included"
          description="Every engagement ships with the same senior standard — here is exactly what you get."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {service.offerings.map((offering, index) => (
            <Reveal key={offering.title} delay={(index % 3) * 60} className="h-full">
              <div className="card-surface card-hover relative h-full rounded-[1.25rem] p-6">
                <span
                  className="absolute right-6 top-5 font-display text-base font-bold tracking-[0.2em] text-gray-900/15"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="icon-tile h-10 w-10">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{offering.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{offering.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3 — Why this service */}
      <Section tinted>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <SectionHeading
            align="left"
            eyebrow="Why it matters"
            title={service.whyTitle}
            description={service.whyIntro}
            className="lg:sticky lg:top-28 lg:mb-0 lg:w-[38%] lg:shrink-0"
          />
          <div className="flex flex-1 flex-col gap-4">
            {service.whyBenefits.map((benefit, index) => {
              const Icon = WHY_BENEFIT_ICONS[index % WHY_BENEFIT_ICONS.length];
              return (
                <Reveal key={benefit.title} delay={index * 60} className="h-full">
                  <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(5_19_14/0.04)] ring-1 ring-inset ring-gray-800/10">
                    <span className="icon-tile h-10 w-10 shrink-0">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 4 — Process */}
      <Section dark dots>
        <span
          className="glow-orb left-1/2 top-[-8rem] h-96 w-96 -translate-x-1/2 bg-gray-500/20"
          aria-hidden="true"
        />
        <SectionHeading dark className="relative" eyebrow="Our process" title="How We Deliver" />
        <ProcessSteps steps={service.process} dark />
      </Section>

      {/* 5 — Technologies */}
      <Section>
        <SectionHeading
          eyebrow="Tools"
          title="Technologies & Tools We Use"
          description="Battle-tested platforms and frameworks — chosen for speed, reliability, and easy handover."
        />
        <TechPills items={service.technologies} />
      </Section>

      {/* 6 — Portfolio samples */}
      <Section>
        <SectionHeading
          eyebrow="Proof"
          title="Related Case Studies"
          description={
            relatedStudies.length > 0 ? 'Selected projects delivered through this service.' : undefined
          }
        />
        {relatedStudies.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedStudies.map((study, index) => (
              <Reveal key={study.slug} delay={(index % 3) * 60} className="h-full">
                <CaseStudyCard study={study} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">New case studies for this service are coming soon.</p>
        )}
        <Reveal className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/portfolio">Browse All Projects</Link>
          </Button>
        </Reveal>
      </Section>

      {/* 7 — Pricing */}
      <Section>
        <Reveal>
          <div className="gradient-frame shadow-[0_24px_56px_-28px_rgb(4_16_11/0.28)]">
            <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-white p-6 sm:p-8 lg:p-10">
              <span
                className="glow-orb -right-20 -top-24 h-64 w-64 bg-gray-300/25"
                aria-hidden="true"
              />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-800">Pricing</p>
                  <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">{service.name} Pricing</h2>
                  <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-base font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Starting at
                    </span>
                    <span className="text-gradient font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
                      {service.startingPrice}
                    </span>
                  </p>
                  <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{service.pricingNote}</p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {PRICING_GUARANTEES.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gray-800" aria-hidden="true" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 lg:w-56">
                  <Button
                    size="lg"
                    asChild
                    onClick={() => trackEvent('cta_click', { location: 'service-pricing', service: slug })}
                  >
                    <Link href="/contact">Get Free Quote</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/pricing">See Full Pricing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 9 — FAQ */}
      <Section tinted>
        <FAQSection faqs={service.faqs} />
      </Section>

      {/* 10 — Related services */}
      {relatedServices.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Keep exploring" title="Related Services" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((related, index) => (
              <Reveal key={related.slug} delay={(index % 3) * 60} className="h-full">
                <ServiceCard service={related} showPrice />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 11 — Lead form */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="text-4xl font-bold text-balance sm:text-5xl">
              Get Your Free <span className="text-gradient">{service.shortName}</span> Quote
            </h2>
            <p className="mt-4 max-w-xl text-xl leading-relaxed text-muted-foreground">
              Tell us about your project — we reply within one business day with a fixed, itemized quote.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {LEAD_PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-inset ring-gray-800/15">
                    <Check className="h-4 w-4 text-gray-800" aria-hidden="true" />
                  </span>
                  <span className="text-base font-medium text-foreground">{promise}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <QuoteBuilder source={`service:${service.slug}`} defaultService={service.slug} variant="full" />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
