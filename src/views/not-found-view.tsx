'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { services } from '@/data';

interface NotFoundViewProps {
  path?: string;
}

/** Fallback view for unknown routes. */
export function NotFoundView({ path }: NotFoundViewProps) {
  return (
    <Section className="py-24 text-center">
      <Reveal className="mx-auto max-w-2xl">
        <p className="font-display text-7xl font-bold text-emerald-600 sm:text-8xl">404</p>
        <h1 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">Page Not Found</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The page <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{path ?? '/'}</code>{' '}
          doesn&rsquo;t exist or has moved. Let&rsquo;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11">
            <Link href="/">
              Back to Home
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11">
            <Link href="/services">View Services</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11">
            <Link href="/portfolio">Browse Portfolio</Link>
          </Button>
        </div>

        {services.length > 0 ? (
          <div className="mt-12">
            <p className="text-sm font-medium text-muted-foreground">Popular services:</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {services.slice(0, 5).map((service) => (
                <Badge
                  key={service.slug}
                  asChild
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white"
                >
                  <Link href={`/${service.slug}`}>{service.shortName}</Link>
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-8 text-sm text-muted-foreground">
          Still lost?{' '}
          <Link href="/contact" className="font-semibold text-emerald-700 hover:underline">
            Contact us
          </Link>{' '}
          and we will point you in the right direction.
        </p>
      </Reveal>
    </Section>
  );
}
