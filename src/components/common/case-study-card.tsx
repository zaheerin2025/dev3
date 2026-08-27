'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  web: 'bg-emerald-100 text-emerald-800',
  ecommerce: 'bg-amber-100 text-amber-800',
  apps: 'bg-teal-100 text-teal-800',
  marketing: 'bg-rose-100 text-rose-800',
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
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-emerald-600/10 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={study.coverImage}
            alt={study.coverAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge
            className={cn(
              'absolute left-3 top-3 border-none font-semibold shadow-sm',
              CATEGORY_STYLES[study.category]
            )}
          >
            {CATEGORY_LABELS[study.category]}
          </Badge>
        </div>
        <CardContent className="flex h-full flex-col gap-2 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{study.industry}</p>
          <h3 className="text-lg font-semibold leading-snug text-foreground">{study.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{study.summary}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-emerald-700">
            View case study
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

export { CATEGORY_LABELS, CATEGORY_STYLES };
