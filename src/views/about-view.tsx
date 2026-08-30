'use client';

import { Eye, Gem, Handshake, LineChart, Quote, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CTABand } from '@/components/common/cta-band';
import { aboutStory, companyValues } from '@/data';

const VALUE_ICONS: LucideIcon[] = [Gem, Eye, Handshake, LineChart];

/** /about — honest story, mission, and values. No invented people or numbers. */
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
              A senior-only web, app &amp; software studio — with one rule: treat
              every client&rsquo;s business like our own.
            </p>
          </Reveal>
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

      <CTABand
        title="Want to Work With Us?"
        description="Book a free strategy call — we will tell you honestly whether we are the right fit."
        secondaryHref="/portfolio"
        secondaryLabel="See Our Work"
      />
    </>
  );
}
