'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CATEGORY_LABELS, CATEGORY_STYLES, CaseStudyCard } from '@/components/common/case-study-card';
import { CTABand } from '@/components/common/cta-band';
import { JsonLd } from '@/components/common/json-ld';
import { Link } from '@/components/common/link';
import { Reveal } from '@/components/common/reveal';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { TechPills } from '@/components/common/tech-pills';
import { caseStudies, getCaseStudy, getService, getTestimonial } from '@/data';
import { cn } from '@/lib/utils';
import { buildCaseStudySchema, buildReviewSchema } from '@/lib/schema';

/** Full case study page (e.g. /portfolio/lumina-boutique). */
export function CaseStudyView({ slug }: { slug: string }) {
  const study = getCaseStudy(slug);

  if (!study) {
    return (
      <Section>
        <h1 className="text-3xl font-bold sm:text-4xl">Case study not found</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          The case study you are looking for does not exist or may have moved. Browse our portfolio to
          see all client projects.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/portfolio">Browse Portfolio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </Section>
    );
  }

  const review = study.testimonialId ? getTestimonial(study.testimonialId) : undefined;
  const sameCategory = caseStudies.filter(
    (item) => item.category === study.category && item.slug !== study.slug
  );
  const otherCategories = caseStudies.filter(
    (item) => item.category !== study.category && item.slug !== study.slug
  );
  const related = [...sameCategory, ...otherCategories].slice(0, 3);

  return (
    <>
      {/* Hero + cover */}
      <Section dark dots>
        {/* Ambient glow orbs (decorative) */}
        <span
          className="glow-orb left-[-9rem] top-[-9rem] h-[26rem] w-[26rem] bg-pink-400/20"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-8rem] top-1/3 h-80 w-80 bg-pink-400/15"
          aria-hidden="true"
        />
        <JsonLd
          data={[buildCaseStudySchema(study), ...(review ? [buildReviewSchema(review)] : [])]}
        />
        <div className="relative flex flex-col items-start gap-5">
          <Breadcrumbs
            className="[&_[data-slot=breadcrumb-page]]:font-medium [&_[data-slot=breadcrumb-page]]:text-white [&_[data-slot=breadcrumb-separator]_svg]:text-pink-400/60 [&_a:hover]:text-white [&_ol]:text-pink-200/70"
            items={[{ label: 'Portfolio', href: '/portfolio' }, { label: study.title }]}
          />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ring-white/20',
                CATEGORY_STYLES[study.category]
              )}
            >
              {CATEGORY_LABELS[study.category]}
            </span>
            <span className="inline-flex items-center rounded-full bg-pink-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-pink-200 ring-1 ring-inset ring-pink-300/25">
              {study.industry}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-balance text-white sm:text-4xl md:text-5xl">
            {study.title}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-pink-100/80 sm:text-lg">
            {study.summary}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-pink-100/60">
            <span>
              Client: <span className="font-medium text-white">{study.client}</span>
            </span>
            <span>
              Industry: <span className="font-medium text-white">{study.industry}</span>
            </span>
            {study.services.length > 0 ? (
              <span className="flex flex-wrap items-center gap-2">
                Services:
                {study.services.map((serviceSlug) => {
                  const service = getService(serviceSlug);
                  return (
                    <Link
                      key={serviceSlug}
                      href={`/${serviceSlug}`}
                      className="font-medium text-pink-300 underline-offset-4 hover:underline"
                    >
                      {service?.name ?? serviceSlug}
                    </Link>
                  );
                })}
              </span>
            ) : null}
          </div>
        </div>

        {/* Key result highlights (real metrics from the study) */}
        {study.results.length > 0 ? (
          <div className="relative mt-10 border-t border-white/10 pt-8 md:mt-12">
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
              {study.results.slice(0, 3).map((result) => (
                <div key={result.label}>
                  <p className="text-gradient-soft font-display text-3xl font-extrabold sm:text-4xl">
                    {result.metric}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-200/60">
                    {result.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Cover media inside a gradient hairline frame */}
        <Reveal className="relative mt-12 md:mt-16">
          <span
            className="glow-orb -top-12 left-1/2 h-80 w-[34rem] -translate-x-1/2 bg-pink-500/20"
            aria-hidden="true"
          />
          <div className="gradient-frame shadow-[0_40px_80px_-40px_rgb(0_0_0/0.65)]">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.45rem]">
              <Image
                src={study.coverImage}
                alt={study.coverAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Challenge & solution */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex gap-4">
              <span
                className="mt-1.5 w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b from-pink-500 to-pink-300"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">The Challenge</h2>
                <div className="mt-5 flex max-w-3xl flex-col gap-4">
                  {study.challenge.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex gap-4">
              <span
                className="mt-1.5 w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b from-pink-500 to-pink-300"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Our Solution</h2>
                <div className="mt-5 flex max-w-3xl flex-col gap-4">
                  {study.solution.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {study.techStack.length > 0 ? (
                  <TechPills items={study.techStack} className="mt-7 justify-start" />
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Results */}
      <Section tinted>
        <SectionHeading eyebrow="Results" title="The Numbers That Matter" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {study.results.map((result, index) => (
            <Reveal
              key={result.label}
              delay={index * 80}
              className="card-surface rounded-2xl p-6 text-center"
            >
              <p className="text-gradient font-display text-4xl font-extrabold">{result.metric}</p>
              <p className="mt-2 text-sm text-muted-foreground">{result.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Showcase gallery */}
      <Section>
        <SectionHeading eyebrow="Project highlights" title="Inside The Build" />
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {study.showcase.map((item, index) => (
            <Reveal
              key={item.title}
              delay={(index % 2) * 60}
              className="group relative h-full min-h-[15rem] overflow-hidden rounded-2xl ring-1 ring-pink-900/10"
            >
              {/* Zooming gradient "media" layer */}
              <span
                className={cn(
                  'absolute inset-0 bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-105',
                  item.gradient
                )}
                aria-hidden="true"
              />
              <span
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.35) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
                aria-hidden="true"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/75 via-[#0a0a0a]/25 to-transparent"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute right-5 top-3 select-none font-display text-6xl font-black leading-none text-white/15"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="relative flex h-full flex-col justify-end gap-2 p-6 sm:p-7">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/85">{item.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Testimonial */}
      {review ? (
        <Section tinted>
          <Reveal>
            <figure className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-pink-700 to-[#0a0a0a] p-8 shadow-[0_32px_64px_-32px_rgb(4_16_11/0.55)] sm:p-12">
              {/* Ambient glows + oversized quote glyph (decorative) */}
              <span
                className="glow-orb left-[-5rem] top-[-7rem] h-72 w-72 bg-pink-400/25"
                aria-hidden="true"
              />
              <span
                className="glow-orb bottom-[-8rem] right-[-4rem] h-80 w-80 bg-pink-400/20"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -top-6 right-4 select-none font-display text-[9rem] font-black leading-none text-white/10 sm:-top-10 sm:text-[12rem]"
                aria-hidden="true"
              >
                &rdquo;
              </span>
              <div className="relative">
                <div
                  className="flex items-center gap-1"
                  role="img"
                  aria-label={`Rated ${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/25'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 max-w-3xl text-xl font-medium leading-relaxed text-white sm:text-2xl">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/15 pt-6">
                  {review.avatar ? (
                    <Image
                      src={review.avatar}
                      alt={`Portrait of ${review.name}`}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-pink-300/50"
                    />
                  ) : (
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-400/15 text-sm font-bold text-pink-200 ring-2 ring-pink-300/50"
                      aria-hidden="true"
                    >
                      {review.initials}
                    </span>
                  )}
                  <span>
                    <span className="block text-base font-semibold text-white">{review.name}</span>
                    <span className="block text-sm text-pink-100/70">
                      {review.role}, {review.company}
                    </span>
                  </span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </Section>
      ) : null}

      {/* Related case studies */}
      {related.length > 0 ? (
        <Section>
          <SectionHeading title="More Case Studies" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.slug} delay={(index % 3) * 60}>
                <CaseStudyCard study={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      <CTABand
        title="Want Results Like These?"
        description="Tell us your goal and get a free, itemized quote within one business day."
      />
    </>
  );
}
