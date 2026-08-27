'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { StatGrid } from '@/components/common/stat-grid';
import { TestimonialCard } from '@/components/common/testimonial-card';
import { CTABand } from '@/components/common/cta-band';
import { aboutStory, companyValues, teamMembers, testimonials, timeline } from '@/data';
import { site } from '@/lib/site';

const STATS = [
  { value: site.stats.projects, label: 'Projects delivered' },
  { value: site.stats.clients, label: 'Happy clients' },
  { value: site.stats.years, label: 'Years in business' },
  { value: site.stats.satisfaction, label: 'Client satisfaction' },
];

/** /about — story, mission, values, timeline, and team. */
export function AboutView() {
  return (
    <>
      {/* Hero */}
      <Section tinted>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'About Us' }]} />
          <h1 className="mt-6 text-3xl font-bold text-balance sm:text-5xl">About Developers3</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            The senior team behind 50+ websites, apps, and software products — built since 2017
            with one rule: treat every client&rsquo;s business like our own.
          </p>
        </div>
      </Section>

      {/* Story + mission */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="space-y-4">
            {aboutStory.map((paragraph, index) => (
              <p key={index} className="text-base/relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </Reveal>
          <Reveal delay={100}>
            <Card className="rounded-2xl border-0 bg-emerald-600 p-6 text-white">
              <CardContent className="flex flex-col gap-4 p-0">
                <Quote className="h-8 w-8 text-emerald-200" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-100">Our mission</h2>
                <p className="text-lg font-medium leading-relaxed">
                  Make agency-quality digital products accessible to every serious small business —
                  with transparent pricing, senior craft, and results you can measure.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="mt-14">
          <StatGrid items={STATS} />
        </div>
      </Section>

      {/* Values */}
      <Section tinted>
        <SectionHeading
          eyebrow="Our values"
          title="How We Work"
          description="Four principles that decide how we quote, build, and communicate — on every project."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companyValues.map((value, index) => (
            <Reveal key={value.title} delay={index * 70} className="h-full">
              <Card className="h-full rounded-2xl p-6">
                <CardContent className="flex h-full flex-col gap-3 p-0">
                  <h3 className="font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section dark dots>
        <SectionHeading
          dark
          eyebrow="Our journey"
          title="From Two Developers to a Full Digital Team"
        />
        <div className="relative ml-3 max-w-3xl space-y-8 border-l-2 border-emerald-400/20">
          {timeline.map((entry, index) => (
            <Reveal key={entry.year} delay={index * 80} className="relative pl-8">
              <span
                className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              <Badge className="bg-emerald-400/15 text-emerald-300">{entry.year}</Badge>
              <h3 className="mt-2 font-semibold text-white">{entry.title}</h3>
              <p className="mt-1 text-sm text-emerald-100/70">{entry.description}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Team */}
      <Section>
        <SectionHeading
          eyebrow="Meet the team"
          title="The People Behind The Pixels"
          description="Senior designers, engineers, and marketers — the people on your first call are the people who build your project."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <Reveal key={member.id} delay={index * 70} className="h-full">
              <Card className="h-full overflow-hidden rounded-2xl">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={member.photo}
                    alt={`Portrait of ${member.name}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-emerald-700">{member.role}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{member.bio}</p>
                  {member.funFact ? (
                    <p className="mt-2 text-xs italic text-muted-foreground">{member.funFact}</p>
                  ) : null}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Credibility strip */}
      <Section tinted>
        <SectionHeading
          eyebrow="Client words"
          title="Trusted by Businesses Like Yours"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 80} className="h-full">
              <TestimonialCard testimonial={testimonial} className="h-full rounded-2xl" />
            </Reveal>
          ))}
        </div>
      </Section>

      <CTABand
        title="Want to Work With Us?"
        description="Book a free strategy call — we will tell you honestly whether we are the right fit."
        secondaryHref="/portfolio"
        secondaryLabel="See Our Work"
      />
    </>
  );
}
