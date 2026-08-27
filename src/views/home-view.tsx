'use client';

import Image from 'next/image';
import {
  BadgeDollarSign,
  KeyRound,
  LifeBuoy,
  Search,
  Star,
  Timer,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { ServiceCard } from '@/components/common/service-card';
import { CaseStudyCard } from '@/components/common/case-study-card';
import { TestimonialCard } from '@/components/common/testimonial-card';
import { StatGrid } from '@/components/common/stat-grid';
import { TechPills } from '@/components/common/tech-pills';
import { ProcessSteps } from '@/components/common/process-steps';
import { CTABand } from '@/components/common/cta-band';
import { FAQSection } from '@/components/common/faq-section';
import { JsonLd } from '@/components/common/json-ld';
import {
  caseStudies,
  clientNames,
  homeFaqs,
  homeProcess,
  services,
  testimonials,
  whyChooseUs,
} from '@/data';
import { site } from '@/lib/site';
import { trackEvent } from '@/lib/analytics';
import { buildReviewSchema } from '@/lib/schema';

/** Lucide icons for the six "Why choose us" cards, in PRD order. */
const WHY_ICONS: LucideIcon[] = [Users, Search, BadgeDollarSign, Timer, KeyRound, LifeBuoy];

function HomeView() {
  const featuredStudies = caseStudies.slice(0, 6);
  const featuredTestimonials = testimonials.slice(0, 6);

  return (
    <>
      {/* 1. HERO */}
      <Section grid id="hero" className="lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col items-start gap-6">
              <Badge className="rounded-full bg-emerald-100 text-emerald-700">
                Trusted by 30+ businesses
              </Badge>
              <h1 className="text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
                Web, App &amp; Software Development Company
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                We design, build, and grow custom websites, e-commerce stores, and digital
                products that turn visitors into customers — on time, on budget, with senior
                people on every project.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-11"
                  asChild
                  onClick={() => trackEvent('cta_click', { location: 'hero' })}
                >
                  <Link href="/contact">Get Free Quote</Link>
                </Button>
                <Button size="lg" className="h-11" variant="outline" asChild>
                  <Link href="/portfolio">View Our Work</Link>
                </Button>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label="Rated 5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">Rated 5/5 from 30+ clients</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <Image
              src="/images/hero-dashboard.png"
              alt="Preview of a conversion-focused website and analytics dashboard built by the Developers3 team"
              width={1440}
              height={720}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="rounded-2xl shadow-2xl ring-1 ring-emerald-600/10"
            />
          </Reveal>
        </div>
      </Section>

      {/* 2. TRUST BAR */}
      <Section className="border-y py-10 md:py-10">
        <Reveal>
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by 30+ businesses across 10+ industries
          </p>
          <ul className="mb-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {clientNames.map((name) => (
              <li
                key={name}
                className="font-display text-lg font-semibold text-muted-foreground/60"
              >
                {name}
              </li>
            ))}
          </ul>
          <StatGrid
            items={[
              { value: site.stats.projects, label: 'Projects delivered' },
              { value: site.stats.clients, label: 'Happy clients' },
              { value: site.stats.years, label: 'Years in business' },
              { value: site.stats.satisfaction, label: 'Client satisfaction' },
            ]}
          />
        </Reveal>
      </Section>

      {/* 3. SERVICES OVERVIEW */}
      <Section id="services">
        <SectionHeading
          eyebrow="What we do"
          title="Web, Design & Marketing Services"
          description="Ten specialist services under one roof — every page built to rank, convert, and scale."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 80} className="h-full">
              <ServiceCard service={service} showPrice />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 4. WHY CHOOSE US */}
      <Section tinted id="why-us">
        <SectionHeading
          eyebrow="Why Developers3"
          title="Built Like a Partner, Priced Like a Team"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, index) => {
            const Icon = WHY_ICONS[index % WHY_ICONS.length];
            return (
              <Reveal key={item.title} delay={(index % 3) * 80} className="h-full">
                <Card className="h-full rounded-2xl">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* 5. FEATURED PORTFOLIO */}
      <Section id="portfolio">
        <SectionHeading
          eyebrow="Our work"
          title="Featured Case Studies"
          description="Real projects, measurable results — every card links to a full case study."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredStudies.map((study, index) => (
            <Reveal key={study.slug} delay={(index % 3) * 80} className="h-full">
              <CaseStudyCard study={study} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Button size="lg" className="h-11" variant="outline" asChild>
            <Link href="/portfolio">View All Projects</Link>
          </Button>
        </Reveal>
      </Section>

      {/* 6. PROCESS */}
      <Section dark dots id="process">
        <SectionHeading
          dark
          eyebrow="How we work"
          title="From First Call to Launch in Four Steps"
        />
        <ProcessSteps steps={homeProcess} dark />
      </Section>

      {/* 7. TESTIMONIALS */}
      <Section id="testimonials">
        <SectionHeading eyebrow="Testimonials" title="What Our Clients Say" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredTestimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={(index % 3) * 80} className="h-full">
              <TestimonialCard testimonial={testimonial} />
            </Reveal>
          ))}
        </div>
        <JsonLd data={featuredTestimonials.map((t) => buildReviewSchema(t))} />
      </Section>

      {/* 8. TECHNOLOGIES */}
      <Section id="technologies">
        <SectionHeading eyebrow="Tech stack" title="Technologies We Master" />
        <TechPills
          items={[
            'WordPress',
            'React',
            'Next.js',
            'Shopify',
            'WooCommerce',
            'Flutter',
            'Node.js',
            'PostgreSQL',
            'TypeScript',
            'Stripe',
            'Figma',
            'GA4',
          ]}
        />
      </Section>

      {/* 9. FAQ */}
      <Section tinted id="faq">
        <FAQSection faqs={homeFaqs} description="Straight answers about working with us." />
      </Section>

      {/* 10. CTA */}
      <CTABand />
    </>
  );
}

export default HomeView;
// site-app.tsx imports this view by name; keep both export shapes in sync.
export { HomeView };
