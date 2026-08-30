'use client';

import {
  ArrowUpRight,
  CalendarCheck,
  Clock,
  Facebook,
  FileText,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  type LucideIcon,
} from 'lucide-react';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { FAQSection } from '@/components/common/faq-section';
import { QuoteBuilder } from '@/components/common/quote-builder';
import { JsonLd } from '@/components/common/json-ld';
import { homeFaqs } from '@/data';
import { site } from '@/lib/site';
import { useSiteSettings } from '@/lib/use-site-settings';
import { trackEvent } from '@/lib/analytics';


const SOCIAL_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'LinkedIn', href: site.socials.linkedin, icon: Linkedin },
  { label: 'X (Twitter)', href: site.socials.twitter, icon: Twitter },
  { label: 'Instagram', href: site.socials.instagram, icon: Instagram },
  { label: 'Facebook', href: site.socials.facebook, icon: Facebook },
  { label: 'GitHub', href: site.socials.github, icon: Github },
];

/** /contact — inquiry form plus every way to reach the team. */
export function ContactView() {
  // Admin-editable contact details (fall back to the static site config).
  const settings = useSiteSettings((s) => s.settings);
  const phoneDisplay = settings['contact.phoneDisplay'] || site.phoneDisplay;
  const phoneHref = `tel:${phoneDisplay.replace(/[^+\d]/g, '')}`;
  const email = settings['contact.email'] || site.email;
  const whatsappNumber = (settings['contact.whatsappNumber'] || site.whatsappNumber).replace(
    /\D/g,
    ''
  );
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    site.whatsappMessage
  )}`;

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.address.street}, ${site.address.city} ${site.address.state}`
  )}`;

  const METHODS: {
    icon: LucideIcon;
    title: string;
    description: string;
    action: string;
    href: string;
    note: string;
    event: 'email_click' | 'call_click' | 'whatsapp_click';
    external?: boolean;
  }[] = [
    {
      icon: Mail,
      title: 'Email us',
      description: 'Best for briefs, RFPs and documents.',
      action: email,
      href: `mailto:${email}`,
      note: 'Replies within 4 business hours',
      event: 'email_click',
    },
    {
      icon: Phone,
      title: 'Call us',
      description: 'Talk directly with a senior engineer.',
      action: phoneDisplay,
      href: phoneHref,
      note: site.hours,
      event: 'call_click',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Share links, screenshots and questions.',
      action: 'Start a chat',
      href: whatsappHref,
      note: 'Typical reply: under 15 minutes',
      event: 'whatsapp_click',
      external: true,
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Developers3',
          url: `${site.url}/contact`,
          about: { '@id': `${site.url}/#organization` },
        }}
      />

      {/* Hero */}
      <Section grid className="lg:py-20">
        <span
          className="glow-orb left-[-9rem] top-[-7rem] h-72 w-72 bg-blue-400/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-7rem] top-16 h-64 w-64 bg-cyan-400/20"
          aria-hidden="true"
        />
        <h1 className="sr-only">
          Contact Developers3 — Web, App &amp; Software Development Company
        </h1>
        <div className="relative mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Contact"
            title="Let's talk about your **next project**"
            description="Tell us what you're building and get a free, itemized quote within one business day. Prefer to talk first? Call, WhatsApp or email — a senior engineer replies, not a salesperson."
            className="mb-6 md:mb-8"
          />
        </div>
      </Section>

      {/* Contact methods + form + office strip */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {METHODS.map((method, index) => (
            <Reveal key={method.title} delay={index * 80}>
              <a
                href={method.href}
                target={method.external ? '_blank' : undefined}
                rel={method.external ? 'noopener noreferrer' : undefined}
                onClick={() => trackEvent(method.event, { location: 'contact' })}
                className="card-surface card-hover group flex h-full flex-col gap-3 rounded-3xl p-6"
              >
                <span className="icon-tile h-12 w-12" aria-hidden="true">
                  <method.icon className="h-5 w-5" />
                </span>
                <span className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{method.title}</h3>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-blue-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
                <p className="text-sm text-muted-foreground">{method.description}</p>
                <span className="truncate text-sm font-semibold text-blue-700">
                  {method.action}
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
                  {method.note}
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Inquiry form — the centerpiece */}
        <Reveal className="mt-12 md:mt-16">
          <QuoteBuilder source="contact" variant="inline" />
        </Reveal>

        {/* Office info strip */}
        <Reveal className="mt-12 md:mt-16">
          <div className="card-surface grid gap-8 rounded-3xl p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
            <div className="flex items-start gap-4">
              <span className="icon-tile h-11 w-11 shrink-0" aria-hidden="true">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">Visit our office</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  <span className="block font-medium text-foreground">{site.address.street}</span>
                  {site.address.city}, {site.address.state} {site.address.zip}
                </p>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-sm font-semibold text-blue-700 hover:underline"
                >
                  Get directions →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="icon-tile h-11 w-11 shrink-0" aria-hidden="true">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">Business hours</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  <span className="block font-medium text-foreground">{site.hours}</span>
                  San Francisco time (PT)
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="h-2 w-2 shrink-0 animate-pulse-dot rounded-full bg-blue-500"
                    aria-hidden="true"
                  />
                  Async-friendly — we reply across time zones
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="icon-tile h-11 w-11 shrink-0" aria-hidden="true">
                <Globe className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">Follow us</h3>
                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Developers3 on ${social.label}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-600 hover:text-white hover:shadow-[0_8px_18px_-8px_rgb(37_99_235/0.55)]"
                    >
                      <social.icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* FAQ teaser */}
      <Section tinted>
        <FAQSection faqs={homeFaqs.slice(0, 3)} title="Quick Answers" />
      </Section>
    </>
  );
}
