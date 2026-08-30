'use client';

import {
  ArrowDown,
  Handshake,
  KeyRound,
  Users,
} from 'lucide-react';
import { Link } from '@/components/common/link';
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

/** Tech list shown in the hero meta rail. */
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
 * HERO — editorial split layout on paper: mono eyebrow, oversized serif
 * headline with an italic accent, hairline-ruled fact row and a meta
 * rail (availability + stack) on the right. No decorative paint.
 */
export function Hero() {
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  return (
    <section id="hero" className="section-white relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left — headline block */}
          <div className="lg:col-span-8">
            <p className="eyebrow inline-flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-[#ff4d00]" aria-hidden="true" />
              Web Design &amp; Development Studio
            </p>

            <Editable id="hero.headline">
              {headlineOverride ? (
                <h1 className="mt-7 max-w-3xl font-display text-[2.75rem] font-medium leading-[1.05] tracking-[-0.01em] text-[#161613] sm:text-6xl lg:text-7xl">
                  {headlineOverride}
                </h1>
              ) : (
                <h1 className="mt-7 max-w-3xl font-display text-[2.75rem] font-medium leading-[1.05] tracking-[-0.01em] text-[#161613] sm:text-6xl lg:text-7xl">
                  We build websites that <em className="italic">win clients</em> and grow
                  business
                </h1>
              )}
            </Editable>

            <Editable id="hero.subheadline">
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#6f6e66]">
                {subheadline}
              </p>
            </Editable>

            <div className="mt-9 flex flex-wrap items-center gap-3">
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
          </div>

          {/* Right — meta rail (desktop) */}
          <aside className="hidden lg:col-span-4 lg:flex lg:flex-col lg:gap-8 lg:border-l lg:border-[#e6e5de] lg:pl-10" aria-label="Studio notes">
            <p className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-[#161613]">
              <span className="size-2 rounded-full bg-green-600" aria-hidden="true" />
              Available for new projects
            </p>

            <div className="border-t border-[#e6e5de] pt-6" aria-label="Technologies and services we work with">
              <p className="eyebrow">Stack &amp; Services</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                {STACK.map((tech) => (
                  <span key={tech} className="font-mono text-xs uppercase tracking-[0.1em] text-[#6f6e66]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Hairline fact row — honest claims, no invented proof */}
        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#e6e5de] pt-6">
          {HERO_CHIPS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2.5 text-sm font-medium text-[#161613]"
            >
              <Icon className="size-4 text-[#ff4d00]" aria-hidden="true" />
              {label}
            </span>
          ))}
          {/* Stack fallback for small screens (rail is desktop-only) */}
          <span className="sr-only" aria-label="Technologies and services we work with">
            {STACK.join(', ')}
          </span>
        </div>
      </div>
    </section>
  );
}
