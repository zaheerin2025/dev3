'use client';

import { Link } from '@/components/common/link';
import { Editable } from '@/components/admin/editable';
import { trackEvent } from '@/lib/analytics';
import { whatsappLink } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';

/**
 * FINAL CTA — white section with three drifting gradient blobs and an
 * oversized two-line headline with highlighter accent. The supporting
 * line and the WhatsApp link are admin-editable / auto-hidden.
 */
export function CtaSection() {
  const settings = useSiteSettings((s) => s.settings);
  const body = effectiveValue(settings, 'cta.body');
  const whatsapp = whatsappLink();

  return (
    <section id="cta" className="section-white relative overflow-hidden py-24 md:py-32">
      {/* Decorative blurred blobs */}
      <div
        aria-hidden="true"
        className="blob animate-blob top-[-8rem] left-[-8rem] size-96 bg-gradient-to-br from-pink-500 to-yellow-400"
      />
      <div
        aria-hidden="true"
        className="blob animate-blob-alt right-[-6rem] bottom-[-6rem] size-72 bg-gradient-to-br from-pink-500 to-amber-400"
      />
      <div
        aria-hidden="true"
        className="blob animate-blob right-[18%] bottom-[10%] size-72 bg-gradient-to-br from-pink-500 to-orange-400 [animation-delay:-4s]"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-4xl font-bold tracking-tight text-[#0a0a0a] sm:text-5xl md:text-7xl">
          Have a <span className="text-gradient">Project</span>
          <span className="block">
            <span className="highlighter">In Mind?</span>
          </span>
        </h2>

        <Editable id="cta.body">
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#4b5563]">{body}</p>
        </Editable>

        <div className="mt-10">
          <Link
            href="/contact"
            className="btn-primary-pill px-10! py-5! text-lg!"
            onClick={() => trackEvent('cta_click', { location: 'home_final_cta' })}
          >
            🚀 Get a Free Quote
          </Link>
        </div>

        {whatsapp ? (
          <div className="mt-6">
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-bold text-[#0a0a0a] transition-colors hover:text-pink-600"
            >
              📞 Or WhatsApp us directly
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
