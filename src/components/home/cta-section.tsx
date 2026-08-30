'use client';

import { Link } from '@/components/common/link';
import { Editable } from '@/components/admin/editable';
import { trackEvent } from '@/lib/analytics';
import { whatsappLink } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';

/**
 * FINAL CTA — full ink canvas, oversized serif headline with an italic
 * accent and a paper pill. No decorative paint; typography carries it.
 */
export function CtaSection() {
  const settings = useSiteSettings((s) => s.settings);
  const body = effectiveValue(settings, 'cta.body');
  const whatsapp = whatsappLink();

  return (
    <section id="cta" className="section-black relative overflow-hidden py-24 md:py-32">
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="eyebrow inline-flex items-center gap-2.5 text-white/50">
          <span className="size-1.5 rounded-full bg-[#ff4d00]" aria-hidden="true" />
          Free Quote Within One Business Day
        </p>

        <h2 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-[-0.01em] text-white sm:text-6xl md:text-7xl">
          Have a project
          <span className="block">
            <em className="italic">in mind?</em>
          </span>
        </h2>

        <Editable id="cta.body">
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60">{body}</p>
        </Editable>

        <div className="mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fafaf7] px-10 py-5 text-lg font-bold text-[#161613] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#131316]"
            onClick={() => trackEvent('cta_click', { location: 'home_final_cta' })}
          >
            Get a Free Quote
          </Link>
        </div>

        {whatsapp ? (
          <div className="mt-6">
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-bold text-white/70 transition-colors hover:text-white"
            >
              Or WhatsApp us directly
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
