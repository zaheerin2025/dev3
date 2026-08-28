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
 * Eyebrow pill + display title + description block used at the top of sections.
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
        <span
          className={cn(
            'mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]',
            dark
              ? 'bg-blue-400/10 text-blue-300 ring-1 ring-inset ring-blue-400/25'
              : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full', dark ? 'bg-blue-300' : 'bg-blue-500')}
            aria-hidden="true"
          />
          {eyebrow}
        </span>
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
            dark ? 'text-blue-100/70' : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
