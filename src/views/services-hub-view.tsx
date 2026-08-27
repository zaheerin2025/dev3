'use client';

import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CTABand } from '@/components/common/cta-band';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { services } from '@/data';
import { trackEvent } from '@/lib/analytics';

const HUB_INTRO =
  'Developers3 is a full-service web development company covering every stage of your digital presence — from custom website development and WordPress builds to e-commerce development, custom software, and mobile apps. Alongside engineering, our designers deliver UI/UX design services, while our growth team drives results with SEO, Google Ads management, and social media marketing. Every service comes with the same promise: senior specialists doing the work, fixed and transparent pricing, and measurable outcomes reported against your business goals. Whether you need a five-page local business site, a national e-commerce platform, or ongoing website maintenance and support, you get one accountable team — and a free, itemized quote before anything starts. Explore each service below for deliverables, process, pricing, and case studies.';

function ServicesHubView() {
  return (
    <>
      {/* 1. HERO BAND */}
      <Section tinted id="services-hero">
        <Breadcrumbs items={[{ label: 'Services' }]} />
        <Reveal className="mt-8 max-w-3xl">
          <h1 className="text-4xl font-bold text-balance sm:text-5xl">Our Web &amp; Digital Services</h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {HUB_INTRO}
          </p>
        </Reveal>
      </Section>

      {/* 2. SERVICES LIST */}
      <Section id="services-list">
        <h2 className="sr-only">All services</h2>
        <div className="flex flex-col gap-4">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 60} className="h-full">
              <Card className="h-full rounded-2xl p-6 lg:p-8">
                <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr_auto]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <ServiceIconGlyph icon={service.icon} />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-foreground">{service.name}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {service.tagline}
                    </p>
                    <p className="text-sm italic text-muted-foreground">
                      Ideal for: {service.idealFor}
                    </p>
                    <p className="pt-2 text-sm font-semibold text-foreground">
                      What&rsquo;s included:
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {service.offerings.slice(0, 3).map((offering) => (
                        <li
                          key={offering.title}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                          {offering.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <Badge variant="secondary">From {service.startingPrice}</Badge>
                    <Button
                      size="lg"
                      className="h-11"
                      asChild
                      onClick={() => trackEvent('cta_click', { location: 'services_hub', target: service.slug })}
                    >
                      <Link href={`/${service.slug}`} aria-label={`Learn more about ${service.name}`}>
                        View service
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3. CTA */}
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
