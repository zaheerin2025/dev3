import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface StatGridProps {
  items: { value: string; label: string }[];
  dark?: boolean;
  className?: string;
}

/** Row of big stat numbers with labels. */
export function StatGrid({ items, dark, className }: StatGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-4',
        className
      )}
    >
      {items.map((item, index) => (
        <Reveal
          key={item.label}
          delay={index * 80}
          className={cn(
            'flex flex-col items-center gap-1 rounded-2xl p-6 text-center',
            dark ? 'bg-white/5 ring-1 ring-inset ring-emerald-400/15' : 'bg-white shadow-sm ring-1 ring-inset ring-emerald-600/10'
          )}
        >
          <span className={cn('font-display text-3xl font-bold sm:text-4xl', dark ? 'text-emerald-300' : 'text-emerald-700')}>
            {item.value}
          </span>
          <span className={cn('text-sm font-medium', dark ? 'text-emerald-100/70' : 'text-muted-foreground')}>
            {item.label}
          </span>
        </Reveal>
      ))}
    </div>
  );
}
