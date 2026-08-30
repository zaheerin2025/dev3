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
 * HOW WE WORK — white section, three promise cards; the middle one is
 * gradient-bordered, elevated, and sticker-tagged like the old featured card.
 */
export function PromisesSection() {
  return (
    <section id="how-we-work" className="section-white py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="HOW WE WORK"
          title="Three Promises **We Put In Writing**"
          description="Instead of cherry-picked quotes, here is exactly what working with us is like — the same rules on every project, small or large."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {PROMISES.map((promise, i) => {
            const card = (
              <article className="card-soft flex h-full flex-col p-8">
                <span className="icon-tile size-11">
                  <promise.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#0a0a0a]">{promise.title}</h3>
                <p className="mt-3 text-[#4b5563] leading-relaxed">{promise.body}</p>
                <p className="mt-auto pt-6 text-sm font-semibold text-pink-700">
                  {promise.sticker}
                </p>
              </article>
            );

            if (i === 1) {
              return (
                <Reveal key={promise.title} delay={i * 90} className="h-full">
                  <div className="gradient-border relative h-full p-1 lg:-translate-y-3">
                    <Sticker rotate={6} className="absolute -top-4 right-6">
                      ⭐ In writing
                    </Sticker>
                    {card}
                  </div>
                </Reveal>
              );
            }

            return (
              <Reveal key={promise.title} delay={i * 90} className="h-full">
                {card}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
