'use client';

import * as React from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Sticker } from '@/components/common/sticker';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export interface PublicPortfolio {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  imageUrl: string | null;
}

/**
 * "Live builds" — real, launched client projects managed from the admin
 * panel (Portfolio tab). Renders nothing while loading fails or the
 * owner has no published entries — the page never shows fake work.
 */
export function LiveProjects() {
  const [items, setItems] = React.useState<PublicPortfolio[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/public/portfolios');
        const payload = (await response.json()) as { ok?: boolean; portfolios?: PublicPortfolio[] };
        if (!cancelled && payload?.ok && Array.isArray(payload.portfolios)) {
          setItems(payload.portfolios);
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading live projects…
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="live-builds-heading" className="section-black py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Revealish>
          <div className="flex flex-col items-start gap-4">
            <Sticker>✦ Live Builds</Sticker>
            <h2
              id="live-builds-heading"
              className="text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Launched, live &amp; <span className="text-gradient-soft">taking customers</span>
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-400">
              Real client sites you can visit right now — every one designed, built and shipped by
              our team. Click through and see them working in the wild.
            </p>
          </div>
        </Revealish>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <LiveProjectCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** White card on the black band — screenshot, category chip, honest description. */
function LiveProjectCard({ item, index }: { item: PublicPortfolio; index: number }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} — opens the live site in a new tab`}
      onClick={() => trackEvent('portfolio_live_click', { title: item.title })}
      className={cn(
        'group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
        index % 2 === 0 ? 'lg:rotate-[-0.6deg]' : 'lg:rotate-[0.6deg]'
      )}
    >
      <article className="card-soft h-full p-3 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_48px_-20px_rgb(0_0_0/0.45)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={`${item.title} website homepage`}
              loading="lazy"
              className="size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-emerald-600/10 to-emerald-500/10">
              <span className="font-display text-4xl font-bold text-emerald-600/30">
                {item.title.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#0a0a0a]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {item.category}
          </span>
        </div>
        <div className="px-3 pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 truncate font-display text-lg font-bold text-[#0a0a0a] transition-colors group-hover:text-emerald-700">
              {item.title}
            </h3>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform duration-300 group-hover:rotate-45">
              <ExternalLink className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#4b5563]">
            {item.description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            Visit live site
            <span className="text-xs font-normal text-[#4b5563]/60">
              {item.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </span>
          </span>
        </div>
      </article>
    </a>
  );
}

/** Local reveal wrapper — keeps this file self-contained. */
function Revealish({ children }: { children: React.ReactNode }) {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-40px' }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div
      ref={setRef}
      className={cn(
        'transition-all duration-700 ease-out',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      )}
    >
      {children}
    </div>
  );
}
