'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <Section className="flex min-h-[calc(100svh-16rem)] items-center py-20 text-center md:py-24">
      {/* Ambient glows */}
      <span
        className="glow-orb left-[-8rem] top-[-6rem] h-72 w-72 bg-blue-400/20"
        aria-hidden="true"
      />
      <span
        className="glow-orb bottom-[-8rem] right-[-6rem] h-80 w-80 bg-cyan-400/20"
        aria-hidden="true"
      />
      <Reveal className="relative mx-auto max-w-2xl">
        <p className="font-display text-[6rem] font-black leading-none text-gradient sm:text-[8rem]">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">Page Not Found</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The page <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{path ?? '/'}</code>{' '}
          doesn&rsquo;t exist or has moved. Let&rsquo;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="min-h-[48px]">
            <Link href="/">
              Back to Home
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-[44px]">
            <Link href="/services">View Services</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-[44px]">
            <Link href="/portfolio">Browse Portfolio</Link>
          </Button>
        </div>

        {services.length > 0 ? (
          <div className="mt-12">
            <p className="text-sm font-medium text-muted-foreground">Popular services:</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
              {services.slice(0, 5).map((service) => (
                <Link
                  key={service.slug}
                  href={`/${service.slug}`}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-800 ring-1 ring-inset ring-blue-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:ring-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  {service.shortName}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-8 text-sm text-muted-foreground">
          Still lost?{' '}
          <Link href="/contact" className="font-semibold text-blue-700 hover:underline">
            Contact us
          </Link>{' '}
          and we will point you in the right direction.
        </p>
      </Reveal>
    </Section>
  );
}
