'use client';

import { CalendarCheck2, MessageSquareText, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Sticker } from '@/components/common/sticker';

/**
 * Working principles — replaces the old testimonials band. Every claim
 * here describes how we operate (verifiable by any client during the
 * project), so the page carries no invented quotes or reviewers.
 */
const PROMISES = [
  {
    icon: CalendarCheck2,
    title: 'Fixed quotes before we start',
    body: 'You approve an itemized price and scope in writing. That number does not drift halfway through the build — and if you change the scope, you approve the new price first.',
    sticker: 'No surprise invoices',
  },
  {
    icon: MessageSquareText,
    title: 'You talk to the people building',
    body: 'No account-manager telephone game. The designer and engineer working on your project join the calls, and you get written progress updates every week.',
    sticker: 'Direct communication',
  },
  {
    icon: ShieldCheck,
    title: 'You own everything we make',
    body: 'Code, designs, domains, hosting accounts — all of it is registered to you and handed over with documentation when the project wraps.',
    sticker: 'Full handover',
  },
];

/**
 * HOW WE WORK — tinted paper band, three promise cards with ink icon
 * tiles; the middle card carries the in-writing sticker on an ink rule.
 */
export function PromisesSection() {
  return (
    <section id="how-we-work" className="section-tint py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How We Work"
          title="Three Promises **We Put In Writing**"
          description="Instead of cherry-picked quotes, here is exactly what working with us is like — the same rules on every project, small or large."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {PROMISES.map((promise, i) => (
            <Reveal key={promise.title} delay={i * 90} className="h-full">
              <article className="card-soft relative flex h-full flex-col p-8">
                {i === 1 && (
                  <Sticker className="absolute -top-3 right-6 bg-[#161613] text-[#fafaf7]">
                    In writing
                  </Sticker>
                )}
                <span className="icon-tile size-11">
                  <promise.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-medium text-[#161613]">{promise.title}</h3>
                <p className="mt-3 leading-relaxed text-[#6f6e66]">{promise.body}</p>
                <p className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-[#6f6e66]">
                  <span className="size-1 rounded-full bg-[#ff4d00]" aria-hidden="true" />
                  {promise.sticker}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
