'use client';

import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { JsonLd } from './json-ld';
import { Link } from './link';
import { buildBreadcrumbSchema } from '@/lib/schema';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbEntry[];
  className?: string;
}

/** Visual breadcrumbs + BreadcrumbList JSON-LD in one component. */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const schema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    ...items.map((item) => ({ name: item.label, path: item.href ?? '/' })),
  ]);

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <JsonLd data={schema} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href && index < items.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
