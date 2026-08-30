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
 * Call-to-action panel used before footers — the full-bleed tangerine
 * moment: solid brand color, oversized grotesk headline, paper pill.
 * Solid colors only, zero paint effects.
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
        <div className="relative overflow-hidden rounded-3xl bg-[#FF4D00] px-6 py-16 text-center sm:px-12 md:py-24">
          <div className="relative flex flex-col items-center gap-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-white" aria-hidden="true" />
              Free consultation
            </span>
            <h2 className="max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-white sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
              <Button
                size="lg"
                className="h-14 rounded-full bg-white px-9 text-base font-bold text-[#161613] shadow-none hover:bg-[#161613] hover:text-white"
                asChild
                onClick={() => trackEvent('cta_click', { location: 'cta_band', target: primaryHref })}
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="ml-1.5 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              {secondaryHref ? (
                <Button
                  size="lg"
                  className="h-14 rounded-full border-2 border-white/60 bg-transparent px-9 text-base font-bold text-white shadow-none hover:border-white hover:bg-white/10"
                  variant="ghost"
                  asChild
                >
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              ) : null}
              {showWhatsapp ? (
                <Button
                  size="lg"
                  className="h-14 rounded-full border-2 border-white/60 bg-transparent px-9 text-base font-bold text-white shadow-none hover:border-white hover:bg-white/10"
                  variant="ghost"
                  asChild
                >
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click', { location: 'cta_band' })}
                  >
                    <MessageCircle className="mr-1.5 h-5 w-5" aria-hidden="true" />
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
