'use client';

import { Eye, Gem, Handshake, LineChart, Quote, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { PageHero } from '@/components/common/page-hero';
import { CTABand } from '@/components/common/cta-band';
import { Editable } from '@/components/admin/editable';
import { aboutStory, companyValues } from '@/data';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';

const VALUE_ICONS: LucideIcon[] = [Gem, Eye, Handshake, LineChart];

/** /about — honest story, mission, and values. No invented people or numbers. */
export function AboutView() {
  const settings = useSiteSettings((s) => s.settings);
  const intro = effectiveValue(settings, 'about.intro');
  const mission = effectiveValue(settings, 'about.mission');

  return (
    <>
      {/* Hero — same left-aligned pattern as every page, mission as the rail */}
      <PageHero
        eyebrow="About us"
        title="About **Developers3**"
        description={intro}
        crumbs={[{ label: 'About Us' }]}
        aside={
          <Reveal delay={120} className="flex h-full items-center">
            <Editable id="about.mission">
              <div className="flex flex-col gap-4 rounded-2xl border-2 border-[#161613] bg-[#0FA36B] p-7 text-white sm:p-8">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-inset ring-white/30">
                  <Quote className="size-5" aria-hidden="true" />
                </span>
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white/85">
                  Our mission
                </h2>
                <p className="text-xl font-medium leading-relaxed">{mission}</p>
              </div>
            </Editable>
          </Reveal>
        }
      />

      {/* Story */}
      <Section tinted>
        <div className="max-w-3xl">
          <Reveal className="relative pl-6 sm:pl-8">
            <span
              className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-[#FF4D00]"
              aria-hidden="true"
            />
            <div className="space-y-5">
              {aboutStory.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? 'text-lg/relaxed text-foreground/85 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#161613] sm:text-[17px] sm:leading-8'
                      : 'text-lg/relaxed text-muted-foreground sm:text-[17px] sm:leading-8'
                  }
                >
                  {paragraph}
                </p>
              ))}
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
                  <p className="text-base leading-relaxed text-muted-foreground">
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
