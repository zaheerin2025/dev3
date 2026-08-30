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
 * Eyebrow label + display title + description block used at the top of sections.
 * Supports **gradient span** markup: pass `**words**` inside the title to render
 * those words with the brand gradient.
 */
function renderTitle(title: string) {
  const parts = title.split('**');
  if (parts.length === 1) return title;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="text-gradient">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

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
        'mb-12 md:mb-16',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'mb-4 text-[11px] font-bold uppercase tracking-[0.22em]',
            dark ? 'text-pink-300' : 'text-purple-600'
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'text-3xl font-bold text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]',
          dark ? 'text-white' : 'text-foreground'
        )}
      >
        {renderTitle(title)}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed sm:text-lg',
            dark ? 'text-purple-100/70' : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
