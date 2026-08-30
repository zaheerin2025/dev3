'use client';

import { CalendarCheck, ReceiptText, Rocket, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CTABand } from '@/components/common/cta-band';
import { ServiceCard } from '@/components/common/service-card';
import { StatGrid } from '@/components/common/stat-grid';
import { services } from '@/data';
import { site } from '@/lib/site';
import { trackEvent } from '@/lib/analytics';

const HUB_INTRO =
  'Developers3 is a full-service web development company covering every stage of your digital presence — from custom website development and WordPress builds to e-commerce development, custom software, and mobile apps. Alongside engineering, our designers deliver UI/UX design services, while our growth team drives results with SEO, Google Ads management, and social media marketing. Every service comes with the same promise: senior specialists doing the work, fixed and transparent pricing, and measurable outcomes reported against your business goals. Whether you need a five-page local business site, a national e-commerce platform, or ongoing website maintenance and support, you get one accountable team — and a free, itemized quote before anything starts. Explore each service below for deliverables, process, pricing, and case studies.';

/** "How engagements work" mini strip. */
const ENGAGEMENT_STEPS: { icon: LucideIcon; label: string; hint: string }[] = [
  { icon: CalendarCheck, label: 'Book a call', hint: 'Free 30-minute strategy session' },
  { icon: ReceiptText, label: 'Get a fixed quote', hint: 'Itemized — no surprises' },
  { icon: Rocket, label: 'Launch in weeks', hint: 'Not months — senior team only' },
];

function ServicesHubView() {
  const buildServices = services.filter(
    (service) => service.category === 'development' || service.category === 'design'
  );
  const growServices = services.filter(
    (service) => service.category === 'marketing' || service.category === 'support'
  );

  return (
    <>
      {/* 1. HERO BAND */}
      <Section grid id="services-hero" className="lg:py-20">
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] bg-gray-300/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-12rem] top-1/3 h-96 w-96 bg-gray-300/20"
          aria-hidden="true"
        />
        <span
          className="glow-orb bottom-[-12rem] left-1/4 h-80 w-80 bg-gray-200/30"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-start">
          <Breadcrumbs
            className="text-xs [&_ol]:text-xs"
            items={[{ label: 'Services' }]}
          />
          <Reveal className="mt-8 max-w-3xl">
            <div className="flex flex-col items-start gap-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-800">
                Full-service digital agency
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Our Web &amp; <span className="text-gradient">Digital Services</span>
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {HUB_INTRO}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  asChild
                  onClick={() => trackEvent('cta_click', { location: 'services_hub_hero' })}
                >
                  <Link href="/contact">Get Free Quote</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="mt-14 w-full md:mt-16">
            <StatGrid
              items={[
                { value: site.stats.projects, label: 'Projects delivered' },
                { value: String(services.length), label: 'Specialist services' },
                { value: site.stats.satisfaction, label: 'Client satisfaction' },
                { value: '90+', label: 'Lighthouse performance' },
              ]}
            />
          </Reveal>
        </div>
      </Section>

      {/* 2. SERVICES LIST */}
      <Section id="services-list">
        <h2 className="sr-only">All services</h2>

        <SectionHeading
          eyebrow="Build"
          title="Build Your **Digital Product**"
          description="Custom websites, WordPress, e-commerce, software, and mobile apps — with the UI/UX design that ties it all together."
          className="mb-10 md:mb-12"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildServices.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 60} className="h-full">
              {/* Bubble-click tracker so ServiceCard links keep firing the hub event */}
              <div
                className="h-full"
                onClick={() => trackEvent('cta_click', { location: 'services_hub', target: service.slug })}
              >
                <ServiceCard service={service} showPrice />
              </div>
            </Reveal>
          ))}
        </div>

        <SectionHeading
          eyebrow="Grow"
          title="Grow **Traffic & Revenue**"
          description="SEO, Google Ads, and social media that compound — plus the ongoing care that keeps your site fast, secure, and online."
          className="mb-10 mt-16 md:mb-12 md:mt-24"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {growServices.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 60} className="h-full">
              <div
                className="h-full"
                onClick={() => trackEvent('cta_click', { location: 'services_hub', target: service.slug })}
              >
                <ServiceCard service={service} showPrice />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3. HOW ENGAGEMENTS WORK */}
      <Section tinted>
        <Reveal className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How engagements work
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ENGAGEMENT_STEPS.map((step, index) => (
              <div
                key={step.label}
                className="flex items-center gap-4 rounded-2xl border border-border/70 bg-white px-5 py-5 shadow-[0_1px_2px_rgb(2_8_23/0.04)]"
              >
                <span className="icon-tile h-10 w-10 shrink-0">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-800">
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{step.label}</span>
                  <span className="text-xs text-muted-foreground">{step.hint}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* 4. CTA */}
      <CTABand
        title="Not Sure Which Service You Need?"
        description="Describe your goal in two sentences — we will reply with the right approach and a free quote, even if that means a smaller project than you expected."
      />
    </>
  );
}

export default ServicesHubView;
// site-app.tsx imports this view by name; keep both export shapes in sync.
export { ServicesHubView };
