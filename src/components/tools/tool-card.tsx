import * as React from 'react';
import { getCategory } from '@/data/tools/types';
import type { ToolMeta } from '@/data/tools/types';
import { Link } from '@/components/common/link';
import { ArrowRight } from 'lucide-react';

/** Card for tool grids (hub + related sections). Memoized: the tools hub
 *  re-renders up to 100 of these while the search query changes. */
export const ToolCard = React.memo(function ToolCard({ meta }: { meta: ToolMeta }) {
  const category = getCategory(meta.category);
  return (
    <Link
      href={`/tools/${meta.slug}`}
      ariaLabel={`${meta.name} — free online tool`}
      className="card-soft card-hover group flex h-full flex-col rounded-[20px] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
          aria-hidden="true"
        >
          <meta.icon className="size-5" />
        </span>
        {meta.badge ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            {meta.badge}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 font-display text-[15px] font-bold leading-snug text-[#0a0a0a] transition-colors group-hover:text-emerald-700">
        {meta.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-[#4b5563]">{meta.blurb}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
        Use tool
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
});
