'use client';

import type { ReactNode } from 'react';
import { ArrowDown, Handshake, KeyRound, Users } from 'lucide-react';
import { Link } from '@/components/common/link';
import { Sticker } from '@/components/common/sticker';
import { FloatingShapes } from '@/components/common/floating-shapes';
import { BrowserMockup } from '@/components/common/browser-mockup';
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

/**
 * HERO — cream section, floating shapes, staggered word-rise headline,
 * pill CTAs, honest proof chips and a tilted browser-mockup collage.
 */
export function Hero() {
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  return (
    <section id="hero" className="section-cream relative overflow-hidden">
      <FloatingShapes />

      <div className="relative mx-auto max-w-5xl px-4 pt-14 pb-20 text-center sm:px-6">
        <Sticker rotate={-2}>✦ Web Design & Development Studio</Sticker>

        <Editable id="hero.headline">
          {headlineOverride ? (
            // Admin-authored headline: same word-rise feel, gradient on the last pair.
            <h1 className="mt-8 text-4xl font-bold tracking-tight leading-[1.1] text-[#0a0a0a] sm:text-5xl md:text-7xl">
              {splitWords(headlineOverride)}
            </h1>
          ) : (
            <h1 className="mt-8 text-4xl font-bold tracking-tight leading-[1.1] text-[#0a0a0a] sm:text-5xl md:text-7xl">
              <span className="block">
                <span className="word-rise" style={{ animationDelay: '0ms' }}>
                  We
                </span>{' '}
                <span className="word-rise" style={{ animationDelay: '80ms' }}>
                  Build
                </span>{' '}
                <span className="word-rise" style={{ animationDelay: '160ms' }}>
                  Websites
                </span>
              </span>
              <span className="block">
                <span className="word-rise" style={{ animationDelay: '240ms' }}>
                  That
                </span>{' '}
                <span className="word-rise text-gradient" style={{ animationDelay: '320ms' }}>
                  Win Clients
                </span>
              </span>
              <span className="block">
                <span className="word-rise" style={{ animationDelay: '400ms' }}>
                  And
                </span>{' '}
                <span className="word-rise highlighter" style={{ animationDelay: '480ms' }}>
                  Grow
                </span>{' '}
                <span className="word-rise" style={{ animationDelay: '560ms' }}>
                  Business
                </span>
              </span>
            </h1>
          )}
        </Editable>

        <Editable id="hero.subheadline">
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#4b5563]">{subheadline}</p>
        </Editable>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="btn-primary-pill"
            onClick={() => trackEvent('cta_click', { location: 'hero' })}
          >
            🚀 Start Your Project
          </Link>
          <Link href="/portfolio" className="btn-secondary-pill">
            View Our Work
            <ArrowDown className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Honest proof chips — statements about how we work, not invented reviews */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {HERO_CHIPS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0a] shadow-sm"
            >
              <Icon className="size-4 text-purple-600" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        {/* Tilted browser-mockup collage (center always visible, sides on md+) */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div
            aria-hidden="true"
            className="blob top-1/2 left-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-500 to-pink-500 md:size-[30rem]"
          />
          <div className="relative z-10 mx-auto w-full max-w-2xl rotate-1 tilt-hover">
            <BrowserMockup
              gradient="from-purple-500 to-pink-500"
              variant="store"
              domain="yourstore.com"
            />
          </div>
          <div className="tilt-l tilt-hover absolute top-10 -left-2 hidden w-[38%] md:block">
            <BrowserMockup
              gradient="from-blue-500 to-cyan-400"
              variant="dashboard"
              domain="app.yourbrand.com"
            />
          </div>
          <div className="tilt-r tilt-hover absolute top-14 -right-2 hidden w-[38%] md:block">
            <BrowserMockup
              gradient="from-pink-500 to-orange-400"
              variant="landing"
              domain="launch.yourbrand.com"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Word-split rendering for admin-authored headlines: gradient on the last two words. */
function splitWords(headline: string): ReactNode[] {
  const words = headline.split(/\s+/).filter(Boolean);
  return words.map((word, index) => {
    const isLastPair = index >= words.length - 2 && words.length > 2;
    return (
      <span
        key={`${word}-${index}`}
        className={`word-rise inline-block ${isLastPair ? 'text-gradient' : ''}`}
        style={{ animationDelay: `${Math.min(index * 80, 640)}ms` }}
      >
        {word}
      </span>
    );
  });
}
