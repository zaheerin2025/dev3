import { Globe2 } from 'lucide-react';
import { Link } from '@/components/common/link';
import { trackEvent } from '@/lib/analytics';

/**
 * Regions we genuinely serve — named in the copy below and emitted as
 * areaServed in the Organization schema. Kept in one place so the text
 * and the structured data always agree (no schema/copy mismatches).
 */
export const SERVED_REGIONS = [
  'USA',
  'UK',
  'Canada',
  'Germany',
  'France',
  'Europe',
  'Asia',
] as const;

/**
 * SEO CONTENT — honest, human-readable closing copy for the homepage.
 * It naturally tells international visitors (USA, UK, Canada, Germany,
 * France, Europe, Asia) that we work with them, while covering the core
 * service keywords once — no stuffing, no hidden text, nothing that
 * violates search guidelines. Sits at the very bottom of the page,
 * directly above the footer.
 */
export function SeoContentSection() {
  return (
    <section
      id="worldwide"
      aria-labelledby="worldwide-heading"
      className="border-t border-[#e6e5de] bg-white py-14 md:py-16"
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow inline-flex items-center gap-2.5">
          <Globe2 className="size-4 text-[#FF4D00]" aria-hidden="true" />
          Who We Work With
        </p>
        <h2
          id="worldwide-heading"
          className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-[#161613] sm:text-3xl"
        >
          A Web Development Company Serving Businesses in the USA, UK, Canada,
          Germany, France, Europe &amp; Asia
        </h2>

        <div className="mt-5 flex flex-wrap gap-2">
          {SERVED_REGIONS.map((region) => (
            <span
              key={region}
              className="rounded-full border border-[#e6e5de] bg-[#fafaf7] px-3.5 py-1.5 text-sm font-semibold text-[#161613]"
            >
              {region}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-[#5c5b54]">
          <p>
            Developers3 is a full-service web development company working with
            clients internationally. From startups and agencies in the{' '}
            <strong className="font-semibold text-[#161613]">USA</strong> and{' '}
            <strong className="font-semibold text-[#161613]">UK</strong> to
            growing businesses across{' '}
            <strong className="font-semibold text-[#161613]">Canada</strong>,{' '}
            <strong className="font-semibold text-[#161613]">Germany</strong>,{' '}
            <strong className="font-semibold text-[#161613]">France</strong>{' '}
            and the wider{' '}
            <strong className="font-semibold text-[#161613]">European</strong>{' '}
            and{' '}
            <strong className="font-semibold text-[#161613]">Asian</strong>{' '}
            markets, we design and build custom websites, e-commerce stores,
            mobile apps and software that help businesses grow online — no
            matter where they are headquartered.
          </p>
          <p>
            Working across time zones is part of our process, not an
            afterthought: clear written updates, scheduled calls that suit
            your working hours, fixed itemized quotes in USD, and one senior
            team from first call to launch. Whether you need a five-page
            business website for local customers, a multilingual e-commerce
            platform for shoppers across Europe, a cross-platform Flutter app
            on the App Store and Play Store, or SEO and Google Ads management
            that puts you in front of the right market — the same team
            delivers your project end to end.
          </p>
          <p>
            Wherever your business is based, you get honest pricing, code you
            own, and a partner invested in measurable results.{' '}
            <Link
              href="/contact"
              className="font-semibold text-[#161613] underline decoration-[#FF4D00] decoration-2 underline-offset-4 transition-colors hover:text-[#FF4D00]"
              onClick={() => trackEvent('cta_click', { location: 'seo_footer' })}
            >
              Request a free quote
            </Link>{' '}
            — we reply within one business day, usually much sooner.
          </p>
        </div>
      </div>
    </section>
  );
}
