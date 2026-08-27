'use client';

import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { whatsappLink } from '@/lib/site';
import { Link } from './link';

interface CTABandProps {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showWhatsapp?: boolean;
  className?: string;
}

/** Dark gradient call-to-action band used before footers. */
export function CTABand({
  title = 'Start Your Project Today',
  description = 'Tell us what you are building and get a free, itemized quote within one business day. No pressure, no jargon — just straight advice from senior engineers.',
  primaryHref = '/contact',
  primaryLabel = 'Get Free Quote',
  secondaryHref = '/portfolio',
  secondaryLabel = 'View Our Work',
  showWhatsapp = true,
  className,
}: CTABandProps) {
  return (
    <section className={cn('relative w-full overflow-hidden section-dark-deep', className)}>
      <div className="bg-dots-dark absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
        <h2 className="max-w-3xl text-3xl font-bold text-balance text-white sm:text-4xl">{title}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-emerald-100/70 sm:text-lg">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            asChild
            onClick={() => trackEvent('cta_click', { location: 'cta_band', target: primaryHref })}
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          {secondaryHref ? (
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-400/30 bg-transparent text-emerald-50 hover:bg-emerald-400/10 hover:text-white"
              asChild
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
          {showWhatsapp ? (
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-400/30 bg-transparent text-emerald-50 hover:bg-emerald-400/10 hover:text-white"
              asChild
            >
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { location: 'cta_band' })}
              >
                <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />
                WhatsApp Us
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
