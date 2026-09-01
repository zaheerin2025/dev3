'use client';

import * as React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Handshake,
  KeyRound,
  Loader2,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from '@/components/common/link';
import { Editable } from '@/components/admin/editable';
import { trackEvent } from '@/lib/analytics';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';
import { ACCENT_TEXT } from '@/lib/accent';
import { useToast } from '@/hooks/use-toast';
import { EMAIL_REGEX } from '@/lib/utils';

const HERO_CHIPS = [
  { icon: Users, label: 'Senior-only team' },
  { icon: Handshake, label: 'Fixed quotes, no surprises' },
  { icon: KeyRound, label: 'You own the code' },
];

const ROTATOR_ITEMS = [
  'A Better Website',
  'More Customers',
  'A Mobile App',
  'Google Ads',
  'Meta Ads',
  'Better Visibility',
];

const ROTATOR_SLOT = 2.6;

const QUICK_SERVICES = [
  { id: 'web', label: 'Website / Web App' },
  { id: 'app', label: 'Mobile App (iOS/Android)' },
  { id: 'ecom', label: 'E-commerce / Store' },
  { id: 'software', label: 'Custom Software' },
];

export function Hero() {
  const { toast } = useToast();
  const settings = useSiteSettings((s) => s.settings);
  const headlineOverride = settings['hero.headline'] ?? '';
  const subheadline = effectiveValue(settings, 'hero.subheadline');

  // Quick Lead Form State
  const [selectedService, setSelectedService] = React.useState('web');
  const [contactInfo, setContactInfo] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.trim()) {
      toast({ title: 'Please enter your email or phone number', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const isEmail = EMAIL_REGEX.test(contactInfo.trim());
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hero Quick Inquiry',
          email: isEmail ? contactInfo.trim() : `phone-lead-${Date.now()}@developers3.com`,
          phone: !isEmail ? contactInfo.trim() : '',
          service: QUICK_SERVICES.find((s) => s.id === selectedService)?.label ?? selectedService,
          message: message.trim() || `Quick project request for ${selectedService} from hero section. Contact: ${contactInfo.trim()}`,
          source: 'hero_quick_input',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Submission failed.');
      }
      setSubmitted(true);
      trackEvent('lead_submitted', { location: 'hero_quick_input' });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="hero" className="section-white relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-14 md:pt-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left — Headline block */}
          <div className="lg:col-span-7">
            <p className="eyebrow inline-flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
              Websites • Apps • Software • Marketing
            </p>

            <Editable id="hero.headline">
              {headlineOverride ? (
                <h1 className="mt-5 max-w-4xl font-display text-[2.7rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#161613] sm:text-6xl lg:text-[4.5rem]">
                  {headlineOverride}
                </h1>
              ) : (
                <h1 className="mt-5 max-w-4xl font-display text-[2.5rem] font-bold leading-[1.07] tracking-[-0.03em] text-[#161613] sm:text-5xl lg:text-[4.4rem]">
                  <span className="sr-only">
                    Your business needs a better website, more customers, a mobile app, Google
                    Ads, Meta Ads, or better visibility — we make it happen.
                  </span>
                  <span aria-hidden="true">
                    <span className="word-rise block" style={{ ['--rise-delay' as string]: '0ms' }}>
                      Your Business Needs
                    </span>
                    <span className="hero-rotator my-1 text-[1.8rem] text-[#FF4D00] sm:text-5xl lg:text-[4rem]">
                      {ROTATOR_ITEMS.map((item, i) => (
                        <span
                          key={item}
                          style={{
                            animationDuration: `${ROTATOR_ITEMS.length * ROTATOR_SLOT}s`,
                            animationDelay: `${-i * ROTATOR_SLOT}s`,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </span>
                    <span
                      className="word-rise block"
                      style={{ ['--rise-delay' as string]: '140ms' }}
                    >
                      We Make It Happen
                    </span>
                  </span>
                </h1>
              )}
            </Editable>

            <Editable id="hero.subheadline">
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6f6e66] sm:text-xl">
                {subheadline}
              </p>
            </Editable>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href="/contact"
                className="btn-primary-pill"
                onClick={() => trackEvent('cta_click', { location: 'hero' })}
              >
                Start Your Project
              </Link>
              <Link href="/portfolio" className="btn-secondary-pill group">
                View Our Work
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Right — Interactive Quick Estimate & Direct Contact Form */}
          <aside className="lg:col-span-5 w-full">
            <div className="rounded-3xl border border-[#161613]/10 bg-gradient-to-b from-slate-50 to-white p-6 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4D00]/10 px-3 py-1 text-xs font-bold text-[#FF4D00]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Instant Project Quote
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-[#161613]">Get a Free Proposal</h3>
                </div>
                <div className="text-right">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <Clock className="h-3 w-3" />
                    Reply in 15 min
                  </span>
                </div>
              </div>

              {submitted ? (
                <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-slate-900">Request Received!</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Our team is reviewing your project details. We&apos;ll reach out within 15 minutes!
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setContactInfo('');
                      setMessage('');
                    }}
                    className="mt-4 text-xs font-bold text-[#FF4D00] underline"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                  {/* Step 1: Select Service */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      What do you need built?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_SERVICES.map((serv) => (
                        <button
                          key={serv.id}
                          type="button"
                          onClick={() => setSelectedService(serv.id)}
                          className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-all ${
                            selectedService === serv.id
                              ? 'border-[#FF4D00] bg-[#FF4D00]/5 text-[#FF4D00] ring-1 ring-[#FF4D00]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {serv.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Contact Info */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="quick-contact" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Email or Phone *
                    </label>
                    <input
                      id="quick-contact"
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="email@company.com or +1 (555) 000-0000"
                      required
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FF4D00] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/20"
                    />
                  </div>

                  {/* Step 3: Brief Description */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="quick-message" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Project Details (Optional)
                    </label>
                    <textarea
                      id="quick-message"
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Briefly describe budget, features, or timeline..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#FF4D00] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D00] font-bold text-white shadow-lg shadow-[#FF4D00]/20 transition-all hover:bg-[#e04400] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Get Free Quote &amp; Timeline
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    No obligation • 100% confidential • Direct response from engineers
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>

        {/* Hairline fact row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#e6e5de] pt-6">
          {HERO_CHIPS.map(({ icon: Icon, label }, i) => (
            <span
              key={label}
              className="inline-flex items-center gap-2.5 text-base font-semibold text-[#161613]"
            >
              <Icon
                className={`size-5 ${ACCENT_TEXT[i % 3]}`}
                aria-hidden="true"
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
