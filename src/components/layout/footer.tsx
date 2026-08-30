'use client';

import * as React from 'react';
import { ArrowUp, Clock, Mail, Phone, Sparkle } from 'lucide-react';
import { site } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { services } from '@/data';
import { Link } from '@/components/common/link';
import { trackEvent } from '@/lib/analytics';
import { ACCENT_DOT } from '@/lib/accent';

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Get a Free Quote', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

/** Micro section label used above each link column — ramp-colored dot marker. */
function ColumnLabel({ children, accent = 0 }: { children: React.ReactNode; accent?: number }) {
  return (
    <h3 className="mb-5 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
      <span className={`size-2 rounded-full ${ACCENT_DOT[accent % ACCENT_DOT.length]}`} aria-hidden="true" />
      {children}
    </h3>
  );
}

/** Standard footer text link — color-only hover (cheap). */
function FooterLink({ href, children, muted = false }: { href: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <Link
      href={href}
      className={`text-[15px] transition-colors hover:text-white ${
        muted ? 'text-zinc-500' : 'text-zinc-400'
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * FOOTER — redesigned for speed and clarity, with zero fake data.
 * Contact details appear ONLY when the owner has set real values in the
 * admin panel; there is no newsletter and no social links until real
 * profiles exist. Performance rules: solid colors and 1px borders only —
 * no backdrop blur, no filter effects, no large shadows, no gradients.
 */
export function Footer() {
  const year = new Date().getFullYear();
  // Admin-editable contact lines (empty until the owner sets real values).
  const settings = useSiteSettings((s) => s.settings);
  const phoneDisplay = settings['contact.phoneDisplay'] || site.phoneDisplay;
  const phoneHref = `tel:${phoneDisplay.replace(/[^+\d]/g, '')}`;
  const email = settings['contact.email'] || site.email;
  const hours = settings['contact.hours'] || site.hours;
  const hasContact = Boolean(phoneDisplay || email);

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#131316] text-zinc-300">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-start gap-6">
            <Link href="/" className="flex items-center gap-3" ariaLabel="Developers3 — home">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-[#FF4D00] text-white"
              >
                <Sparkle className="size-5" fill="currentColor" />
              </span>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Developers3
              </span>
            </Link>
            <p className="max-w-xs text-[15px] leading-relaxed text-zinc-400">
              Web, app &amp; software development company. Senior-only team, fixed
              quotes, and code you own — from first call to launch day.
            </p>
            {/* Availability status */}
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-300">
              <span className="size-2 rounded-full bg-green-500" aria-hidden="true" />
              Available for new projects
            </p>
          </div>

          {/* Services */}
          <nav aria-label="Footer services">
            <ColumnLabel accent={0}>Services</ColumnLabel>
            <ul className="flex flex-col gap-3">
              {services.map((service, index) => (
                <li key={service.slug}>
                  <FooterLink href={`/${service.slug}`}>
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        className={`size-1.5 rounded-full ${ACCENT_DOT[index % ACCENT_DOT.length]}`}
                        aria-hidden="true"
                      />
                      {service.name}
                    </span>
                  </FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company + legal */}
          <nav aria-label="Footer company">
            <ColumnLabel accent={2}>Company</ColumnLabel>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} muted>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contact strip — only when real contact details exist */}
        {hasContact ? (
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-[15px] text-zinc-400">
            {phoneDisplay ? (
              <a
                href={phoneHref}
                onClick={() => trackEvent('call_click', { location: 'footer' })}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Phone className="size-4.5 shrink-0 text-[#FF4D00]" aria-hidden="true" />
                {phoneDisplay}
              </a>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                onClick={() => trackEvent('email_click', { location: 'footer' })}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Mail className="size-4.5 shrink-0 text-[#FF4D00]" aria-hidden="true" />
                {email}
              </a>
            ) : null}
            {hours ? (
              <span className="inline-flex items-center gap-2.5">
                <Clock className="size-4.5 shrink-0 text-[#FF4D00]" aria-hidden="true" />
                {hours}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-zinc-500 sm:block">
              Web • Apps • Software • SEO
            </p>
            <Link
              href="/admin"
              className="text-sm text-zinc-500 transition-colors hover:text-white"
            >
              Admin
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition-colors hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white"
            >
              <ArrowUp className="size-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Oversized watermark wordmark — solid color, zero paint cost */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="mx-auto max-w-7xl px-4 text-center font-display text-[13.5vw] font-bold leading-[0.95] tracking-tight text-white/[0.05] sm:px-6 lg:px-8">
          Developers3
        </p>
      </div>
    </footer>
  );
}
