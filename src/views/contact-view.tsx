'use client';

import { ArrowUpRight, Clock, Mail, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
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

/**
 * /contact — the inquiry form is the centerpiece. Direct-contact channels
 * (email / phone / WhatsApp) render ONLY when the owner has set real values
 * in the admin panel — never fake placeholders.
 */
export function ContactView() {
  // Admin-editable contact details (empty until the owner sets real ones).
  const settings = useSiteSettings((s) => s.settings);
  const phoneDisplay = settings['contact.phoneDisplay'] || site.phoneDisplay;
  const phoneHref = `tel:${phoneDisplay.replace(/[^+\d]/g, '')}`;
  const email = settings['contact.email'] || site.email;
  const whatsappNumber = (settings['contact.whatsappNumber'] || site.whatsappNumber).replace(
    /\D/g,
    ''
  );

  const METHODS: {
    icon: LucideIcon;
    title: string;
    description: string;
    action: string;
    href: string;
    note: string;
    event: 'email_click' | 'call_click' | 'whatsapp_click';
    external?: boolean;
  }[] = [];

  if (email) {
    METHODS.push({
      icon: Mail,
      title: 'Email us',
      description: 'Best for briefs, RFPs and documents.',
      action: email,
      href: `mailto:${email}`,
      note: 'Replies within 4 business hours',
      event: 'email_click',
    });
  }
  if (phoneDisplay) {
    METHODS.push({
      icon: Phone,
      title: 'Call us',
      description: 'Talk directly with a senior engineer.',
      action: phoneDisplay,
      href: phoneHref,
      note: 'Replies within 4 business hours',
      event: 'call_click',
    });
  }
  if (whatsappNumber) {
    METHODS.push({
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Share links, screenshots and questions.',
      action: 'Start a chat',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`,
      note: 'Replies within 4 business hours',
      event: 'whatsapp_click',
      external: true,
    });
  }

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
          className="glow-orb left-[-9rem] top-[-7rem] h-72 w-72 bg-gray-400/25"
          aria-hidden="true"
        />
        <span
          className="glow-orb right-[-7rem] top-16 h-64 w-64 bg-gray-400/20"
          aria-hidden="true"
        />
        <h1 className="sr-only">
          Contact Developers3 — Web, App &amp; Software Development Company
        </h1>
        <div className="relative mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Contact"
            title="Let's talk about your **next project**"
            description="Tell us what you're building and get a free, itemized quote within one business day. A senior engineer replies, not a salesperson."
            className="mb-6 md:mb-8"
          />
        </div>
      </Section>

      {/* Contact methods (only real ones) + form */}
      <Section>
        {METHODS.length > 0 ? (
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
                      className="h-5 w-5 shrink-0 text-gray-800 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <span className="truncate text-sm font-semibold text-gray-800">
                    {method.action}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-gray-800" aria-hidden="true" />
                    {method.note}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        ) : null}

        {/* Inquiry form — the centerpiece */}
        <Reveal className={METHODS.length > 0 ? 'mt-12 md:mt-16' : ''}>
          <QuoteBuilder source="contact" variant="inline" />
        </Reveal>
      </Section>

      {/* FAQ teaser */}
      <Section tinted>
        <FAQSection faqs={homeFaqs.slice(0, 3)} title="Quick Answers" />
      </Section>
    </>
  );
}
