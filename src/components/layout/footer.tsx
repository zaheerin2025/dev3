'use client';

import * as React from 'react';
import {
  ArrowUp,
  Clock,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { site } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { services } from '@/data';
import { Link } from '@/components/common/link';
import { trackEvent } from '@/lib/analytics';

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

/**
 * Newsletter form — unchanged behavior (validation, /api/newsletter,
 * toast, analytics), restyled with solid colors only.
 */
function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'Subscription failed.');
      trackEvent('newsletter_signup', { location: 'footer' });
      toast({ title: 'Subscribed!', description: payload.message ?? 'Welcome aboard — one useful email a month, no spam.' });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5" aria-label="Newsletter signup">
      <label htmlFor="footer-newsletter" className="text-sm font-semibold text-white">
        Growth tips in your inbox
      </label>
      <div className="flex gap-2">
        <input
          id="footer-newsletter"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
          className="h-11 w-full min-w-0 rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-zinc-300 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-60"
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" aria-hidden="true" />
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">
        One practical web/SEO tip per month. Unsubscribe anytime.
      </p>
    </form>
  );
}

/** Micro section label used above each link column. */
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </h3>
  );
}

/** Standard footer text link — color-only hover (cheap). */
function FooterLink({ href, children, muted = false }: { href: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm transition-colors hover:text-white ${
        muted ? 'text-zinc-500' : 'text-zinc-400'
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * FOOTER — redesigned for speed and clarity.
 * Performance rules: solid colors and 1px borders only — no backdrop blur,
 * no filter effects, no large shadows, no gradient paint. Hover states use
 * color/transform transitions only (compositor-friendly). Sticky to the
 * bottom via the site shell's `mt-auto`.
 */
export function Footer() {
  const year = new Date().getFullYear();
  // Admin-editable contact lines (fall back to the static site config).
  const settings = useSiteSettings((s) => s.settings);
  const phoneDisplay = settings['contact.phoneDisplay'] || site.phoneDisplay;
  const phoneHref = `tel:${phoneDisplay.replace(/[^+\d]/g, '')}`;
  const email = settings['contact.email'] || site.email;

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0b0b0d] text-zinc-300">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_0.85fr_1.3fr]">
          {/* Brand */}
          <div className="flex flex-col items-start gap-5">
            <Link href="/" className="flex items-center gap-2.5" ariaLabel="Developers3 — home">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-white text-base text-zinc-900"
              >
                ✦
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Developers3
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              Web, app &amp; software development company. Senior-only team, fixed
              quotes, and code you own — from first call to launch day.
            </p>
            {/* Availability status */}
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300">
              <span className="size-2 rounded-full bg-green-500" aria-hidden="true" />
              Available for new projects
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {[
                { icon: Linkedin, href: site.socials.linkedin, label: 'LinkedIn' },
                { icon: Twitter, href: site.socials.twitter, label: 'X (Twitter)' },
                { icon: Instagram, href: site.socials.instagram, label: 'Instagram' },
                { icon: Facebook, href: site.socials.facebook, label: 'Facebook' },
                { icon: Github, href: site.socials.github, label: 'GitHub' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Developers3 on ${label}`}
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition-colors hover:border-white hover:bg-white hover:text-zinc-900"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <nav aria-label="Footer services">
            <ColumnLabel>Services</ColumnLabel>
            <ul className="flex flex-col gap-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <FooterLink href={`/${service.slug}`}>{service.name}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company + legal */}
          <nav aria-label="Footer company">
            <ColumnLabel>Company</ColumnLabel>
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

          {/* Contact + newsletter */}
          <div className="flex flex-col gap-8">
            <div>
              <ColumnLabel>Get in touch</ColumnLabel>
              <ul className="flex flex-col gap-3 text-sm text-zinc-400">
                <li>
                  <a
                    href={phoneHref}
                    onClick={() => trackEvent('call_click', { location: 'footer' })}
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <Phone className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
                    {phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${email}`}
                    onClick={() => trackEvent('email_click', { location: 'footer' })}
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <Mail className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <span>
                    {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <span>{site.hours}</span>
                </li>
              </ul>
            </div>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="hidden text-xs text-zinc-500 sm:block">
              Web • Apps • Software • SEO
            </p>
            <Link
              href="/admin"
              className="text-xs text-zinc-500 transition-colors hover:text-white"
            >
              Admin
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="flex size-10 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition-colors hover:border-white hover:bg-white hover:text-zinc-900"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Oversized watermark wordmark — solid color, zero paint cost */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="mx-auto max-w-7xl px-4 text-center font-display text-[13.5vw] font-bold leading-[0.95] tracking-tight text-white/[0.045] sm:px-6 lg:px-8">
          Developers3
        </p>
      </div>
    </footer>
  );
}
