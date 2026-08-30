'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
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
    <figure
      className={cn(
        'relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.25rem] p-6 transition-shadow',
        dark
          ? 'border border-gray-400/15 bg-white/[0.05] backdrop-blur-sm'
          : 'card-surface',
        className
      )}
    >
      {/* Oversized decorative quote mark */}
      <span
        className={cn(
          'pointer-events-none absolute -right-2 -top-5 select-none font-display text-[7rem] font-black leading-none',
          dark ? 'text-gray-400/10' : 'text-gray-500/10'
        )}
        aria-hidden="true"
      >
        &rdquo;
      </span>
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={`Rated ${testimonial.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < testimonial.rating ? 'fill-gray-400 text-gray-400' : 'text-muted-foreground/25'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <blockquote
        className={cn(
          'relative text-[15px] leading-7',
          dark ? 'text-gray-100/90' : 'text-foreground/90'
        )}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption
        className={cn(
          'mt-auto flex items-center gap-3 border-t pt-4',
          dark ? 'border-gray-400/15' : 'border-gray-900/10'
        )}
      >
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt={`Portrait of ${testimonial.name}`}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <span
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold',
              dark
                ? 'bg-gray-400/15 text-gray-300 ring-1 ring-gray-400/25'
                : 'bg-gradient-to-br from-gray-500 to-gray-800 text-white'
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
          <span className={cn('block text-xs', dark ? 'text-gray-100/60' : 'text-muted-foreground')}>
            {testimonial.role}, {testimonial.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
