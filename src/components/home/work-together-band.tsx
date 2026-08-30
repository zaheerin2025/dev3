'use client';

import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from '@/components/common/link';
import { trackEvent } from '@/lib/analytics';
import { site, whatsappLink } from '@/lib/site';

/**
 * LET'S WORK TOGETHER — a proper interactive band, not a repeating
 * slider: one bold statement on the left, real actions on the right
 * (quote request + WhatsApp). Solid amber paint, hairline ink borders,
 * transform-only hover — cheap to render, unmistakably on-brand.
 */
export function WorkTogetherBand() {
  const whatsapp = whatsappLink();

  return (
    <section aria-label="Let's work together" className="border-y-2 border-[#161613] bg-[#FFB020]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-7 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-10 md:py-12 lg:px-8">
        {/* Statement — the whole block links to the quote page */}
        <Link
          href="/contact"
          className="group flex flex-col items-start gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161613] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFB020]"
          onClick={() => trackEvent('cta_click', { location: 'work_together_band' })}
        >
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#161613]/70">
            Ready when you are
          </span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-4xl font-bold leading-none tracking-[-0.02em] text-[#161613] sm:text-5xl">
            Let&rsquo;s work together
            <ArrowRight
              className="size-8 shrink-0 transition-transform duration-300 group-hover:translate-x-2 sm:size-10"
              aria-hidden="true"
            />
          </span>
        </Link>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#161613] px-7 py-3.5 text-base font-bold text-[#FFB020] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161613] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFB020]"
            onClick={() => trackEvent('cta_click', { location: 'work_together_band_quote' })}
          >
            Get a Free Quote
          </Link>
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#161613] px-7 py-3 text-base font-bold text-[#161613] transition-colors duration-200 hover:bg-[#161613] hover:text-[#FFB020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161613] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFB020]"
              onClick={() => trackEvent('whatsapp_click', { location: 'work_together_band' })}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              WhatsApp us
            </a>
          ) : null}
        </div>
      </div>

      {/* Screen-reader context for the band */}
      <p className="sr-only">
        Start a project with {site.name} — request a free quote or message us on WhatsApp.
      </p>
    </section>
  );
}
