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
 * Supports **accent** markup: pass `**words**` inside the title to render
 * those words in the brand accent (tangerine on light, amber on ink).
 */
function renderTitle(title: string, dark?: boolean) {
  const parts = title.split('**');
  if (parts.length === 1) return title;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className={dark ? 'not-italic text-[#FFB020]' : 'not-italic text-[#FF4D00]'}>
        {part}
      </em>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

/**
 * Section heading: eyebrow with a tangerine dot, oversized grotesk title
 * with accent words, and a roomy muted description. Left-aligned by
 * default; pass `align="center"` for the centered variant.
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
          <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-balance sm:text-5xl lg:text-6xl',
          dark ? 'text-white' : 'text-[#161613]'
        )}
      >
        {renderTitle(title, dark)}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-5 text-lg leading-relaxed sm:text-xl',
            dark ? 'text-white/60' : 'text-[#6f6e66]'
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
