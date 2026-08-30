'use client';

import * as React from 'react';
import { ArrowUp, Mail, MessageCircle, Sparkle, Target } from 'lucide-react';
import { site } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';
import { getService } from '@/data';
import type { Service } from '@/lib/types';
import { Link } from '@/components/common/link';
import { trackEvent } from '@/lib/analytics';
import { ACCENT_DOT } from '@/lib/accent';

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

/**
 * The 5 core services — short, professional, guaranteed single-line
 * menu (the full catalogue lives on /services).
 */
const FOOTER_SERVICE_SLUGS = [
  'custom-website-development',
  'mobile-app-development',
  'software-development',
  'ecommerce-development',
  'google-ads-management',
] as const;

const FOOTER_SERVICES = FOOTER_SERVICE_SLUGS
  .map((slug) => getService(slug))
  .filter((s): s is Service => Boolean(s));

/** Micro section label used above each link column — ramp-colored dot marker. */
function ColumnLabel({ children, accent = 0 }: { children: React.ReactNode; accent?: number }) {
  return (
    <h3 className="mb-4 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
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
 * FOOTER — compact enough to fit one screen, with every menu accounted
 * for: brand + availability, a two-column services index, company/legal
 * links, and the real contact block (WhatsApp, general email, marketing
 * & partnerships email). The tangerine hairline on top is the separator
 * between the page (CTA) and the footer. Performance rules: solid
 * colors and 1px borders only — no blur, no filters, no gradients.
 */
export function Footer() {
  const year = new Date().getFullYear();
  // Admin overrides win; real defaults live in site.ts.
  const settings = useSiteSettings((s) => s.settings);
  const whatsappNumber = (
    settings['contact.whatsappNumber'] || site.whatsappNumber
  ).replace(/\D/g, '');
  const whatsappDisplay = settings['contact.whatsappNumber']
    ? `+${whatsappNumber}`
    : site.whatsappDisplay;
  const email = settings['contact.email'] || site.email;
  const businessEmail = settings['contact.businessEmail'] || site.businessEmail;
  const blurb = effectiveValue(settings, 'footer.blurb');

  return (
    <footer className="mt-auto border-t-2 border-[#FF4D00] bg-[#0E0E10] text-zinc-300">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.15fr_1.25fr_0.85fr_1.15fr] lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-5">
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
            <p className="max-w-xs text-[15px] leading-relaxed text-zinc-400">{blurb}</p>
            {/* Availability status */}
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-300">
              <span className="size-2 rounded-full bg-green-500" aria-hidden="true" />
              Available for new projects
            </p>
          </div>

          {/* Services — 5 core services, one clean single-line column */}
          <nav aria-label="Footer services">
            <ColumnLabel accent={0}>Services</ColumnLabel>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_SERVICES.map((service, index) => (
                <li key={service.slug}>
                  <FooterLink href={`/${service.slug}`}>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${ACCENT_DOT[index % ACCENT_DOT.length]}`}
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
            <ul className="flex flex-col gap-2.5">
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

          {/* Real contact details */}
          <div>
            <ColumnLabel accent={3}>Get in touch</ColumnLabel>
            <ul className="flex flex-col gap-4 text-[15px]">
              {whatsappNumber ? (
                <li>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click', { location: 'footer' })}
                    className="group inline-flex items-start gap-3 text-zinc-400 transition-colors hover:text-white"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                      <MessageCircle className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold text-zinc-200">WhatsApp</span>
                      <span className="group-hover:text-white">{whatsappDisplay}</span>
                    </span>
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    onClick={() => trackEvent('email_click', { location: 'footer' })}
                    className="group inline-flex items-start gap-3 text-zinc-400 transition-colors hover:text-white"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FF4D00]/15 text-[#FF4D00]">
                      <Mail className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold text-zinc-200">Email</span>
                      <span className="break-all group-hover:text-white">{email}</span>
                    </span>
                  </a>
                </li>
              ) : null}
              {businessEmail ? (
                <li>
                  <a
                    href={`mailto:${businessEmail}`}
                    onClick={() => trackEvent('email_click', { location: 'footer_marketing' })}
                    className="group inline-flex items-start gap-3 text-zinc-400 transition-colors hover:text-white"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFB020]/15 text-[#FFB020]">
                      <Target className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold text-zinc-200">
                        Marketing &amp; Partnerships
                      </span>
                      <span className="break-all group-hover:text-white">{businessEmail}</span>
                    </span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-zinc-500 sm:block">
              Websites • Apps • Software • Marketing
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
    </footer>
  );
}
