'use client';

import Image from 'next/image';
import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/lib/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  dark?: boolean;
  className?: string;
}

/** Testimonial with star rating, quote, and photo (or initials fallback). */
export function TestimonialCard({ testimonial, dark, className }: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        'h-full transition-shadow hover:shadow-md',
        dark && 'border-emerald-400/15 bg-white/5 backdrop-blur',
        className
      )}
    >
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5" aria-label={`Rated ${testimonial.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <Quote className={cn('h-6 w-6', dark ? 'text-emerald-400/40' : 'text-emerald-200')} aria-hidden="true" />
        </div>
        <blockquote className={cn('text-base leading-relaxed', dark ? 'text-emerald-50/90' : 'text-foreground/90')}>
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-3 pt-2">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={`Portrait of ${testimonial.name}`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold',
                dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
              )}
              aria-hidden="true"
            >
              {testimonial.initials}
            </span>
          )}
          <span>
            <span className={cn('block text-sm font-semibold', dark ? 'text-white' : 'text-foreground')}>
              {testimonial.name}
            </span>
            <span className={cn('block text-xs', dark ? 'text-emerald-100/60' : 'text-muted-foreground')}>
              {testimonial.role}, {testimonial.company}
            </span>
          </span>
        </figcaption>
      </CardContent>
    </Card>
  );
}
