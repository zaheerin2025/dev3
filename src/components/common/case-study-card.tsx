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

/** Category pills — one ramp color per category, used consistently site-wide. */
const CATEGORY_STYLES: Record<CaseStudyCategory, string> = {
  web: 'bg-[#FF4D00] text-white',
  ecommerce: 'bg-[#FFB020] text-[#161613]',
  apps: 'bg-[#7A5AF8] text-white',
  marketing: 'bg-[#0FA36B] text-white',
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
          <span
            className={cn(
              'absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em]',
              CATEGORY_STYLES[study.category],
            )}
          >
            {CATEGORY_LABELS[study.category]}
          </span>
        </div>
        <div className="flex h-full flex-col gap-2.5 p-7">
          <p className="eyebrow">{study.industry}</p>
          <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
            {study.title}
          </h3>
          <p className="line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{study.summary}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px] font-bold text-[#161613]">
            View case study
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f0ea] transition-colors duration-300 group-hover:bg-[#FF4D00] group-hover:text-white"
              aria-hidden="true"
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}

export { CATEGORY_LABELS, CATEGORY_STYLES };
