'use client';

import { CheckCircle2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CaseStudyCard } from '@/components/common/case-study-card';
import { FAQSection } from '@/components/common/faq-section';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { JsonLd } from '@/components/common/json-ld';
import { LeadForm } from '@/components/common/lead-form';
import { Link } from '@/components/common/link';
import { ProcessSteps } from '@/components/common/process-steps';
import { Reveal } from '@/components/common/reveal';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { ServiceCard } from '@/components/common/service-card';
import { TechPills } from '@/components/common/tech-pills';
import { TestimonialCard } from '@/components/common/testimonial-card';
import { getRelatedServices, getService, getServiceCaseStudies, getTestimonials } from '@/data';
import { trackEvent } from '@/lib/analytics';
import { buildReviewSchema, buildServiceSchema } from '@/lib/schema';

const PRICING_GUARANTEES = [
  'Fixed, itemized quote before we start',
  'No hidden fees or surprise invoices',
  'Free strategy call included',
];

const LEAD_PROMISES = ['Free consultation', 'NDA on request', 'No obligation'];

/** SEO landing template for a single service (e.g. /web-development). */
export function ServiceDetailView({ slug }: { slug: string }) {
  const service = getService(slug);

  if (!service) {
    return (
      <Section>
        <h1 className="text-3xl font-bold sm:text-4xl">Service not found</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          The service you are looking for does not exist or may have moved. Explore our full range of services from the homepage.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </Section>
    );
  }

  const reviews = getTestimonials(service.testimonialIds);
  const relatedStudies = getServiceCaseStudies(service);
  const relatedServices = getRelatedServices(service);

  return (
    <>
      {/* 1 — Hero */}
      <Section grid className="lg:py-20">
        <JsonLd data={[buildServiceSchema(service), ...reviews.map((t) => buildReviewSchema(t))]} />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: service.name }]} />
            <Badge className="rounded-full bg-emerald-100 text-emerald-700">{service.primaryKeyword}</Badge>
            <h1 className="text-4xl font-bold text-balance sm:text-5xl">{service.heroTitle}</h1>
            <p className="text-lg text-muted-foreground">{service.heroSub}</p>
            <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span role="img" aria-label="Rated 5 out of 5 stars" className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </span>
              <span>Rated 5/5 from 30+ clients</span>
            </div>
          </div>

          <div className="section-dark-deep bg-dots-dark relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <ServiceIconGlyph icon={service.icon} className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">{service.name}</h2>
            <TechPills items={service.technologies} dark className="justify-start" />
            <Badge className="border-none bg-amber-400 font-semibold text-emerald-950">
              Starting at {service.startingPrice}
            </Badge>
          </div>
        </div>
      </Section>

      {/* 2 — What we offer */}
      <Section>
        <SectionHeading eyebrow="What we offer" title="What's Included" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {service.offerings.map((offering, index) => (
            <Reveal key={offering.title} delay={(index % 3) * 60}>
              <Card className="h-full gap-3 p-6">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                <h3 className="font-semibold">{offering.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{offering.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3 — Why this service */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold text-balance">{service.whyTitle}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{service.whyIntro}</p>
          </Reveal>
          <div className="flex flex-col gap-4">
            {service.whyBenefits.map((benefit, index) => (
              <Reveal
                key={benefit.title}
                delay={index * 60}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-inset ring-emerald-600/10"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* 4 — Process */}
      <Section dark dots>
        <SectionHeading dark eyebrow="Our process" title="How We Deliver" />
        <ProcessSteps steps={service.process} dark />
      </Section>

      {/* 5 — Technologies */}
      <Section>
        <SectionHeading eyebrow="Tools" title="Technologies & Tools We Use" />
        <TechPills items={service.technologies} />
      </Section>

      {/* 6 — Portfolio samples */}
      <Section>
        <SectionHeading eyebrow="Proof" title="Related Case Studies" />
        {relatedStudies.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedStudies.map((study, index) => (
              <Reveal key={study.slug} delay={(index % 3) * 60}>
                <CaseStudyCard study={study} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">New case studies for this service are coming soon.</p>
        )}
        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/portfolio">Browse All Projects</Link>
          </Button>
        </div>
      </Section>

      {/* 7 — Pricing */}
      <Section>
        <Card className="grid items-center gap-8 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <Badge variant="secondary">Pricing</Badge>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{service.name} Pricing</h2>
            <p className="mt-4 text-4xl font-bold text-emerald-700">Starting at {service.startingPrice}</p>
            <p className="mt-3 text-muted-foreground">{service.pricingNote}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {PRICING_GUARANTEES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
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
        </Card>
      </Section>

      {/* 8 — Testimonials */}
      {reviews.length > 0 ? (
        <Section tinted>
          <SectionHeading eyebrow="Reviews" title="What Clients Say About This Service" />
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={(index % 2) * 60}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 9 — FAQ */}
      <Section>
        <FAQSection faqs={service.faqs} />
      </Section>

      {/* 10 — Related services */}
      {relatedServices.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Keep exploring" title="Related Services" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((related, index) => (
              <Reveal key={related.slug} delay={(index % 3) * 60}>
                <ServiceCard service={related} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 11 — Lead form */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-balance">Get Your Free {service.shortName} Quote</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tell us about your project — we reply within one business day with a fixed, itemized quote.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {LEAD_PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">{promise}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6">
            <LeadForm source={`service:${service.slug}`} defaultService={service.slug} />
          </Card>
        </div>
      </Section>
    </>
  );
}
