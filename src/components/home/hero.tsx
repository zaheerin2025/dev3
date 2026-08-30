'use client';

import * as React from 'react';
import {
  ArrowDown,
  Handshake,
  KeyRound,
  Smartphone,
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

/**
 * Business needs the hero headline rotates through — sandwiched between
 * the two static lines "Your Business Needs" (top) and "We Make It
 * Happen" (bottom) so every combination reads as one confident sentence.
 */
const ROTATOR_ITEMS = [
  'A Better Website',
  'More Customers',
  'A Mobile App',
  'Google Ads',
  'Meta Ads',
  'AI Automation',
  'Better Visibility',
];

/** Seconds each phrase stays readable before the next one rises in. */
const ROTATOR_SLOT = 2.6;

/**
 * Mobile app capabilities — shown as clean chips in the amber callout
 * card, covering the full stack from languages to store deployment.
 */
const MOBILE_STACK_ITEMS = [
  'Flutter',
  'Dart',
  'Kotlin',
  'Java',
  'Firebase',
  'Supabase',
  'Play Store',
  'App Store',
];

/**
 * Languages & frameworks we are expert in (right hero rail).
 * Flutter sits first on purpose — cross-platform apps are our speciality.
 */
const LANGUAGES = [
  'Flutter (Dart)',
  'Laravel',
  'CodeIgniter',
  'PHP',
  'Next.js',
  'React',
  'TypeScript',
  'WordPress',
  'Shopify',
  'Tailwind CSS',
];

/**
 * HERO — big, confident split layout on paper: oversized grotesk
 * headline reading "Your Business Needs [rotating need] We Make It
 * Happen" (needs rotate: better website → customers → app → ads →
 * automation → visibility), roomy sub and CTAs, hairline fact row, and
 * a right rail with the languages we master plus the mobile app
 * technologies & deployment callout. The availability badge lives in
 * the top navigation, NOT here, so the hero stays compact and fits the
 * initial viewport. No decorative paint — solid colors, hairlines and
 * transform-only motion.
 */
export function Hero() {
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  return (
    <section id="hero" className="section-white relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-14 md:pt-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left — headline block */}
          <div className="lg:col-span-8">
            <p className="eyebrow inline-flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
              Websites • Apps • Software • Marketing
            </p>

            <Editable id="hero.headline">
              {headlineOverride ? (
                <h1 className="mt-5 max-w-4xl font-display text-[2.9rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#161613] sm:text-6xl lg:text-[5rem]">
                  {headlineOverride}
                </h1>
              ) : (
                <h1 className="mt-5 max-w-4xl font-display text-[2.6rem] font-bold leading-[1.07] tracking-[-0.03em] text-[#161613] sm:text-6xl lg:text-[4.9rem]">
                  {/* Screen readers get the full sentence once; the visual
                      rotator below is decorative. */}
                  <span className="sr-only">
                    Your business needs a better website, more customers, a mobile app, Google
                    Ads, Meta Ads, AI automation or better visibility — we make it happen.
                  </span>
                  <span aria-hidden="true">
                    <span className="word-rise block" style={{ ['--rise-delay' as string]: '0ms' }}>
                      Your Business Needs
                    </span>
                    <span
                      className="hero-rotator my-1 text-[1.9rem] text-[#FF4D00] sm:text-5xl lg:text-[4.4rem]"
                    >
                      {ROTATOR_ITEMS.map((item, i) => (
                        <span
                          key={item}
                          style={{
                            animationDuration: `${ROTATOR_ITEMS.length * ROTATOR_SLOT}s`,
                            animationDelay: `${-i * ROTATOR_SLOT}s`,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </span>
                    <span
                      className="word-rise block"
                      style={{ ['--rise-delay' as string]: '140ms' }}
                    >
                      We Make It Happen
                    </span>
                  </span>
                </h1>
              )}
            </Editable>

            <Editable id="hero.subheadline">
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-[#6f6e66]">
                {subheadline}
              </p>
            </Editable>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
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

          {/* Right — expertise rail (desktop) */}
          <aside
            className="hidden lg:col-span-4 lg:flex lg:flex-col lg:gap-7 lg:border-l lg:border-[#e6e5de] lg:pl-10"
            aria-label="Languages and frameworks we master"
          >
            <div className="border-t border-[#e6e5de] pt-6" aria-label="Technologies we work with">
              <p className="eyebrow">Languages &amp; Frameworks We Master</p>
              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
                {LANGUAGES.map((lang, i) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-[#161613]"
                  >
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${ACCENT_DOT[i % ACCENT_DOT.length]}`}
                      aria-hidden="true"
                    />
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile stack callout — amber sticker card with clean chips */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-[#161613] bg-[#FFD84D] p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#161613] text-[#FFD84D]">
                <Smartphone className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold leading-snug text-[#161613]">
                  Mobile App Technologies &amp; Deployment
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {MOBILE_STACK_ITEMS.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#161613]/15 bg-white/70 px-2.5 py-1 text-[13px] font-semibold leading-none text-[#161613]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Hairline fact row — honest claims, no invented proof */}
        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#e6e5de] pt-6">
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
          {/* Languages fallback for small screens (rail is desktop-only) */}
          <div className="flex w-full flex-wrap items-center gap-2 lg:hidden" aria-label="Technologies we work with">
            {LANGUAGES.map((lang) => (
              <span
                key={lang}
                className="rounded-full border border-[#e6e5de] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#161613]"
              >
                {lang}
              </span>
            ))}
            <span className="sr-only">
              Mobile App Technologies &amp; Deployment: Flutter, Dart, Kotlin, Java, Firebase,
              Supabase, Play Store, App Store.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
