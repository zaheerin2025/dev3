'use client';

import {
  ArrowDown,
  Handshake,
  KeyRound,
  Users,
} from 'lucide-react';
import { Link } from '@/components/common/link';
import { Sticker } from '@/components/common/sticker';
import { Editable } from '@/components/admin/editable';
import { trackEvent } from '@/lib/analytics';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';

/**
 * Honest selling points instead of invented social proof — no fake
 * avatars, no made-up star ratings. The owner can edit every claim
 * from the admin panel because they are all things we actually do.
 */
const HERO_CHIPS = [
  { icon: Users, label: 'Senior-only team' },
  { icon: Handshake, label: 'Fixed quotes, no surprises' },
  { icon: KeyRound, label: 'You own the code' },
];

/** Tech list shown under the hero. */
const STACK = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Shopify',
  'WordPress',
  'SEO',
  'UI/UX Design',
  'E-Commerce',
  'Web Apps',
];

/**
 * HERO — clean and minimal. Plain surface, static headline, clear CTAs,
 * honest proof chips and a simple tech list. No decorative styling.
 */
export function Hero() {
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  return (
    <section id="hero" className="section-white relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 pt-16 pb-20 text-center sm:px-6 md:pt-24">
        <Sticker rotate={0}>Web Design &amp; Development Studio</Sticker>

        <Editable id="hero.headline">
          {headlineOverride ? (
            <h1 className="mt-8 text-4xl font-bold tracking-tight leading-[1.08] text-zinc-900 sm:text-5xl md:text-6xl">
              {headlineOverride}
            </h1>
          ) : (
            <h1 className="mt-8 text-4xl font-bold tracking-tight leading-[1.08] text-zinc-900 sm:text-5xl md:text-6xl">
              We Build Websites That Win Clients And Grow Business
            </h1>
          )}
        </Editable>

        <Editable id="hero.subheadline">
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
            {subheadline}
          </p>
        </Editable>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="btn-primary-pill"
            onClick={() => trackEvent('cta_click', { location: 'hero' })}
          >
            Start Your Project
          </Link>
          <Link href="/portfolio" className="btn-secondary-pill group">
            View Our Work
            <ArrowDown
              className="size-4 transition-transform duration-300 group-hover:translate-y-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Honest proof chips — statements about how we work, not invented reviews */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {HERO_CHIPS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
            >
              <Icon className="size-4 text-zinc-500" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        {/* Tech list */}
        <div
          className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3"
          aria-label="Technologies and services we work with"
        >
          {STACK.map((tech) => (
            <span key={tech} className="text-sm font-semibold text-zinc-500">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
