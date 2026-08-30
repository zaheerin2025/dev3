'use client';

import * as React from 'react';
import { Search, Sparkle, X } from 'lucide-react';
import { Link } from '@/components/common/link';
import { Sticker } from '@/components/common/sticker';
import { FloatingShapes } from '@/components/common/floating-shapes';
import { Reveal } from '@/components/common/reveal';
import { AdSlot } from '@/components/ads/ad-slot';
import { ToolCard } from '@/components/tools/tool-card';
import { toolDefinitions } from '@/components/tools/tool-renderer';
import { TOOL_CATEGORIES, getCategory } from '@/data/tools/types';
import { navigate, useRouterStore } from '@/lib/router';

/**
 * /#/tools — the Tools Mania portal: 100 free tools, searchable and
 * filterable by category, with ad placements and unique category SEO copy.
 * The active category is deep-linkable: /#/tools?category=software.
 */
export function ToolsHubView() {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');
  // Defer the keystroke → the input stays snappy while the (memoized) card
  // grid filters on the next frame.
  const deferredQuery = React.useDeferredValue(query);

  // Category from the URL query (?category=seo) — validated against known ids.
  const hashQuery = useRouterStore((s) => s.query);
  const queryCategory = React.useMemo(() => {
    const value = new URLSearchParams(hashQuery).get('category');
    return value && TOOL_CATEGORIES.some((c) => c.id === value) ? value : 'all';
  }, [hashQuery]);

  // Keep the filter in sync when the URL changes (deep link, back/forward).
  React.useEffect(() => {
    setCategory(queryCategory);
  }, [queryCategory]);

  /** Select a category and mirror it into the URL so it can be shared. */
  const selectCategory = React.useCallback((id: string) => {
    setCategory(id);
    navigate(id === 'all' ? '/tools' : `/tools?category=${id}`);
  }, []);

  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return toolDefinitions.filter((d) => {
      if (category !== 'all' && d.meta.category !== category) return false;
      if (!q) return true;
      return (
        d.meta.name.toLowerCase().includes(q) ||
        d.meta.blurb.toLowerCase().includes(q) ||
        d.meta.slug.includes(q.replace(/\s+/g, '-'))
      );
    });
  }, [deferredQuery, category]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="section-cream relative overflow-hidden py-14 md:py-20">
        <FloatingShapes variant="subtle" />
        <div className="relative mx-auto w-full max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <Sticker rotate={-2}>✦ Tools Mania — 100 Free Utilities</Sticker>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-[#0a0a0a] sm:text-5xl lg:text-6xl">
            Free <span className="text-gradient">Tools</span> That Do{' '}
            <span className="highlighter">Real Work</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#4b5563] sm:text-lg">
            One hundred professionally built utilities for websites, apps, developer work, social
            media and business — no signup, no watermarks, no catch. Pick a tool and get it done.
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 100 tools — try “meta”, “invoice”, “QR”…"
              aria-label="Search tools"
              className="h-14 w-full rounded-full border-2 border-gray-200 bg-white pl-13 pr-12 text-[15px] font-medium text-[#0a0a0a] shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5" role="group" aria-label="Filter by category">
            <CategoryPill active={category === 'all'} onClick={() => selectCategory('all')} label={`All ${toolDefinitions.length}`} />
            {TOOL_CATEGORIES.map((c) => (
              <CategoryPill
                key={c.id}
                active={category === c.id}
                onClick={() => selectCategory(c.id)}
                label={c.short}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-sm font-semibold text-gray-500" aria-live="polite">
            Showing <span className="font-bold text-[#0a0a0a]">{filtered.length}</span> tool{filtered.length === 1 ? '' : 's'}
            {category !== 'all' ? <> in <span className="font-bold text-[#0a0a0a]">{getCategory(category).label}</span></> : null}
            {query ? <> matching “{query}”</> : null}
          </p>

          {filtered.length === 0 ? (
            <div className="card-soft mx-auto max-w-md p-10 text-center">
              <Sparkle className="mx-auto size-8 fill-gray-300 text-gray-300" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold text-[#0a0a0a]">No tools match “{query}”</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a shorter keyword, or clear the filters.</p>
              <button
                type="button"
                onClick={() => { setQuery(''); setCategory('all'); }}
                className="btn-secondary-pill-sm mt-5"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.slice(0, 12).map((d, i) => (
                <Reveal key={d.meta.slug} delay={Math.min(i, 8) * 40}>
                  <ToolCard meta={d.meta} />
                </Reveal>
              ))}
            </div>
          )}

          {filtered.length > 12 ? (
            <>
              <div className="my-8">
                <AdSlot format="leaderboard" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filtered.slice(12, 48).map((d) => (
                  <ToolCard key={d.meta.slug} meta={d.meta} />
                ))}
              </div>
              <div className="my-8">
                <AdSlot format="leaderboard" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filtered.slice(48).map((d) => (
                  <ToolCard key={d.meta.slug} meta={d.meta} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Category SEO copy — unique per category */}
      <div aria-hidden="true" className="dashed-divider mx-auto max-w-6xl" />
      <section className="section-cream py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-[#0a0a0a] sm:text-3xl">
            Explore the <span className="text-gradient">tool library</span>
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TOOL_CATEGORIES.map((c) => (
              <Reveal key={c.id}>
                <button
                  type="button"
                  onClick={() => { selectCategory(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="card-soft card-hover flex h-full w-full flex-col rounded-[20px] p-6 text-left"
                >
                  <span className={`inline-flex w-fit rounded-full bg-gradient-to-r ${c.gradient} px-3.5 py-1.5 text-xs font-bold text-white`}>
                    {c.label}
                  </span>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4b5563]">{c.description}</p>
                  <span className="mt-3 text-xs font-bold text-gray-800">
                    {toolDefinitions.filter((d) => d.meta.category === c.id).length} tools →
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          {/* Bottom CTA */}
          <Reveal>
            <div className="mt-12 overflow-hidden rounded-[24px] bg-gradient-to-r from-gray-800 to-gray-500 p-8 text-center text-white sm:p-12">
              <h2 className="font-display text-2xl font-bold sm:text-4xl">Need this built for you?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                These tools are free forever — but if you want a custom web platform, app or
                marketing system for your business, that is literally what we do.
              </p>
              <Link href="/contact" className="btn-secondary-pill mt-6">
                Get a Free Quote
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function CategoryPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
        active
          ? 'bg-[#0a0a0a] text-white shadow-md'
          : 'border-2 border-gray-200 bg-white text-gray-600 hover:border-zinc-200 hover:text-[#0a0a0a]'
      }`}
    >
      {label}
    </button>
  );
}
