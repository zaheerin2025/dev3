'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/types';
import { Link } from './link';
import { ServiceIconGlyph } from './icon-map';

interface ServiceCardProps {
  service: Service;
  showPrice?: boolean;
  className?: string;
}

/** Compact service card linking to the dedicated service page. */
export function ServiceCard({ service, showPrice = false, className }: ServiceCardProps) {
  return (
    <Link
      href={`/${service.slug}`}
      ariaLabel={`Learn more about ${service.name}`}
      className={cn('group block h-full focus-visible:outline-none', className)}
    >
      <article className="card-surface card-hover relative flex h-full flex-col gap-4 overflow-hidden p-6 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <span className="icon-tile size-12">
          <ServiceIconGlyph icon={service.icon} />
        </span>
        <div className="flex h-full flex-col gap-2">
          <h3 className="font-display text-xl font-medium text-foreground">{service.name}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          {showPrice ? (
            <span className="inline-flex items-center rounded-full border border-[#d6d5cc] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#161613]">
              From {service.startingPrice}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#161613]">
            Learn more
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f0ea] transition-colors duration-300 group-hover:bg-[#161613] group-hover:text-[#fafaf7]"
              aria-hidden="true"
            >
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}
