'use client';

import * as React from 'react';
import { Check, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { FAQSection } from '@/components/common/faq-section';
import { LeadForm } from '@/components/common/lead-form';
import { JsonLd } from '@/components/common/json-ld';
import { homeFaqs } from '@/data';
import { site, whatsappLink } from '@/lib/site';
import { trackEvent } from '@/lib/analytics';

const TRUST_POINTS = [
  `${site.stats.satisfaction} client satisfaction rating`,
  'Replies within 1 business day',
  'Fixed quotes, no surprises',
];

/** /contact — inquiry form plus every way to reach the team. */
export function ContactView() {
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.address.street}, ${site.address.city} ${site.address.state}`
  )}`;

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
      <Section tinted>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Contact' }]} />
          <h1 className="mt-6 text-3xl font-bold text-balance sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tell us about your project and get a free, itemized quote within one business day.
            Prefer to talk first? Call, WhatsApp, or email — a senior team member (not a
            salesperson) will reply.
          </p>
        </div>
      </Section>

      {/* Form + contact channels */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <Card className="rounded-2xl p-6 lg:p-8">
              <LeadForm source="contact" />
            </Card>
          </Reveal>

          <Reveal delay={100} className="flex flex-col gap-4">
            {/* Talk to us */}
            <Card className="rounded-2xl p-6">
              <CardContent className="flex flex-col gap-4 p-0">
                <h2 className="text-lg font-semibold">Talk to us</h2>
                <a
                  href={site.phoneHref}
                  onClick={() => trackEvent('call_click', { location: 'contact' })}
                  className="flex min-h-11 items-center gap-4 rounded-lg p-1 transition-colors hover:bg-accent"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">Phone</span>
                    <span className="block font-semibold">{site.phoneDisplay}</span>
                  </span>
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { location: 'contact' })}
                  className="flex min-h-11 items-center gap-4 rounded-lg p-1 transition-colors hover:bg-accent"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">Instant chat</span>
                    <span className="block font-semibold">WhatsApp chat</span>
                  </span>
                </a>
                <a
                  href={`mailto:${site.email}`}
                  onClick={() => trackEvent('email_click', { location: 'contact' })}
                  className="flex min-h-11 items-center gap-4 rounded-lg p-1 transition-colors hover:bg-accent"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">Email</span>
                    <span className="block font-semibold">{site.email}</span>
                  </span>
                </a>
              </CardContent>
            </Card>

            {/* Visit us */}
            <Card className="rounded-2xl p-6">
              <CardContent className="flex flex-col gap-4 p-0">
                <h2 className="text-lg font-semibold">Visit us</h2>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{site.address.street}</span>
                    <span className="block text-muted-foreground">
                      {site.address.city}, {site.address.state} {site.address.zip}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold">{site.hours}</span>
                </div>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Get directions →
                </a>
              </CardContent>
            </Card>

            {/* Map placeholder — instant load, no third-party embed */}
            <div
              className="relative flex h-48 items-center justify-center rounded-2xl bg-grid-light ring-1 ring-emerald-600/10"
              role="img"
              aria-label={`Map placeholder showing the Developers3 office at ${site.address.street}, ${site.address.city}, ${site.address.state}`}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <MapPin className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                <p className="text-sm font-medium">
                  {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
                </p>
                <p className="text-xs text-muted-foreground">Serving clients worldwide from San Francisco</p>
              </div>
            </div>

            {/* Trust */}
            <Card className="rounded-2xl p-6">
              <CardContent className="flex flex-col gap-3 p-0">
                <h2 className="text-lg font-semibold">Why clients trust us</h2>
                <ul className="flex flex-col gap-2.5">
                  {TRUST_POINTS.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* FAQ teaser */}
      <Section tinted>
        <FAQSection faqs={homeFaqs.slice(0, 3)} title="Quick Answers" />
      </Section>
    </>
  );
}
