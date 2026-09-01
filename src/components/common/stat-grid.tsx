import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface StatGridProps {
  items: { value: string; label: string }[];
  dark?: boolean;
  className?: string;
}

/** Row of big accent stat numbers with labels — flat surfaces only. */
export function StatGrid({ items, dark, className }: StatGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4',
        className
      )}
    >
      {items.map((item, index) => (
        <Reveal
          key={item.label}
          delay={index * 80}
          className={cn(
            'group flex flex-col items-center gap-2 rounded-2xl px-4 py-8 text-center transition-transform duration-300 hover:-translate-y-1',
            dark
              ? 'bg-white/[0.05] ring-1 ring-inset ring-white/15'
              : 'bg-white ring-1 ring-inset ring-[#e6e5de]'
          )}
        >
          <span
            className={cn(
              'font-display text-4xl font-bold tracking-tight sm:text-5xl',
              dark ? 'text-gradient-soft' : 'text-gradient'
            )}
          >
            {item.value}
          </span>
          <span
            className={cn(
              'text-sm font-medium sm:text-[15px]',
              dark ? 'text-white/60' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </span>
        </Reveal>
      ))}
    </div>
  );
}
