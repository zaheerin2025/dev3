'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CaseStudy, CaseStudyCategory } from '@/lib/types';
import { Link } from './link';

const CATEGORY_LABELS: Record<CaseStudyCategory, string> = {
  web: 'Web',
  ecommerce: 'E-commerce',
  apps: 'Mobile App',
  marketing: 'Marketing',
};

/** Neutral ink pill for every category — the accent system needs no per-category hues. */
const CATEGORY_STYLES: Record<CaseStudyCategory, string> = {
  web: 'bg-[#161613]/90 text-[#fafaf7]',
  ecommerce: 'bg-[#161613]/90 text-[#fafaf7]',
  apps: 'bg-[#161613]/90 text-[#fafaf7]',
  marketing: 'bg-[#161613]/90 text-[#fafaf7]',
};

interface CaseStudyCardProps {
  study: CaseStudy;
  className?: string;
}

/** Portfolio card that links to the full case study page. */
export function CaseStudyCard({ study, className }: CaseStudyCardProps) {
  return (
    <Link
      href={`/portfolio/${study.slug}`}
      ariaLabel={`Read the ${study.title} case study`}
      className={cn('group block h-full focus-visible:outline-none', className)}
    >
      <article className="card-surface card-hover flex h-full flex-col overflow-hidden group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f1f0ea]">
          <Image
            src={study.coverImage}
            alt={study.coverAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <span className="absolute left-3.5 top-3.5 inline-flex items-center rounded-full bg-[#161613]/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#fafaf7]">
            {CATEGORY_LABELS[study.category]}
          </span>
        </div>
        <div className="flex h-full flex-col gap-2.5 p-6">
          <p className="eyebrow">{study.industry}</p>
          <h3 className="font-display text-xl font-medium leading-snug text-foreground">
            {study.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{study.summary}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-[#161613]">
            View case study
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f0ea] transition-colors duration-300 group-hover:bg-[#161613] group-hover:text-[#fafaf7]"
              aria-hidden="true"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}

export { CATEGORY_LABELS, CATEGORY_STYLES };
