'use client';

import Image from 'next/image';
import { Eye, Gem, Handshake, LineChart, Quote, type LucideIcon } from 'lucide-react';
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

const VALUE_ICONS: LucideIcon[] = [Gem, Eye, Handshake, LineChart];

/** /about — story, mission, values, timeline, and team. */
export function AboutView() {
  return (
    <>
      {/* Hero */}
      <Section grid className="lg:py-20">
        <span
          className="glow-orb left-[-10rem] top-[-8rem] h-80 w-80 bg-gray-400/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-8rem] top-24 h-72 w-72 bg-gray-400/20"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'About Us' }]} />
          <Reveal className="mt-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-800">
              About us
            </p>
            <h1 className="text-4xl font-bold text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              About <span className="text-gradient">Developers3</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              The senior team behind 50+ websites, apps, and software products — built since 2017
              with one rule: treat every client&rsquo;s business like our own.
            </p>
          </Reveal>
        </div>
        <div className="relative mt-14">
          <StatGrid items={STATS} />
        </div>
      </Section>

      {/* Story + mission */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="relative pl-6 sm:pl-8">
            <span
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-gray-500 via-gray-400/60 to-transparent"
              aria-hidden="true"
            />
            <div className="space-y-5">
              {aboutStory.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? 'text-base/relaxed text-foreground/85 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-gray-800 sm:text-[17px] sm:leading-8'
                      : 'text-base/relaxed text-muted-foreground sm:text-[17px] sm:leading-8'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="card-surface relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-7 text-white sm:p-8">
              <span
                className="glow-orb right-[-4rem] top-[-5rem] h-48 w-48 bg-gray-300/30"
                aria-hidden="true"
              />
              <Quote
                className="pointer-events-none absolute -right-3 -top-4 h-24 w-24 select-none text-white/10"
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-inset ring-white/25">
                  <Quote className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-100">
                  Our mission
                </h2>
                <p className="text-lg font-medium leading-relaxed">
                  Make agency-quality digital products accessible to every serious small business —
                  with transparent pricing, senior craft, and results you can measure.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeading
          eyebrow="Our values"
          title="How We Work"
          description="Four principles that decide how we quote, build, and communicate — on every project."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {companyValues.map((value, index) => {
            const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
            return (
              <Reveal key={value.title} delay={index * 70} className="h-full">
                <div className="card-surface card-hover flex h-full flex-col gap-4 rounded-[1.25rem] p-6">
                  <span className="icon-tile h-11 w-11">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Timeline */}
      <Section tinted>
        <SectionHeading
          eyebrow="Our journey"
          title="From Two Developers to a Full Digital Team"
        />
        <div className="relative mx-auto max-w-2xl">
          <span
            className="absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b from-gray-500/60 via-gray-400/40 to-transparent"
            aria-hidden="true"
          />
          <ol className="space-y-10">
            {timeline.map((entry, index) => (
              <Reveal as="li" key={entry.year} delay={index * 80} className="relative pl-10">
                <span
                  className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-gray-500 to-gray-800 ring-4 ring-gray-100"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-bold tracking-wide text-gray-800">
                  {entry.year}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{entry.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {entry.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Team */}
      <Section>
        <SectionHeading
          eyebrow="Meet the team"
          title="The People Behind The Pixels"
          description="Senior designers, engineers, and marketers — the people on your first call are the people who build your project."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <Reveal key={member.id} delay={index * 70} className="h-full">
              <article className="card-surface card-hover group flex h-full flex-col overflow-hidden rounded-[1.25rem]">
                <div className="relative aspect-square">
                  <Image
                    src={member.photo}
                    alt={`Portrait of ${member.name}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  {/* Legibility gradient at the photo base */}
                  <span
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a]/70 via-[#0a0a0a]/25 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-800 text-xs font-bold text-white ring-2 ring-gray-100"
                      aria-hidden="true"
                    >
                      {member.initials}
                    </span>
                    <span className="min-w-0">
                      <h3 className="truncate font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-4">
                    {member.bio}
                  </p>
                  {member.funFact ? (
                    <p className="mt-auto text-xs italic leading-relaxed text-muted-foreground/80 line-clamp-2">
                      {member.funFact}
                    </p>
                  ) : null}
                </div>
              </article>
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
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 80} className="h-full">
              <TestimonialCard testimonial={testimonial} className="h-full" />
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
