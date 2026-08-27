'use client';

import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-300 group-hover:shadow-lg group-hover:shadow-emerald-600/10 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="flex h-full flex-col gap-3 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <ServiceIconGlyph icon={service.icon} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
          {showPrice ? (
            <Badge variant="secondary" className="w-fit">
              From {service.startingPrice}
            </Badge>
          ) : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-emerald-700">
            Learn more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
