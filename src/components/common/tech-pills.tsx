import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface TechPillsProps {
  items: string[];
  dark?: boolean;
  className?: string;
}

/** Styled pills for technologies/tools lists. */
export function TechPills({ items, dark, className }: TechPillsProps) {
  return (
    <Reveal className={cn('flex flex-wrap justify-center gap-2.5', className)}>
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
            dark
              ? 'bg-white/5 text-emerald-50 ring-1 ring-inset ring-emerald-400/20'
              : 'bg-white text-foreground ring-1 ring-inset ring-emerald-600/15 shadow-sm'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', dark ? 'bg-emerald-400' : 'bg-emerald-500')} aria-hidden="true" />
          {item}
        </span>
      ))}
    </Reveal>
  );
}
