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
      className={cn('group block h-full rounded-[1.25rem] focus-visible:outline-none', className)}
    >
      <article className="card-surface card-hover relative flex h-full flex-col gap-4 overflow-hidden p-6 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        {/* Top accent line that brightens on hover */}
        <span
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <span className="icon-tile h-12 w-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <ServiceIconGlyph icon={service.icon} />
        </span>
        <div className="flex h-full flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          {showPrice ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
              From {service.startingPrice}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            Learn more
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white"
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
