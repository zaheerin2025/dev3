'use client';

import Image from 'next/image';
import {
  BadgeDollarSign,
  Gauge,
  KeyRound,
  LifeBuoy,
  Search,
  Star,
  Timer,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useSiteSettings } from '@/lib/use-site-settings';
import { trackEvent } from '@/lib/analytics';
import { buildReviewSchema } from '@/lib/schema';

/** Lucide icons for the six "Why choose us" cards, in PRD order. */
const WHY_ICONS: LucideIcon[] = [Users, Search, BadgeDollarSign, Timer, KeyRound, LifeBuoy];

function HomeView() {
  const featuredStudies = caseStudies.slice(0, 6);
  const featuredTestimonials = testimonials.slice(0, 6);
  // Admin-editable hero copy (falls back to the defaults below when unset).
  const heroHeadline = useSiteSettings((s) => s.settings['hero.headline']);
  const heroSubheadline = useSiteSettings((s) => s.settings['hero.subheadline']);

  return (
    <>
      {/* 1. HERO — signature dark-navy tech-agency moment */}
      <Section darkDeep grid id="hero" className="lg:py-20">
        {/* Dot pattern layer (decorative, low opacity) */}
        <span
          className="bg-dots-dark pointer-events-none absolute -inset-24 opacity-40"
          aria-hidden="true"
        />
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb right-[-12rem] top-[-10rem] h-[30rem] w-[30rem] bg-blue-500/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb bottom-[-12rem] left-[-10rem] h-96 w-96 bg-cyan-400/15"
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col items-start gap-6">
              <span className="glass-chip-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white">
                <span
                  className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-cyan-300 text-cyan-300"
                  aria-hidden="true"
                />
                Trusted by 30+ businesses
              </span>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4rem]">
                {heroHeadline ? (
                  heroHeadline
                ) : (
                  <>
                    Web, App &amp;{' '}
                    <span className="text-gradient-soft">Software Development</span> Company
                  </>
                )}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300/85 sm:text-lg">
                {heroSubheadline ??
                  'We design, build, and grow custom websites, e-commerce stores, and digital products that turn visitors into customers — on time, on budget, with senior people on every project.'}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  asChild
                  onClick={() => trackEvent('cta_click', { location: 'hero' })}
                >
                  <Link href="/contact">Get Free Quote</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
              <span className="glass-chip-dark inline-flex items-center gap-2.5 rounded-full px-4 py-2">
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
                <span className="text-sm text-slate-300">Rated 5/5 from 30+ clients</span>
              </span>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative">
            {/* Glow behind the media frame (decorative) */}
            <span
              className="glow-orb bottom-0 right-0 h-80 w-80 bg-cyan-400/15"
              aria-hidden="true"
            />
            <div className="gradient-frame shadow-[0_32px_64px_-32px_rgb(2_8_23/0.6)]">
              <Image
                src="/images/hero-dashboard.png"
                alt="Preview of a conversion-focused website and analytics dashboard built by the Developers3 team"
                width={1440}
                height={720}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full rounded-[1.45rem] ring-1 ring-white/10"
              />
              {/* Floating stat chips (decorative positioning, hidden on small screens) */}
              <span className="glass-chip-dark absolute -left-3 top-10 hidden animate-float items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white sm:flex">
                <Gauge className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                <span>
                  <span className="text-cyan-300">98/100</span>{" "}
                  <span className="text-slate-300">Core Web Vitals</span>
                </span>
              </span>
              <span className="glass-chip-dark absolute -right-3 bottom-10 hidden animate-float-slow items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white sm:flex">
                <TrendingUp className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                <span>
                  <span className="text-cyan-300">+64%</span>{" "}
                  <span className="text-slate-300">client revenue</span>
                </span>
              </span>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 2. TRUST BAR — deliberate dark→light transition (rounded card overlapping the navy hero) */}
      <Section tinted className="relative z-10 -mt-8 rounded-t-[2.5rem] py-12 md:-mt-10 md:py-16">
        <Reveal>
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by 30+ businesses across 10+ industries
          </p>
          <ul className="mb-12 flex flex-wrap items-center justify-center gap-3">
            {clientNames.map((name) => (
              <li
                key={name}
                className="flex h-11 items-center rounded-xl bg-white px-5 font-display text-base font-semibold text-foreground/45 ring-1 ring-inset ring-blue-900/10 transition hover:text-foreground hover:ring-blue-500/30"
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
          title="Web, Design & **Marketing Services**"
          description="Ten specialist services under one roof — every page built to rank, convert, and scale."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, index) => {
            const Icon = WHY_ICONS[index % WHY_ICONS.length];
            return (
              <Reveal key={item.title} delay={(index % 3) * 80} className="h-full">
                <div className="card-surface card-hover h-full rounded-[1.25rem] p-6">
                  <div className="flex h-full flex-col gap-3">
                    <span className="icon-tile h-12 w-12">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredStudies.map((study, index) => (
            <Reveal key={study.slug} delay={(index % 3) * 80} className="h-full">
              <CaseStudyCard study={study} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/portfolio">View All Projects</Link>
          </Button>
        </Reveal>
      </Section>

      {/* 6. PROCESS */}
      <Section dark dots id="process">
        {/* Ambient glow (decorative) */}
        <span
          className="glow-orb left-1/2 top-[-8rem] h-96 w-96 -translate-x-1/2 bg-blue-500/20"
          aria-hidden="true"
        />
        <SectionHeading
          dark
          className="relative"
          eyebrow="How we work"
          title="From First Call to Launch in Four Steps"
        />
        <ProcessSteps steps={homeProcess} dark />
      </Section>

      {/* 7. TESTIMONIALS */}
      <Section id="testimonials">
        <SectionHeading eyebrow="Testimonials" title="What Our Clients Say" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <SectionHeading
          eyebrow="Tech stack"
          title="Technologies We Master"
          description="The stack behind fast, scalable, easy-to-own products."
        />
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
