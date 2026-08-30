'use client';

import { CalendarDays } from 'lucide-react';
import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
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
    <Section>
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ label: config.label }]} />
        <Reveal className="mt-6">
          <article className="card-surface rounded-[1.5rem] p-6 sm:p-10">
            <h1 className="text-3xl font-bold text-balance sm:text-4xl">{config.label}</h1>
            <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              Last updated: {legalLastUpdated}
            </p>

            <div>
              {config.sections.map((section, index) => (
                <section
                  key={section.heading}
                  aria-labelledby={`legal-${kind}-${index}`}
                >
                  <h2
                    id={`legal-${kind}-${index}`}
                    className="mb-3 mt-10 text-xl font-bold text-balance sm:text-2xl"
                  >
                    {section.heading}
                  </h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-base leading-8 text-foreground/85">
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
  );
}
