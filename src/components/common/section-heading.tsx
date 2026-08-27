import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  className?: string;
}

/** Eyebrow + title + description heading block used at the top of sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  dark,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'mb-10 md:mb-14',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        className
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest',
            dark ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          'text-3xl font-bold text-balance sm:text-4xl',
          dark ? 'text-white' : 'text-foreground'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', dark ? 'text-emerald-100/70' : 'text-muted-foreground')}>
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
