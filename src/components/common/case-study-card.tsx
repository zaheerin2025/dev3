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

const CATEGORY_STYLES: Record<CaseStudyCategory, string> = {
  web: 'bg-gray-800/90 text-white',
  ecommerce: 'bg-gray-500/90 text-gray-950',
  apps: 'bg-gray-800/90 text-white',
  marketing: 'bg-gray-500/90 text-white',
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
      className={cn('group block h-full rounded-[1.25rem] focus-visible:outline-none', className)}
    >
      <article className="card-surface card-hover flex h-full flex-col overflow-hidden group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-100">
          <Image
            src={study.coverImage}
            alt={study.coverAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          {/* Bottom legibility gradient */}
          <span
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a]/45 to-transparent"
            aria-hidden="true"
          />
          <span
            className={cn(
              'absolute left-3.5 top-3.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm',
              CATEGORY_STYLES[study.category]
            )}
          >
            {CATEGORY_LABELS[study.category]}
          </span>
        </div>
        <div className="flex h-full flex-col gap-2.5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-800">{study.industry}</p>
          <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-gray-900">
            {study.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{study.summary}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-gray-800">
            View case study
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 transition-all duration-300 group-hover:bg-gray-800 group-hover:text-white"
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
