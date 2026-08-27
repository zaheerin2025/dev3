'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
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
import { TestimonialCard } from '@/components/common/testimonial-card';
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
      <Section>
        <JsonLd
          data={[buildCaseStudySchema(study), ...(review ? [buildReviewSchema(review)] : [])]}
        />
        <div className="flex flex-col items-start gap-5">
          <Breadcrumbs items={[{ label: 'Portfolio', href: '/portfolio' }, { label: study.title }]} />
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('border-none font-semibold', CATEGORY_STYLES[study.category])}>
              {CATEGORY_LABELS[study.category]}
            </Badge>
            <Badge variant="outline">{study.industry}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-balance sm:text-5xl">{study.title}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">{study.summary}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>
              Client: <span className="font-medium text-foreground">{study.client}</span>
            </span>
            <span>
              Industry: <span className="font-medium text-foreground">{study.industry}</span>
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
                      className="font-medium text-emerald-700 underline-offset-4 hover:underline"
                    >
                      {service?.name ?? serviceSlug}
                    </Link>
                  );
                })}
              </span>
            ) : null}
          </div>
        </div>
        <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-emerald-600/10 md:mt-12">
          <Image
            src={study.coverImage}
            alt={study.coverAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
            className="object-cover"
          />
        </div>
      </Section>

      {/* Challenge & solution */}
      <Section tinted>
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-bold sm:text-3xl">The Challenge</h2>
            <div className="mt-4 flex flex-col gap-4">
              {study.challenge.map((paragraph, index) => (
                <p key={index} className="leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-2xl font-bold sm:text-3xl">Our Solution</h2>
            <div className="mt-4 flex flex-col gap-4">
              {study.solution.map((paragraph, index) => (
                <p key={index} className="leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
            {study.techStack.length > 0 ? (
              <TechPills items={study.techStack} className="mt-6 justify-start" />
            ) : null}
          </Reveal>
        </div>
      </Section>

      {/* Results */}
      <Section dark dots>
        <SectionHeading dark eyebrow="Results" title="The Numbers That Matter" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {study.results.map((result, index) => (
            <Reveal
              key={result.label}
              delay={index * 80}
              className="rounded-2xl bg-white/5 p-6 ring-1 ring-emerald-400/15"
            >
              <p className="text-3xl font-bold text-emerald-300">{result.metric}</p>
              <p className="mt-2 text-sm text-emerald-100/70">{result.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Showcase */}
      <Section>
        <SectionHeading eyebrow="Project highlights" title="Inside The Build" />
        <div className="grid gap-4 sm:grid-cols-2">
          {study.showcase.map((item, index) => (
            <Reveal key={item.title} delay={(index % 2) * 60}>
              <div className={cn('h-full rounded-2xl bg-gradient-to-br p-6', item.gradient)}>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{item.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Testimonial */}
      {review ? (
        <Section tinted>
          <div className="mx-auto max-w-2xl">
            <TestimonialCard testimonial={review} />
          </div>
        </Section>
      ) : null}

      <CTABand
        title="Want Results Like These?"
        description="Tell us your goal and get a free, itemized quote within one business day."
      />

      {/* Related case studies */}
      {related.length > 0 ? (
        <Section>
          <SectionHeading title="More Case Studies" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.slug} delay={(index % 3) * 60}>
                <CaseStudyCard study={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
