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
import { ACCENT_DOT, ACCENT_TEXT } from '@/lib/accent';

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
 * HERO — big, confident split layout on paper: eyebrow, oversized
 * grotesk headline with a tangerine accent phrase, roomy sub and CTAs,
 * hairline fact row with ramp-colored icons, meta rail with a colorful
 * stack list. No decorative paint.
 */
export function Hero() {
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  return (
    <section id="hero" className="section-white relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left — headline block */}
          <div className="lg:col-span-8">
            <p className="eyebrow inline-flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
              Web Design &amp; Development Studio
            </p>

            <Editable id="hero.headline">
              {headlineOverride ? (
                <h1 className="mt-7 max-w-4xl font-display text-[2.9rem] font-bold leading-[1.03] tracking-[-0.03em] text-[#161613] sm:text-6xl lg:text-[5.25rem]">
                  {headlineOverride}
                </h1>
              ) : (
                <h1 className="mt-7 max-w-4xl font-display text-[2.9rem] font-bold leading-[1.03] tracking-[-0.03em] text-[#161613] sm:text-6xl lg:text-[5.25rem]">
                  We build websites that <em className="not-italic text-[#FF4D00]">win clients</em> and grow
                  business
                </h1>
              )}
            </Editable>

            <Editable id="hero.subheadline">
              <p className="mt-7 max-w-2xl text-xl leading-relaxed text-[#6f6e66]">
                {subheadline}
              </p>
            </Editable>

            <div className="mt-10 flex flex-wrap items-center gap-3.5">
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
                  className="size-4.5 transition-transform duration-300 group-hover:translate-y-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Right — meta rail (desktop) */}
          <aside className="hidden lg:col-span-4 lg:flex lg:flex-col lg:gap-8 lg:border-l lg:border-[#e6e5de] lg:pl-10" aria-label="Studio notes">
            <p className="inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#161613]">
              <span className="size-2.5 rounded-full bg-green-600" aria-hidden="true" />
              Available for new projects
            </p>

            <div className="border-t border-[#e6e5de] pt-7" aria-label="Technologies and services we work with">
              <p className="eyebrow">Stack &amp; Services</p>
              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
                {STACK.map((tech, i) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-2.5 text-[15px] font-medium text-[#6f6e66]"
                  >
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${ACCENT_DOT[i % ACCENT_DOT.length]}`}
                      aria-hidden="true"
                    />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Hairline fact row — honest claims, no invented proof */}
        <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#e6e5de] pt-7">
          {HERO_CHIPS.map(({ icon: Icon, label }, i) => (
            <span
              key={label}
              className="inline-flex items-center gap-2.5 text-base font-semibold text-[#161613]"
            >
              <Icon
                className={`size-5 ${ACCENT_TEXT[i % 3]}`}
                aria-hidden="true"
              />
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
