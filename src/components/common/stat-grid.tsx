import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface StatGridProps {
  items: { value: string; label: string }[];
  dark?: boolean;
  className?: string;
}

/** Row of big gradient stat numbers with labels. */
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
            'group flex flex-col items-center gap-1.5 rounded-2xl px-4 py-7 text-center transition-transform duration-300 hover:-translate-y-1',
            dark
              ? 'bg-white/[0.05] ring-1 ring-inset ring-pink-400/20'
              : 'bg-gradient-to-b from-white to-pink-50/60 ring-1 ring-inset ring-pink-600/12 shadow-[0_1px_2px_rgb(5_19_14/0.04)]'
          )}
        >
          <span
            className={cn(
              'font-display text-4xl font-extrabold tracking-tight sm:text-[2.6rem]',
              dark ? 'text-gradient-soft' : 'text-gradient'
            )}
          >
            {item.value}
          </span>
          <span
            className={cn(
              'text-[13px] font-medium',
              dark ? 'text-pink-100/70' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </span>
        </Reveal>
      ))}
    </div>
  );
}
