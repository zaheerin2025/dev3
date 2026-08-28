'use client';

import * as React from 'react';
import { Clock, Loader2, Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { site } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { services } from '@/data';
import { Link } from '@/components/common/link';
import { trackEvent } from '@/lib/analytics';

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Get a Free Quote', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

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
        <Input
          id="footer-newsletter"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
          className="min-h-[44px] border-blue-400/20 bg-white/5 text-blue-50 placeholder:text-blue-100/40 focus-visible:border-blue-400/50"
        />
        <Button
          type="submit"
          disabled={loading}
          className="min-h-[44px] shrink-0 bg-gradient-to-br from-blue-500 to-cyan-600 shadow-[0_8px_20px_-8px_rgb(13_148_136/0.7)] hover:from-blue-400 hover:to-cyan-500"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Subscribe'}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-blue-100/50">
        One practical web/SEO tip per month. Unsubscribe anytime.
      </p>
    </form>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  // Admin-editable contact lines (fall back to the static site config).
  const settings = useSiteSettings((s) => s.settings);
  const phoneDisplay = settings['contact.phoneDisplay'] || site.phoneDisplay;
  const phoneHref = `tel:${phoneDisplay.replace(/[^+\d]/g, '')}`;
  const email = settings['contact.email'] || site.email;

  return (
    <footer className="relative mt-auto overflow-hidden section-dark">
      {/* Gradient top edge + ambient glow */}
      <div className="divider-gradient absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="glow-orb right-[-8rem] top-[-10rem] h-72 w-72 bg-blue-500/10" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5" ariaLabel="Developers3 — home">
              <img src="/logo.svg" alt="" width={34} height={34} className="h-9 w-9" />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Developers<span className="text-blue-400">3</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-blue-100/60">
              {site.tagline}. We design, build, and grow websites, apps, and software for ambitious businesses — with
              transparent pricing and senior people on every project.
            </p>
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-100/60 ring-1 ring-inset ring-blue-400/15 transition-all hover:-translate-y-0.5 hover:bg-blue-400/10 hover:text-blue-300 hover:ring-blue-400/40"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <nav aria-label="Footer services">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Services</h3>
            <ul className="flex flex-col gap-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/${service.slug}`}
                    className="text-sm text-blue-100/60 transition-colors hover:text-blue-300"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company + legal */}
          <nav aria-label="Footer company">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Company</h3>
            <ul className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/60 transition-colors hover:text-blue-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/40 transition-colors hover:text-blue-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + newsletter */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Get in touch</h3>
              <ul className="flex flex-col gap-3 text-sm text-blue-100/60">
                <li>
                  <a
                    href={phoneHref}
                    onClick={() => trackEvent('call_click', { location: 'footer' })}
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-blue-300"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
                    {phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${email}`}
                    onClick={() => trackEvent('email_click', { location: 'footer' })}
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-blue-300"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
                  <span>
                    {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
                  <span>{site.hours}</span>
                </li>
              </ul>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-blue-400/10 pt-6 sm:flex-row">
          <p className="text-xs text-blue-100/40">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-blue-100/40">
              Web • Apps • Software • SEO — built with performance in mind.
            </p>
            <Link
              href="/admin"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
