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

/**
 * Supports **italic accent** markup: pass `**words**` inside the title to
 * render those words as serif italics (the editorial accent — zero paint).
 */
function renderTitle(title: string) {
  const parts = title.split('**');
  if (parts.length === 1) return title;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className="italic">
        {part}
      </em>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

/**
 * Editorial section heading: mono eyebrow with a signal dot, oversized
 * serif display title and a muted description. Left-aligned by default;
 * pass `align="center"` for the centered variant.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  dark,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'eyebrow mb-5 inline-flex items-center gap-2.5',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="size-1.5 rounded-full bg-[#ff4d00]" aria-hidden="true" />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'font-display text-3xl font-medium leading-[1.1] tracking-[-0.01em] text-balance sm:text-4xl lg:text-5xl',
          dark ? 'text-white' : 'text-[#161613]'
        )}
      >
        {renderTitle(title)}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed sm:text-lg',
            dark ? 'text-white/60' : 'text-[#6f6e66]'
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
