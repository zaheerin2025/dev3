'use client';

import * as React from 'react';
import { ChevronRight, CircleCheck, Sparkle } from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { AdSlot } from '@/components/ads/ad-slot';
import { Link } from '@/components/common/link';
import { Sticker } from '@/components/common/sticker';
import { getCategory } from '@/data/tools/types';
import type { ToolDefinition } from '@/data/tools/types';
import { ToolCard } from './tool-card';

/**
 * Shared layout for every tool page: breadcrumb → H1 → ad → interactive
 * tool → "How to use" → FAQ → related tools → ad. SEO copy comes from the
 * per-tool doc (unique per tool) rendered below the fold.
 */
export function ToolShell({ tool, related }: { tool: ToolDefinition; related: ToolDefinition[] }) {
  const category = getCategory(tool.meta.category);
  const { meta, doc } = tool;
  const Component = tool.Component;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="section-cream relative overflow-hidden py-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50" aria-hidden="true">
          <div className={`blob animate-blob left-[-6%] top-[-20%] size-64 bg-gradient-to-br ${category.gradient} md:size-80`} />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Link href="/" className="transition-colors hover:text-[#0a0a0a]">Home</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <Link href="/tools" className="transition-colors hover:text-[#0a0a0a]">Tools</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <Link href={`/tools?category=${category.id}`} className="transition-colors hover:text-[#0a0a0a]">{category.short}</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="text-[#0a0a0a]">{meta.name}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Sticker>✦ 100% Free</Sticker>
            <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${category.pill}`}>{category.label}</span>
          </div>

          <h1 className="mt-5 flex flex-wrap items-center gap-3 text-balance text-3xl font-bold tracking-tight text-[#0a0a0a] sm:text-4xl lg:text-5xl">
            <span
              className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} text-white shadow-lg sm:size-13`}
              aria-hidden="true"
            >
              <meta.icon className="size-6 sm:size-7" />
            </span>
            {meta.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#4b5563] sm:text-lg">{doc.longDescription}</p>
        </div>
      </section>

      {/* Ad — leaderboard above the tool */}
      <div className="section-white border-y border-gray-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <AdSlot format="leaderboard" />
        </div>
      </div>

      {/* Interactive tool */}
      <section className="section-white py-10 md:py-14">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="card-soft relative overflow-hidden rounded-[24px] p-5 sm:p-8 lg:p-10">
            <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${category.gradient}`} aria-hidden="true" />
            <Component />
          </div>

          {/* How to use */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-[#0a0a0a]">
                <Sparkle className="size-5 fill-yellow-300 text-yellow-300" aria-hidden="true" />
                How to use the {meta.name}
              </h2>
              <ol className="mt-5 flex flex-col gap-4">
                {doc.howTo.map((step, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${category.gradient} font-display text-sm font-bold text-white`}>
                      {i + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-[#4b5563] sm:text-[15px]">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Ad — rectangle beside the doc */}
            <div className="flex flex-col gap-6">
              <AdSlot format="rectangle" />
              <div className="card-soft p-6">
                <h3 className="font-display text-lg font-bold text-[#0a0a0a]">Why this tool is free</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Developers3 builds websites, apps and marketing systems for a living. These
                  utilities are the same ones our team uses daily — shared freely, supported by ads.
                </p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline">
                  Need help with a project? Talk to us →
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold text-[#0a0a0a]">
              {meta.name} — FAQs
            </h2>
            <Accordion type="single" collapsible className="mt-5 flex flex-col gap-3">
              {doc.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="card-soft rounded-2xl border px-5"
                >
                  <AccordionTrigger className="text-left text-sm font-bold text-[#0a0a0a] hover:no-underline sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-[#4b5563]">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Related tools */}
          <div className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-[#0a0a0a]">Related free tools</h2>
              <Link href="/tools" className="text-sm font-bold text-emerald-700 hover:underline">
                Browse all 100 →
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ToolCard key={r.meta.slug} meta={r.meta} />
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl bg-gray-50 px-6 py-5 text-xs font-semibold text-gray-500">
            {['No signup required', 'Runs in your browser where possible', 'Nothing stored on our servers', 'Free forever'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CircleCheck className="size-4 text-emerald-500" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
