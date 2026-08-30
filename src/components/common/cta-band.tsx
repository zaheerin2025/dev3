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
 * Call-to-action panel used before footers — a rounded brand-gradient panel
 * with ambient glow orbs, pattern, and strong contrast.
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
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-800 to-[#050914] px-6 py-16 text-center shadow-[0_32px_64px_-32px_rgb(4_16_11/0.6)] sm:px-12 md:py-20">
          {/* Ambient glows */}
          <span
            className="glow-orb left-[-6rem] top-[-8rem] h-72 w-72 bg-blue-400/30"
            aria-hidden="true"
          />
          <span
            className="glow-orb bottom-[-9rem] right-[-4rem] h-80 w-80 bg-cyan-400/25"
            aria-hidden="true"
          />
          {/* Dot texture */}
          <span
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.09) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100 ring-1 ring-inset ring-white/20">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-blue-300" aria-hidden="true" />
              Free consultation
            </span>
            <h2 className="max-w-3xl text-3xl font-bold text-balance text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              {title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-blue-50/85 sm:text-lg">{description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                size="lg"
                className="h-12 bg-white px-7 text-blue-800 shadow-lg shadow-black/25 hover:bg-blue-50"
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
                  className="h-12 border border-white/30 bg-white/10 px-7 text-white shadow-none backdrop-blur-sm hover:bg-white/20"
                  variant="ghost"
                  asChild
                >
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              ) : null}
              {showWhatsapp ? (
                <Button
                  size="lg"
                  className="h-12 border border-white/30 bg-transparent px-7 text-white shadow-none hover:bg-white/10"
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
