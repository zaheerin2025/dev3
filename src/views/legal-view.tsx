'use client';

import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { legalLastUpdated, privacySections, termsSections } from '@/data';
import { cn } from '@/lib/utils';

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
        <Reveal>
          <h1 className="mt-6 text-4xl font-bold text-balance">{config.label}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {legalLastUpdated}</p>

          <div className="mt-8">
            {config.sections.map((section, index) => (
              <section
                key={section.heading}
                aria-labelledby={`legal-${kind}-${index}`}
                className="mt-8 first:mt-0"
              >
                <h2 id={`legal-${kind}-${index}`} className="text-xl font-semibold">
                  {section.heading}
                </h2>
                <div className={cn('mt-3 space-y-3')}>
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-base/relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
