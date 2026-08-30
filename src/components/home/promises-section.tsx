'use client';

import { CalendarCheck2, MessageSquareText, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Sticker } from '@/components/common/sticker';
import { ACCENT_DOT, ACCENT_TILE } from '@/lib/accent';
import { cn } from '@/lib/utils';

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
 * HOW WE WORK — tinted band, three promise cards with ramp-colored icon
 * tiles; the middle card carries the ink "In writing" sticker.
 */
export function PromisesSection() {
  return (
    <section id="how-we-work" className="section-tint py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How We Work"
          title="Three Promises **We Put In Writing**"
          description="Instead of cherry-picked quotes, here is exactly what working with us is like — the same rules on every project, small or large."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {PROMISES.map((promise, i) => (
            <Reveal key={promise.title} delay={i * 90} className="h-full">
              <article className="card-soft relative flex h-full flex-col p-8">
                {i === 1 && (
                  <Sticker className="sticker-ink absolute -top-3 right-6 border-[#161613]">
                    In writing
                  </Sticker>
                )}
                <span
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xl',
                    ACCENT_TILE[i % ACCENT_TILE.length],
                  )}
                >
                  <promise.icon className="size-5.5" aria-hidden="true" />
                </span>
                <h3 className="mt-7 font-display text-2xl font-semibold tracking-tight text-[#161613]">{promise.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#6f6e66] md:text-base">{promise.body}</p>
                <p className="mt-auto inline-flex items-center gap-2.5 pt-7 font-mono text-xs uppercase tracking-[0.14em] text-[#6f6e66]">
                  <span className={cn('size-2 rounded-full', ACCENT_DOT[i % ACCENT_DOT.length])} aria-hidden="true" />
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
