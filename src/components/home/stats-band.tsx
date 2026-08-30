'use client';

import { Reveal } from '@/components/common/reveal';
import { Editable } from '@/components/admin/editable';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';

/** The four stats shown in the band — every value is admin-editable. */
const STATS: { key: string; label: string }[] = [
  { key: 'stats.projects', label: 'Projects delivered' },
  { key: 'stats.years', label: 'Years of craft' },
  { key: 'stats.responseTime', label: 'Response time' },
  { key: 'stats.fixedQuotes', label: 'Fixed quotes' },
];

/**
 * STATS BAND — cream strip with oversized gradient numbers and
 * dashed vertical dividers between stats on desktop.
 */
export function StatsBand() {
  const settings = useSiteSettings((s) => s.settings);

  return (
    <section id="stats" className="section-cream py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.key}
                className="text-center lg:border-l-2 lg:border-dashed lg:border-gray-300 lg:px-4 lg:first:border-l-0"
              >
                <Editable id={stat.key} as="span">
                  <p className="text-gradient font-display text-5xl font-bold md:text-7xl">
                    {effectiveValue(settings, stat.key)}
                  </p>
                </Editable>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
