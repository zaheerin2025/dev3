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

/**
 * Call-to-action panel used before footers — flat ink canvas, hairline
 * frame, serif headline and paper pill. Solid colors only, zero paint
 * effects (no glows, no dot textures, no backdrop blur).
 */
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
    <section className={cn('relative w-full px-4 pb-16 pt-4 sm:px-6 md:pb-24 lg:px-8', className)}>
      <div className="relative mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#131316] px-6 py-16 text-center sm:px-12 md:py-20">
          <div className="relative flex flex-col items-center gap-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-green-500" aria-hidden="true" />
              Free consultation
            </span>
            <h2 className="max-w-3xl text-balance font-display text-3xl font-medium leading-[1.1] tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                size="lg"
                className="h-12 rounded-full bg-[#fafaf7] px-7 text-[#161613] shadow-none hover:bg-white"
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
                  className="h-12 rounded-full border border-white/25 bg-transparent px-7 text-white shadow-none hover:bg-white/10"
                  variant="ghost"
                  asChild
                >
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              ) : null}
              {showWhatsapp ? (
                <Button
                  size="lg"
                  className="h-12 rounded-full border border-white/25 bg-transparent px-7 text-white shadow-none hover:bg-white/10"
                  variant="ghost"
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
        </div>
      </div>
    </section>
  );
}
