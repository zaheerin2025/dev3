import * as React from 'react';
import type { ToolMeta } from '@/data/tools/types';
import { Link } from '@/components/common/link';
import { ArrowRight } from 'lucide-react';
import { accentTile } from '@/lib/accent';
import { cn } from '@/lib/utils';

/** Card for tool grids (hub + related sections). Memoized: the tools hub
 *  re-renders up to 100 of these while the search query changes. */
export const ToolCard = React.memo(function ToolCard({ meta }: { meta: ToolMeta }) {
  return (
    <Link
      href={`/tools/${meta.slug}`}
      ariaLabel={`${meta.name} — free online tool`}
      className="card-soft card-hover group flex h-full flex-col p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', accentTile(meta.slug))}
          aria-hidden="true"
        >
          <meta.icon className="size-5" />
        </span>
        {meta.badge ? (
          <span className="rounded-full border border-[#d6d5cc] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#6f6e66]">
            {meta.badge}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold leading-snug tracking-tight text-[#161613]">
        {meta.name}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-[15px] leading-relaxed text-[#6f6e66]">{meta.blurb}</p>
      <span className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#161613]">
        Use tool
        <ArrowRight className="size-4 text-[#FF4D00] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
});
