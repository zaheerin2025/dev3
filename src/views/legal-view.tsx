'use client';

import { CalendarDays } from 'lucide-react';
import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { PageHero } from '@/components/common/page-hero';
import { legalLastUpdated, privacySections, termsSections } from '@/data';

interface LegalViewProps {
  kind: 'privacy' | 'terms';
}

const CONFIG = {
  privacy: {
    label: 'Privacy Policy',
    sections: privacySections,
  },
  terms: {
    label: 'Terms & Conditions',
    sections: termsSections,
  },
} as const;

/** /privacy and /terms — long-form legal copy from the content data files. */
export function LegalView({ kind }: LegalViewProps) {
  const config = CONFIG[kind];

  return (
    <>
      {/* Hero — same left-aligned pattern as every page */}
      <PageHero
        eyebrow="Legal"
        title={config.label}
        crumbs={[{ label: config.label }]}
        description={
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-[#FF4D00]" aria-hidden="true" />
            Last updated: {legalLastUpdated}
          </span>
        }
      />

      <Section noPad>
        <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
          <Reveal>
            <article className="card-surface rounded-[1.5rem] p-6 sm:p-10">
              <div>
                {config.sections.map((section, index) => (
                  <section
                    key={section.heading}
                    aria-labelledby={`legal-${kind}-${index}`}
                  >
                    <h2
                      id={`legal-${kind}-${index}`}
                      className="mb-3 mt-10 text-2xl font-bold text-balance sm:text-3xl"
                    >
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-lg leading-8 text-foreground/85">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
