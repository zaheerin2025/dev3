'use client';

import type { ReactNode } from 'react';
import {
  ArrowDown,
  Handshake,
  KeyRound,
  Search,
  ShoppingBag,
  Users,
  Zap,
} from 'lucide-react';
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

/** Words cycled by the animated headline slot (pure CSS, no layout shift). */
const ROTATING_WORDS = ['Websites', 'Stores', 'Apps', 'Brands'];
const ROTATE_STEP_MS = 2400;

/** Tech strip that loops under the hero collage. */
const STACK_MARQUEE = [
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

/** Floating credibility tags orbiting the browser collage (md+ only). */
const FLOATING_TAGS = [
  { icon: Zap, label: 'Next.js + React', className: 'animate-float -left-3 top-4 lg:left-2' },
  { icon: Search, label: 'SEO-ready', className: 'animate-float-slow -right-2 top-16 lg:right-4' },
  { icon: ShoppingBag, label: 'Stores & bookings', className: 'animate-float -left-1 bottom-8 [animation-delay:-2.5s]' },
];

/**
 * HERO — the animated showcase. Cream section with emerald/amber floating
 * shapes, a staggered word-rise headline whose key slot cycles through
 * what we build (CSS-only rotation over a yellow marker stroke), a shine
 * sweep on the primary CTA, honest proof chips, a tilted browser-mockup
 * collage orbited by floating glass tags, and an infinite tech marquee.
 */
export function Hero() {
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  return (
    <section id="hero" className="section-cream relative overflow-hidden">
      <FloatingShapes />
      <div aria-hidden="true" className="bg-grid-light absolute inset-0" />

      <div className="relative mx-auto max-w-5xl px-4 pt-14 pb-20 text-center sm:px-6">
        {/* Live availability badge — pulsing dot inside the brand sticker */}
        <Sticker rotate={-2}>
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          Web Design &amp; Development Studio
        </Sticker>

        <Editable id="hero.headline">
          {headlineOverride ? (
            // Admin-authored headline: same word-rise feel, gradient on the last pair.
            <h1 className="mt-8 text-4xl font-bold tracking-tight leading-[1.1] text-[#0a0a0a] sm:text-5xl md:text-7xl">
              {splitWords(headlineOverride)}
            </h1>
          ) : (
            <h1 className="mt-8 text-4xl font-bold tracking-tight leading-[1.1] text-[#0a0a0a] sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">
                <span className="word-rise" style={{ animationDelay: '0ms' }}>
                  We
                </span>{' '}
                <span className="word-rise" style={{ animationDelay: '80ms' }}>
                  Build
                </span>{' '}
                <RotatingWord />
              </span>
              <span className="block">
                <span className="word-rise" style={{ animationDelay: '160ms' }}>
                  That
                </span>{' '}
                <span className="word-rise text-gradient" style={{ animationDelay: '240ms' }}>
                  Win Clients
                </span>
              </span>
              <span className="block">
                <span className="word-rise" style={{ animationDelay: '320ms' }}>
                  And
                </span>{' '}
                <span className="word-rise" style={{ animationDelay: '400ms' }}>
                  Grow
                </span>{' '}
                <span className="word-rise" style={{ animationDelay: '480ms' }}>
                  Business
                </span>
              </span>
            </h1>
          )}
        </Editable>

        <Editable id="hero.subheadline">
          <p className="word-rise mx-auto mt-6 max-w-2xl text-lg text-[#4b5563]" style={{ animationDelay: '560ms' }}>
            {subheadline}
          </p>
        </Editable>

        <div
          className="word-rise mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: '660ms' }}
        >
          <Link
            href="/contact"
            className="btn-primary-pill btn-shine"
            onClick={() => trackEvent('cta_click', { location: 'hero' })}
          >
            🚀 Start Your Project
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
        <div
          className="word-rise mt-8 flex flex-wrap items-center justify-center gap-2.5"
          style={{ animationDelay: '760ms' }}
        >
          {HERO_CHIPS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0a] shadow-sm transition-colors duration-300 hover:border-emerald-300"
            >
              <Icon className="size-4 text-emerald-600" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        {/* Tilted browser-mockup collage (center always visible, sides on md+)
            orbited by floating glass capability tags */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div
            aria-hidden="true"
            className="blob top-1/2 left-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-emerald-500 to-amber-400 md:size-[30rem]"
          />

          {/* Floating capability tags */}
          {FLOATING_TAGS.map(({ icon: Icon, label, className }) => (
            <span
              key={label}
              className={`glass-chip absolute z-20 hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[#0a0a0a] md:inline-flex ${className}`}
            >
              <Icon className="size-4 text-emerald-600" aria-hidden="true" />
              {label}
            </span>
          ))}

          <div className="relative z-10 mx-auto w-full max-w-2xl rotate-1 tilt-hover">
            <BrowserMockup gradient="from-emerald-500 to-teal-400" variant="store" domain="yourstore.com" />
          </div>
          <div className="tilt-l tilt-hover absolute top-10 -left-2 hidden w-[38%] md:block">
            <BrowserMockup gradient="from-amber-400 to-yellow-300" variant="dashboard" domain="app.yourbrand.com" />
          </div>
          <div className="tilt-r tilt-hover absolute top-14 -right-2 hidden w-[38%] md:block">
            <BrowserMockup gradient="from-lime-400 to-emerald-500" variant="landing" domain="launch.yourbrand.com" />
          </div>
        </div>

        {/* Infinite tech marquee — pauses on hover, respects reduced motion */}
        <div
          className="marquee-hover-pause mx-auto mt-14 max-w-3xl overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-white py-3 shadow-[3px_3px_0_#0a0a0a]"
          role="marquee"
          aria-label="Technologies and services we work with"
        >
          <div className="flex w-max animate-marquee-slow">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1} className="flex items-center gap-8 pr-8">
                {STACK_MARQUEE.map((tech) => (
                  <li key={tech} className="flex items-center gap-8 text-sm font-bold whitespace-nowrap text-[#0a0a0a]">
                    {tech}
                    <span className="fill-emerald-500 text-emerald-500" aria-hidden="true">
                      ✦
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Animated headline slot — all four words stack in the same grid cell so the
 * width stays fixed to the widest word (zero layout shift). Each word fades
 * up, holds, and fades away on a 9.6s loop offset by ROTATE_STEP_MS.
 * Screen readers get a single static word; the rotator is decorative.
 */
function RotatingWord() {
  return (
    <>
      <span className="sr-only">Websites</span>
      <span
        aria-hidden="true"
        className="word-rise hero-rotator"
        style={{ animationDelay: '160ms' }}
      >
        {ROTATING_WORDS.map((word, index) => (
          <span key={word} className="highlighter" style={{ animationDelay: `${index * ROTATE_STEP_MS}ms` }}>
            {word}
          </span>
        ))}
      </span>
    </>
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
